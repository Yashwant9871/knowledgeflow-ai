from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app import crud, schemas, models
from app.database import get_db
from app.auth import get_current_user, RoleChecker

router = APIRouter(prefix="/collections", tags=["collections"])

write_access = RoleChecker(["ADMIN", "CONTENT_MANAGER"])

@router.get("", response_model=List[schemas.CollectionResponse])
def read_collections(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    collections = crud.get_collections(db)
    
    # Enrich collections with dynamic document count from DB
    res = []
    for col in collections:
        doc_count = db.query(models.Document).filter(
            models.Document.collection_id == col.id,
            models.Document.status != "ARCHIVED"
        ).count()
        
        # Calculate recent activity on the collection (e.g. from documents uploaded_at)
        recent_doc = db.query(models.Document).filter(
            models.Document.collection_id == col.id
        ).order_by(models.Document.uploaded_at.desc()).first()
        
        recent_act = "No recent updates"
        if recent_doc:
            diff = (crud.datetime.datetime.utcnow() - recent_doc.uploaded_at)
            if diff.days > 0:
                recent_act = f"{diff.days} days ago"
            elif diff.seconds // 3600 > 0:
                recent_act = f"{diff.seconds // 3600} hours ago"
            else:
                recent_act = f"{max(1, diff.seconds // 60)} minutes ago"
                
        res.append(
            schemas.CollectionResponse(
                id=col.id,
                name=col.name,
                description=col.description,
                owner=col.owner,
                access_level=col.access_level,
                icon=col.icon,
                indexing_health=col.indexing_health,
                document_count=doc_count,
                recent_activity=recent_act
            )
        )
    return res

@router.get("/{collection_id}", response_model=schemas.CollectionResponse)
def read_collection(collection_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    col = crud.get_collection(db, collection_id)
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found")
        
    doc_count = db.query(models.Document).filter(
        models.Document.collection_id == col.id,
        models.Document.status != "ARCHIVED"
    ).count()
    
    # Calculate recent activity
    recent_doc = db.query(models.Document).filter(
        models.Document.collection_id == col.id
    ).order_by(models.Document.uploaded_at.desc()).first()
    
    recent_act = "No recent updates"
    if recent_doc:
        diff = (crud.datetime.datetime.utcnow() - recent_doc.uploaded_at)
        if diff.days > 0:
            recent_act = f"{diff.days} days ago"
        elif diff.seconds // 3600 > 0:
            recent_act = f"{diff.seconds // 3600} hours ago"
        else:
            recent_act = f"{max(1, diff.seconds // 60)} minutes ago"

    return schemas.CollectionResponse(
        id=col.id,
        name=col.name,
        description=col.description,
        owner=col.owner,
        access_level=col.access_level,
        icon=col.icon,
        indexing_health=col.indexing_health,
        document_count=doc_count,
        recent_activity=recent_act
    )

@router.post("", response_model=schemas.CollectionResponse, status_code=status.HTTP_201_CREATED)
def create_collection(
    collection_in: schemas.CollectionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(write_access)
):
    existing = crud.get_collection(db, collection_in.id)
    if existing:
        raise HTTPException(status_code=400, detail="Collection ID already exists")
        
    col = crud.create_collection_idempotent(db, collection_in)
    
    crud.log_activity(
        db,
        actor=current_user.name,
        type="COLLECTION_UPDATE",
        target=col.name,
        target_id=col.id,
        detail=f"Created collection: {col.name}"
    )
    
    return col

@router.put("/{collection_id}", response_model=schemas.CollectionResponse)
def update_collection(
    collection_id: str,
    collection_in: schemas.CollectionUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(write_access)
):
    col = crud.get_collection(db, collection_id)
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found")
        
    # Update fields
    update_data = collection_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(col, field, value)
    db.commit()
    db.refresh(col)
    
    crud.log_activity(
        db,
        actor=current_user.name,
        type="COLLECTION_UPDATE",
        target=col.name,
        target_id=col.id,
        detail=f"Updated collection fields: {list(update_data.keys())}"
    )
    
    return col
