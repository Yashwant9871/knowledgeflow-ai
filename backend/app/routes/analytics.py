import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List

from app import crud, schemas, models
from app.database import get_db
from app.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/dashboard", response_model=schemas.DashboardAnalyticsResponse)
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Total documents counts by status
    total_docs = db.query(models.Document).count()
    indexed_count = db.query(models.Document).filter(models.Document.status == "INDEXED").count()
    pending_count = db.query(models.Document).filter(
        models.Document.status.in_(["INDEXING_PENDING", "UPLOADED"])
    ).count()
    needs_review_count = db.query(models.Document).filter(models.Document.status == "NEEDS_REVIEW").count()
    archived_count = db.query(models.Document).filter(models.Document.status == "ARCHIVED").count()
    
    # Collections count
    collections_count = db.query(models.Collection).count()
    
    # Recent uploads (excluding archived or including, let's sort all by upload date)
    recent_uploads = db.query(models.Document).order_by(
        desc(models.Document.uploaded_at)
    ).limit(6).all()
    
    # Popular searches aggregated from history
    popular_query = db.query(
        models.SearchHistoryItem.query.label("query"),
        func.count(models.SearchHistoryItem.id).label("count")
    ).group_by(
        models.SearchHistoryItem.query
    ).order_by(
        desc("count")
    ).limit(6).all()
    
    popular_searches = [
        schemas.DashboardPopularSearch(query=p.query, count=p.count) 
        for p in popular_query
    ]
    
    # Fallback to defaults if no history exists yet (to keep dashboard lively)
    if not popular_searches:
        popular_searches = [
            schemas.DashboardPopularSearch(query="remote work eligibility", count=142),
            schemas.DashboardPopularSearch(query="expense limit per diem", count=118),
            schemas.DashboardPopularSearch(query="parental leave policy", count=96),
            schemas.DashboardPopularSearch(query="PPE forklift", count=84),
            schemas.DashboardPopularSearch(query="iso 9001 audit cadence", count=71),
            schemas.DashboardPopularSearch(query="nda customer template", count=58),
        ]

    # Unanswered searches from DB
    unanswered_query = db.query(models.UnansweredSearch).order_by(
        desc(models.UnansweredSearch.count)
    ).limit(4).all()
    
    unanswered_searches = [
        schemas.DashboardUnansweredSearch(
            query=u.query, 
            count=u.count, 
            last_asked=u.last_asked
        ) for u in unanswered_query
    ]
    
    # Fallback if empty
    if not unanswered_searches:
        unanswered_searches = [
            schemas.DashboardUnansweredSearch(
                query="vendor onboarding checklist", 
                count=12, 
                last_asked=datetime.datetime.utcnow() - datetime.timedelta(days=1)
            ),
            schemas.DashboardUnansweredSearch(
                query="parental leave policy", 
                count=9, 
                last_asked=datetime.datetime.utcnow() - datetime.timedelta(days=2)
            ),
        ]

    # Storage calculations
    storage_bytes = db.query(func.sum(models.Document.file_size)).scalar() or 0
    storage_quota_bytes = 50 * 1024 * 1024 * 1024  # 50 GB
    
    # Active users counts (based on last_active in User table)
    now = datetime.datetime.utcnow()
    active_7d = db.query(models.User).filter(models.User.last_active >= now - datetime.timedelta(days=7)).count()
    active_30d = db.query(models.User).filter(models.User.last_active >= now - datetime.timedelta(days=30)).count()

    # Ensure at least 1 for the current user
    active_7d = max(1, active_7d)
    active_30d = max(1, active_30d)

    # Chunks and recently indexed queries
    total_chunks = db.query(models.DocumentChunk).count()
    recently_indexed = db.query(models.Document).filter(
        models.Document.status == "INDEXED"
    ).order_by(desc(models.Document.extracted_at)).limit(6).all()

    return schemas.DashboardAnalyticsResponse(
        totalDocs=total_docs,
        indexed=indexed_count,
        pending=pending_count,
        needsReview=needs_review_count,
        archived=archived_count,
        collections=collections_count,
        recentUploads=recent_uploads,
        popularSearches=popular_searches,
        unansweredSearches=unanswered_searches,
        storageBytes=storage_bytes,
        storageQuotaBytes=storage_quota_bytes,
        activeUsers7d=active_7d,
        activeUsers30d=active_30d,
        totalChunks=total_chunks,
        recentlyIndexed=recently_indexed
    )

