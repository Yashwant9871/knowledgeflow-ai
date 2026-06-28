import os
import re
import json
import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app import crud, schemas, models
from app.database import get_db
from app.auth import get_current_user, RoleChecker
from app.config import settings
from app.services.indexing import run_indexing_pipeline

router = APIRouter(prefix="/documents", tags=["documents"])


write_access = RoleChecker(["ADMIN", "CONTENT_MANAGER"])

def sanitize_filename(filename: str) -> str:
    # Remove any directory path components
    base = os.path.basename(filename)
    # Allow alphanumeric characters, underscores, hyphens, periods
    clean = re.sub(r'[^a-zA-Z0-9_.-]', '_', base)
    # Ensure it's not empty
    if not clean or clean in ('.', '..'):
        clean = f"file_{uuid.uuid4().hex[:8]}"
    return clean

def validate_and_save_upload(file: UploadFile) -> tuple[str, int, str]:
    # 1. Sanitize file name
    clean_name = sanitize_filename(file.filename)
    
    # 2. Check extension
    ext = clean_name.split('.')[-1].lower() if '.' in clean_name else ''
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File extension '.{ext}' is not allowed. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    # 3. Check file size
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    if size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds limit of {settings.MAX_UPLOAD_SIZE // (1024*1024)}MB"
        )
        
    # 4. Directory safety check
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    abs_upload_dir = os.path.abspath(settings.UPLOAD_DIR)
    
    # Prevent duplicate name collisions by appending UUID segment
    name_parts = clean_name.rsplit('.', 1)
    if len(name_parts) == 2:
        unique_name = f"{name_parts[0]}_{uuid.uuid4().hex[:6]}.{name_parts[1]}"
    else:
        unique_name = f"{clean_name}_{uuid.uuid4().hex[:6]}"
        
    abs_dest_path = os.path.abspath(os.path.join(abs_upload_dir, unique_name))
    if not abs_dest_path.startswith(abs_upload_dir):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid upload directory traversal path detected"
        )
        
    # Save the file
    with open(abs_dest_path, "wb") as f:
        # Stream read/write to handle memory safety
        while True:
            chunk = file.file.read(1024 * 1024)
            if not chunk:
                break
            f.write(chunk)
            
    return clean_name, size, abs_dest_path

@router.get("", response_model=List[schemas.DocumentResponse])
def read_documents(
    q: Optional[str] = None,
    collectionId: Optional[str] = None,
    department: Optional[str] = None,
    documentType: Optional[str] = None,
    tag: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Perform retrieval
    docs = crud.get_documents(
        db, 
        q=q, 
        collection_id=collectionId, 
        department=department, 
        document_type=documentType, 
        tag=tag, 
        status=status
    )
    
    # Filter by user collection access constraints if not admin
    if current_user.role != "ADMIN":
        docs = [d for d in docs if d.collection_id in current_user.collection_access]
        
    # Log search query and results to search history
    if q is not None:
        filters = {}
        if collectionId:
            filters["collection"] = collectionId
        if department:
            filters["department"] = department
        if documentType:
            filters["documentType"] = documentType
        if tag:
            filters["tag"] = tag
            
        matched_ids = [d.id for d in docs]
        
        # Log to db
        crud.log_search(
            db, 
            user=current_user.name, 
            query=q, 
            filters=filters, 
            result_count=len(docs), 
            matched_document_ids=matched_ids
        )
        
        # Increment search appearances for matched documents
        for doc in docs:
            doc.search_appearances += 1
        db.commit()

        # Compile snippets and matching details
        q_clean = q.lower().strip()
        for doc in docs:
            # 1. Title match
            if q_clean in doc.title.lower():
                doc.match_reason = "Title match"
                doc.matching_snippet = f"Title contains match: {doc.title}"
            # 2. Tag match
            elif any(q_clean in t.lower() for t in doc.tags):
                doc.match_reason = "Tag match"
                matching_tags = [t for t in doc.tags if q_clean in t.lower()]
                doc.matching_snippet = f"Matches tag: {', '.join(matching_tags)}"
            # 3. Description match
            elif doc.description and q_clean in doc.description.lower():
                doc.match_reason = "Metadata match"
                doc.matching_snippet = doc.description
            # 4. Chunk match (relevance content match)
            else:
                # Find matching chunk text
                chunk = db.query(models.DocumentChunk).filter(
                    models.DocumentChunk.document_id == doc.id,
                    func.lower(models.DocumentChunk.chunk_text).contains(q_clean)
                ).first()
                if chunk:
                    doc.matched_chunk_id = chunk.id
                    doc.match_reason = f"Content match (Chunk #{chunk.chunk_index + 1})"
                    
                    # Window context around match
                    text_lower = chunk.chunk_text.lower()
                    idx = text_lower.find(q_clean)
                    start = max(0, idx - 45)
                    end = min(len(chunk.chunk_text), idx + len(q_clean) + 55)
                    snippet = ("..." if start > 0 else "") + chunk.chunk_text[start:end] + ("..." if end < len(chunk.chunk_text) else "")
                    doc.matching_snippet = snippet
                # 5. Extracted Text match fallback
                elif doc.extracted_text and q_clean in doc.extracted_text.lower():
                    doc.match_reason = "Extracted content match"
                    text_lower = doc.extracted_text.lower()
                    idx = text_lower.find(q_clean)
                    start = max(0, idx - 45)
                    end = min(len(doc.extracted_text), idx + len(q_clean) + 55)
                    snippet = ("..." if start > 0 else "") + doc.extracted_text[start:end] + ("..." if end < len(doc.extracted_text) else "")
                    doc.matching_snippet = snippet
                # 6. Fallback default
                else:
                    doc.match_reason = "Metadata matches description"
                    doc.matching_snippet = doc.description or "No content preview available."

    return docs


@router.get("/{doc_id}", response_model=schemas.DocumentResponse)
def read_document(doc_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    doc = crud.get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Access checks
    if current_user.role != "ADMIN" and doc.collection_id not in current_user.collection_access:
        raise HTTPException(status_code=403, detail="Access denied to this document collection")
        
    # Increment views
    doc.views += 1
    db.commit()
    
    # Audit log view action
    crud.log_activity(
        db,
        actor=current_user.name,
        type="VIEW",
        target=doc.title,
        target_id=doc.id
    )
    
    return doc

@router.post("/upload", response_model=schemas.DocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_document(
    title: str = Form(...),
    collection_id: str = Form(...),
    department: str = Form(...),
    owner: str = Form(...),
    tags: str = Form("[]"),  # JSON array string or comma separated
    version: str = Form("1.0"),
    document_type: str = Form("Document"),
    confidentiality: str = Form("INTERNAL"),
    expiry_date: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(write_access)
):
    # Parse tags
    try:
        parsed_tags = json.loads(tags)
        if not isinstance(parsed_tags, list):
            parsed_tags = [str(parsed_tags)]
    except Exception:
        parsed_tags = [t.strip() for t in tags.split(",") if t.strip()]

    # Validate file and save it
    original_name, file_size, saved_path = validate_and_save_upload(file)
    file_type = original_name.split('.')[-1].upper() if '.' in original_name else 'FILE'

    # Create document
    doc_create = schemas.DocumentCreate(
        title=title,
        collection_id=collection_id,
        department=department,
        owner=owner,
        tags=parsed_tags,
        version=version,
        document_type=document_type,
        confidentiality=confidentiality,
        expiry_date=expiry_date
    )
    
    doc = crud.create_document(
        db, 
        doc_in=doc_create, 
        file_type=file_type, 
        file_size=file_size, 
        file_path=saved_path
    )
    
    # Audit log upload
    crud.log_activity(
        db,
        actor=current_user.name,
        type="UPLOAD",
        target=doc.title,
        target_id=doc.id,
        detail=f"File uploaded: {original_name} ({file_size} bytes)"
    )
    
    return doc

@router.get("/{doc_id}/download")
def download_document(doc_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    doc = crud.get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Access checks
    if current_user.role != "ADMIN" and doc.collection_id not in current_user.collection_access:
        raise HTTPException(status_code=403, detail="Access denied to this document collection")
        
    # Get latest version path
    latest_version = db.query(models.DocVersion).filter(
        models.DocVersion.document_id == doc.id
    ).order_by(models.DocVersion.uploaded_at.desc()).first()
    
    if not latest_version or not latest_version.file_path or not os.path.exists(latest_version.file_path):
        # Return a demo fallback if file is not physically on disk (e.g. from seeds)
        # Create a mock file on the fly if needed
        fallback_path = os.path.join(settings.UPLOAD_DIR, "demo_fallback.txt")
        if not os.path.exists(fallback_path):
            os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
            with open(fallback_path, "w") as f:
                f.write(f"This is a fallback placeholder for document '{doc.title}'.")
        path_to_send = fallback_path
    else:
        path_to_send = latest_version.file_path

    # Increment downloads
    doc.downloads += 1
    db.commit()
    
    # Audit log download
    crud.log_activity(
        db,
        actor=current_user.name,
        type="DOWNLOAD",
        target=doc.title,
        target_id=doc.id
    )
    
    return FileResponse(
        path=path_to_send,
        filename=f"{doc.title}.{doc.file_type.lower()}",
        media_type="application/octet-stream"
    )

@router.put("/{doc_id}", response_model=schemas.DocumentResponse)
def update_document_metadata(
    doc_id: str,
    doc_in: schemas.DocumentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(write_access)
):
    doc = crud.get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # If version changed, append a new version entry
    old_version = doc.version
    updated_doc = crud.update_document(db, doc, doc_in)
    
    if doc_in.version and doc_in.version != old_version:
        crud.add_document_version(
            db, 
            document=updated_doc, 
            version=doc_in.version, 
            uploaded_by=current_user.name, 
            notes="Metadata and version bump"
        )
        
    # Audit log metadata edit
    crud.log_activity(
        db,
        actor=current_user.name,
        type="METADATA_EDIT",
        target=updated_doc.title,
        target_id=updated_doc.id,
        detail=f"Updated properties: {list(doc_in.dict(exclude_unset=True).keys())}"
    )
    
    return updated_doc

@router.post("/{doc_id}/archive", response_model=schemas.DocumentResponse)
def archive_document(doc_id: str, db: Session = Depends(get_db), current_user=Depends(write_access)):
    doc = crud.get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    doc.status = "ARCHIVED"
    db.commit()
    
    # Audit log archive
    crud.log_activity(
        db,
        actor=current_user.name,
        type="ARCHIVE",
        target=doc.title,
        target_id=doc.id
    )
    
    return doc

@router.put("/{doc_id}/permissions", response_model=schemas.DocumentResponse)
def change_document_permissions(
    doc_id: str,
    permission_in: dict,
    db: Session = Depends(get_db),
    current_user=Depends(write_access)
):
    doc = crud.get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Write permission change logs (in this demo permissions are derived via role matching)
    crud.log_activity(
        db,
        actor=current_user.name,
        type="PERMISSION_CHANGE",
        target=doc.title,
        target_id=doc.id,
        detail=f"Permissions modified: {json.dumps(permission_in)}"
    )
    
    return doc

@router.post("/{doc_id}/index", response_model=schemas.DocumentResponse)
def index_document(doc_id: str, db: Session = Depends(get_db), current_user=Depends(write_access)):
    success = run_indexing_pipeline(db, doc_id, current_user.name)
    doc = crud.get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=doc.extraction_error or "Indexing pipeline run failed."
        )
    return doc

@router.post("/{doc_id}/reindex", response_model=schemas.DocumentResponse)
def reindex_document(doc_id: str, db: Session = Depends(get_db), current_user=Depends(write_access)):
    # Log Reindexed Activity before starting
    doc = crud.get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    crud.log_activity(
        db,
        actor=current_user.name,
        type="DOCUMENT_REINDEXED",
        target=doc.title,
        target_id=doc.id,
        detail="Manual reindexing triggered by content manager/admin"
    )
    
    success = run_indexing_pipeline(db, doc_id, current_user.name)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=doc.extraction_error or "Reindexing pipeline run failed."
        )
    return doc

@router.get("/{doc_id}/chunks", response_model=List[schemas.DocumentChunkResponse])
def read_document_chunks(doc_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    doc = crud.get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Access checks
    if current_user.role != "ADMIN" and doc.collection_id not in current_user.collection_access:
        raise HTTPException(status_code=403, detail="Access denied to this document's chunks")
        
    chunks = db.query(models.DocumentChunk).filter(
        models.DocumentChunk.document_id == doc_id
    ).order_by(models.DocumentChunk.chunk_index).all()
    return chunks

@router.get("/{doc_id}/indexing-status")
def read_indexing_status(doc_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    doc = crud.get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Access checks
    if current_user.role != "ADMIN" and doc.collection_id not in current_user.collection_access:
        raise HTTPException(status_code=403, detail="Access denied to status info")
        
    return {
        "status": doc.status,
        "extractionStatus": doc.extraction_status,
        "extractionError": doc.extraction_error,
        "extractedAt": doc.extracted_at,
        "extractionMethod": doc.extraction_method
    }

