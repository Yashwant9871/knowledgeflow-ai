from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from app import crud, schemas, models
from app.database import get_db
from app.auth import get_current_user

router = APIRouter(prefix="/search-history", tags=["search-history"])

@router.get("", response_model=List[schemas.SearchHistoryItemResponse])
def read_search_history(
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Fetch search items descending by timestamp
    items = db.query(models.SearchHistoryItem).order_by(
        desc(models.SearchHistoryItem.timestamp)
    ).limit(limit).all()
    return items
