from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import crud, schemas
from app.database import get_db
from app.auth import get_current_user, RoleChecker

router = APIRouter(prefix="/users", tags=["users"])

# Enforce ADMIN role on all endpoints in this router
admin_only = RoleChecker(["ADMIN"])

@router.get("", response_model=List[schemas.UserResponse])
def read_users(db: Session = Depends(get_db), current_user=Depends(admin_only)):
    return crud.get_users(db)

@router.post("", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_new_user(
    user_in: schemas.UserCreate, 
    db: Session = Depends(get_db), 
    current_user=Depends(admin_only)
):
    db_user = crud.get_user_by_email(db, user_in.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists."
        )
    user = crud.create_user(db, user_in)
    
    # Audit log
    crud.log_activity(
        db,
        actor=current_user.name,
        type="PERMISSION_CHANGE",
        target=f"User {user.name}",
        target_id=user.id,
        detail=f"Created user with role: {user.role}"
    )
    return user

@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_existing_user(
    user_id: str,
    user_in: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(admin_only)
):
    db_user = db.query(crud.models.User).filter(crud.models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    old_role = db_user.role
    old_status = db_user.status
    
    updated_user = crud.update_user(db, db_user, user_in)
    
    # Audit log if role or status changed
    detail_msg = []
    if user_in.role and user_in.role != old_role:
        detail_msg.append(f"role updated from {old_role} to {user_in.role}")
    if user_in.status and user_in.status != old_status:
        detail_msg.append(f"status updated from {old_status} to {user_in.status}")
        
    if detail_msg:
        crud.log_activity(
            db,
            actor=current_user.name,
            type="PERMISSION_CHANGE",
            target=f"User {updated_user.name}",
            target_id=updated_user.id,
            detail="; ".join(detail_msg)
        )
        
    return updated_user
