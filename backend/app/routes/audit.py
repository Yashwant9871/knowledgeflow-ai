from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from app import crud, schemas, models
from app.database import get_db
from app.auth import RoleChecker

router = APIRouter(prefix="/audit", tags=["audit"])

# Restrict to ADMIN and CONTENT_MANAGER
audit_access = RoleChecker(["ADMIN", "CONTENT_MANAGER"])

@router.get("", response_model=List[schemas.ActivityEventResponse])
def read_audit_log(
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(audit_access)
):
    # Fetch events sorted by timestamp descending
    events = db.query(models.ActivityEvent).order_by(
        desc(models.ActivityEvent.timestamp)
    ).limit(limit).all()
    return events
