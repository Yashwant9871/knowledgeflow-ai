from pydantic import BaseModel, EmailStr, Field, ConfigDict
from pydantic.alias_generators import to_camel
from typing import Optional, List, Dict, Any
from datetime import datetime

# Base class to handle camelCase serialization
class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True
    )

# Token Schemas
class Token(CamelModel):
    access_token: str
    token_type: str

class TokenData(CamelModel):
    email: Optional[str] = None
    role: Optional[str] = None

# User Schemas
class UserBase(CamelModel):
    name: str
    email: EmailStr
    role: str  # ADMIN, CONTENT_MANAGER, EMPLOYEE
    department: str
    status: str = "ACTIVE"
    avatar_color: str = "265"
    collection_access: List[str] = []

class UserCreate(UserBase):
    password: str

class UserUpdate(CamelModel):
    name: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    status: Optional[str] = None
    collection_access: Optional[List[str]] = None

class UserResponse(UserBase):
    id: str
    last_active: datetime

# DocVersion Schemas
class DocVersionBase(CamelModel):
    version: str
    uploaded_by: str
    notes: Optional[str] = None

class DocVersionResponse(DocVersionBase):
    id: int
    uploaded_at: datetime
    file_path: Optional[str] = None

# Collection Schemas
class CollectionBase(CamelModel):
    name: str
    description: Optional[str] = None
    owner: str
    access_level: str = "OPEN"  # OPEN, DEPARTMENT, RESTRICTED
    icon: str = "folder"

class CollectionCreate(CollectionBase):
    id: str

class CollectionUpdate(CamelModel):
    name: Optional[str] = None
    description: Optional[str] = None
    owner: Optional[str] = None
    access_level: Optional[str] = None
    icon: Optional[str] = None

class CollectionResponse(CollectionBase):
    id: str
    document_count: int = 0
    indexing_health: int = 100
    recent_activity: Optional[str] = None

# Document Schemas
class DocumentBase(CamelModel):
    title: str
    collection_id: str
    department: str
    owner: str
    tags: List[str] = []
    version: str = "1.0"
    document_type: str = "Document"
    confidentiality: str = "INTERNAL"  # PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED
    expiry_date: Optional[str] = None
    description: Optional[str] = None

class DocumentCreate(DocumentBase):
    id: Optional[str] = None

class DocumentUpdate(CamelModel):
    title: Optional[str] = None
    collection_id: Optional[str] = None
    department: Optional[str] = None
    owner: Optional[str] = None
    tags: Optional[List[str]] = None
    version: Optional[str] = None
    status: Optional[str] = None
    document_type: Optional[str] = None
    confidentiality: Optional[str] = None
    expiry_date: Optional[str] = None
    description: Optional[str] = None

class DocumentChunkResponse(CamelModel):
    id: str
    document_id: str
    chunk_index: int
    chunk_text: str
    character_count: int
    page_number: Optional[int] = None
    section_title: Optional[str] = None
    metadata_json: Dict[str, Any]
    created_at: datetime

class SearchDocumentResponse(CamelModel):
    id: str
    title: str
    collection: str
    department: str
    file_type: str
    status: str
    matching_snippet: Optional[str] = None
    matched_chunk_id: Optional[str] = None
    match_reason: Optional[str] = None
    updated_date: datetime

class DocumentResponse(DocumentBase):
    id: str
    status: str
    uploaded_at: datetime
    file_type: str
    file_size: int
    views: int
    downloads: int
    search_appearances: int
    related_document_ids: List[str] = []
    versions: List[DocVersionResponse] = []
    permissions: List[Dict[str, Any]] = []

    # Ingestion info
    extracted_text: Optional[str] = None
    extraction_status: Optional[str] = "PENDING"
    extraction_error: Optional[str] = None
    extracted_at: Optional[datetime] = None
    extraction_method: Optional[str] = None

    # Matching info for snippet highlight
    matching_snippet: Optional[str] = None
    matched_chunk_id: Optional[str] = None
    match_reason: Optional[str] = None

# ActivityEvent Schemas
class ActivityEventResponse(CamelModel):
    id: str
    type: str
    actor: str
    target: str
    target_id: Optional[str] = None
    timestamp: datetime
    detail: Optional[str] = None

# SearchHistoryItem Schemas
class SearchHistoryItemCreate(CamelModel):
    query: str
    filters: Dict[str, str] = {}
    result_count: int = 0
    matched_document_ids: List[str] = []
    clicked_document_id: Optional[str] = None

class SearchHistoryItemResponse(CamelModel):
    id: str
    query: str
    user: str
    timestamp: datetime
    filters: Dict[str, str]
    result_count: int
    matched_document_ids: List[str]
    clicked_document_id: Optional[str] = None

# Dashboard Analytics
class DashboardPopularSearch(CamelModel):
    query: str
    count: int

class DashboardUnansweredSearch(CamelModel):
    query: str
    count: int
    last_asked: datetime

class DashboardAnalyticsResponse(CamelModel):
    totalDocs: int
    indexed: int
    pending: int
    needsReview: int
    archived: int
    collections: int
    recentUploads: List[DocumentResponse]
    popularSearches: List[DashboardPopularSearch]
    unansweredSearches: List[DashboardUnansweredSearch]
    storageBytes: int
    storageQuotaBytes: int
    activeUsers7d: int
    activeUsers30d: int
    totalChunks: int = 0
    recentlyIndexed: List[DocumentResponse] = []
