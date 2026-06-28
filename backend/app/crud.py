import uuid
import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, func

from app import models, schemas
from app.auth import get_password_hash

# --- Audit Logs ---
def log_activity(
    db: Session,
    actor: str,
    type: str,
    target: str,
    target_id: str = None,
    detail: str = None
) -> models.ActivityEvent:
    event = models.ActivityEvent(
        id=f"a-{uuid.uuid4().hex[:8]}",
        type=type,
        actor=actor,
        target=target,
        target_id=target_id,
        timestamp=datetime.datetime.utcnow(),
        detail=detail
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

# --- Search History & Gaps ---
def log_search(
    db: Session,
    user: str,
    query: str,
    filters: dict,
    result_count: int,
    matched_document_ids: list,
    clicked_document_id: str = None
) -> models.SearchHistoryItem:
    item = models.SearchHistoryItem(
        id=f"s-{uuid.uuid4().hex[:8]}",
        query=query,
        user=user,
        timestamp=datetime.datetime.utcnow(),
        filters=filters,
        result_count=result_count,
        matched_document_ids=matched_document_ids,
        clicked_document_id=clicked_document_id
    )
    db.add(item)

    if result_count == 0 and query.strip():
        # Upsert unanswered search
        unanswered = db.query(models.UnansweredSearch).filter(
            func.lower(models.UnansweredSearch.query) == func.lower(query.strip())
        ).first()
        if unanswered:
            unanswered.count += 1
            unanswered.last_asked = datetime.datetime.utcnow()
        else:
            new_unanswered = models.UnansweredSearch(
                query=query.strip(),
                count=1,
                last_asked=datetime.datetime.utcnow()
            )
            db.add(new_unanswered)
            
    db.commit()
    db.refresh(item)
    return item

# --- Users ---
def get_user_by_email(db: Session, email: str) -> models.User:
    return db.query(models.User).filter(func.lower(models.User.email) == func.lower(email)).first()

def get_users(db: Session) -> list[models.User]:
    return db.query(models.User).all()

def create_user(db: Session, user_in: schemas.UserCreate) -> models.User:
    db_user = models.User(
        id=f"u-{uuid.uuid4().hex[:8]}",
        name=user_in.name,
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
        department=user_in.department,
        status=user_in.status,
        avatar_color=user_in.avatar_color,
        collection_access=user_in.collection_access
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, db_user: models.User, user_in: schemas.UserUpdate) -> models.User:
    update_data = user_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Collections ---
def get_collection(db: Session, collection_id: str) -> models.Collection:
    return db.query(models.Collection).filter(models.Collection.id == collection_id).first()

def get_collections(db: Session) -> list[models.Collection]:
    return db.query(models.Collection).all()

def create_collection_idempotent(db: Session, collection_in: schemas.CollectionCreate) -> models.Collection:
    existing = db.query(models.Collection).filter(models.Collection.id == collection_in.id).first()
    if existing:
        # Update details
        existing.name = collection_in.name
        existing.description = collection_in.description
        existing.owner = collection_in.owner
        existing.access_level = collection_in.access_level
        existing.icon = collection_in.icon
        db.commit()
        db.refresh(existing)
        return existing
    
    db_col = models.Collection(
        id=collection_in.id,
        name=collection_in.name,
        description=collection_in.description,
        owner=collection_in.owner,
        access_level=collection_in.access_level,
        icon=collection_in.icon,
        indexing_health=100
    )
    db.add(db_col)
    db.commit()
    db.refresh(db_col)
    return db_col

# --- Documents ---
def get_document(db: Session, doc_id: str) -> models.Document:
    return db.query(models.Document).filter(models.Document.id == doc_id).first()

def get_documents(
    db: Session,
    q: str = None,
    collection_id: str = None,
    department: str = None,
    document_type: str = None,
    tag: str = None,
    status: str = None
) -> list[models.Document]:
    query = db.query(models.Document)

    # Apply filters
    if collection_id:
        query = query.filter(models.Document.collection_id == collection_id)
    if department:
        query = query.filter(models.Document.department == department)
    if document_type:
        query = query.filter(models.Document.document_type == document_type)
    if status:
        query = query.filter(models.Document.status == status)
    
    if tag:
        # Simple JSON search or tag matching
        from sqlalchemy import String
        query = query.filter(models.Document.tags.cast(String).contains(tag))

    # Keyword search
    if q:
        q_clean = q.lower().strip()
        from sqlalchemy import String, or_
        
        # 1. Match documents directly by title, description, tags, and extracted_text
        doc_matches = db.query(models.Document.id).filter(
            or_(
                func.lower(models.Document.title).contains(q_clean),
                func.lower(models.Document.description).contains(q_clean),
                models.Document.tags.cast(String).contains(q_clean),
                func.lower(models.Document.extracted_text).contains(q_clean)
            )
        ).all()
        matched_ids = {r[0] for r in doc_matches}

        # 2. Match documents via Collection name
        col_matches = db.query(models.Document.id).join(models.Collection).filter(
            func.lower(models.Collection.name).contains(q_clean)
        ).all()
        matched_ids.update({r[0] for r in col_matches})

        # 3. Match documents via Chunks
        chunk_matches = db.query(models.DocumentChunk.document_id).filter(
            func.lower(models.DocumentChunk.chunk_text).contains(q_clean)
        ).all()
        matched_ids.update({r[0] for r in chunk_matches})

        # Filter query by accumulated matching IDs
        if matched_ids:
            query = query.filter(models.Document.id.in_(list(matched_ids)))
        else:
            return []  # Return empty if no matches
    
    return query.all()



def create_document(db: Session, doc_in: schemas.DocumentCreate, file_type: str, file_size: int, file_path: str = None) -> models.Document:
    doc_id = doc_in.id or f"d-{uuid.uuid4().hex[:8]}"
    db_doc = models.Document(
        id=doc_id,
        title=doc_in.title,
        collection_id=doc_in.collection_id,
        department=doc_in.department,
        owner=doc_in.owner,
        tags=doc_in.tags,
        version=doc_in.version,
        status="INDEXED" if doc_in.confidentiality != "RESTRICTED" else "INDEXING_PENDING",
        file_type=file_type,
        file_size=file_size,
        document_type=doc_in.document_type,
        confidentiality=doc_in.confidentiality,
        expiry_date=doc_in.expiry_date
    )
    db.add(db_doc)

    # Initial version
    db_version = models.DocVersion(
        document_id=doc_id,
        version=doc_in.version,
        uploaded_by=doc_in.owner,
        notes="Initial upload",
        file_path=file_path
    )
    db.add(db_version)
    
    db.commit()
    db.refresh(db_doc)
    return db_doc

def add_document_version(db: Session, document: models.Document, version: str, uploaded_by: str, notes: str, file_path: str = None) -> models.DocVersion:
    db_version = models.DocVersion(
        document_id=document.id,
        version=version,
        uploaded_by=uploaded_by,
        notes=notes,
        file_path=file_path
    )
    db.add(db_version)
    document.version = version
    db.commit()
    db.refresh(document)
    return db_version

def update_document(db: Session, db_doc: models.Document, doc_in: schemas.DocumentUpdate) -> models.Document:
    update_data = doc_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_doc, field, value)
    db.commit()
    db.refresh(db_doc)
    return db_doc
