import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    ForeignKey,
    JSON,
    Text,
    Float,
)
from sqlalchemy.orm import relationship

from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="EMPLOYEE", nullable=False)  # ADMIN, CONTENT_MANAGER, EMPLOYEE
    department = Column(String, nullable=False)
    status = Column(String, default="ACTIVE", nullable=False)  # ACTIVE, INVITED, SUSPENDED
    last_active = Column(DateTime, default=datetime.datetime.utcnow)
    avatar_color = Column(String, default="265")
    collection_access = Column(JSON, default=list)  # List of Collection IDs

class Collection(Base):
    __tablename__ = "collections"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    owner = Column(String, nullable=False)
    access_level = Column(String, default="OPEN")  # OPEN, DEPARTMENT, RESTRICTED
    indexing_health = Column(Integer, default=100)
    recent_activity = Column(String, nullable=True)
    icon = Column(String, default="folder")

    documents = relationship("Document", back_populates="collection", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    collection_id = Column(String, ForeignKey("collections.id"), nullable=False)
    department = Column(String, nullable=False)
    owner = Column(String, nullable=False)
    tags = Column(JSON, default=list)
    version = Column(String, default="1.0")
    status = Column(String, default="UPLOADED")  # UPLOADED, INDEXING_PENDING, INDEXING, INDEXED, INDEXING_FAILED, NEEDS_REVIEW, ARCHIVED
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, default=0)
    views = Column(Integer, default=0)
    downloads = Column(Integer, default=0)
    document_type = Column(String, default="Document")
    confidentiality = Column(String, default="INTERNAL")  # PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED
    expiry_date = Column(String, nullable=True)
    search_appearances = Column(Integer, default=0)
    related_document_ids = Column(JSON, default=list)

    # Intelligence extensions
    description = Column(Text, nullable=True)
    extracted_text = Column(Text, nullable=True)
    extraction_status = Column(String, default="PENDING")  # PENDING, EXTRACTING, EXTRACTED, FAILED
    extraction_error = Column(Text, nullable=True)
    extracted_at = Column(DateTime, nullable=True)
    extraction_method = Column(String, nullable=True)

    collection = relationship("Collection", back_populates="documents")
    versions = relationship("DocVersion", back_populates="document", cascade="all, delete-orphan")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocVersion(Base):
    __tablename__ = "doc_versions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    version = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)
    uploaded_by = Column(String, nullable=False)
    notes = Column(String, nullable=True)
    file_path = Column(String, nullable=True)

    document = relationship("Document", back_populates="versions")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String, primary_key=True, index=True)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    chunk_text = Column(Text, nullable=False)
    character_count = Column(Integer, nullable=False)
    page_number = Column(Integer, nullable=True)
    section_title = Column(String, nullable=True)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    document = relationship("Document", back_populates="chunks")


class ActivityEvent(Base):
    __tablename__ = "activity_events"

    id = Column(String, primary_key=True, index=True)
    type = Column(String, nullable=False)  # UPLOAD, VIEW, DOWNLOAD, METADATA_EDIT, PERMISSION_CHANGE, COLLECTION_UPDATE, ARCHIVE, INDEX_COMPLETE
    actor = Column(String, nullable=False)
    target = Column(String, nullable=False)
    target_id = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    detail = Column(String, nullable=True)

class SearchHistoryItem(Base):
    __tablename__ = "search_history_items"

    id = Column(String, primary_key=True, index=True)
    query = Column(String, nullable=False)
    user = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    filters = Column(JSON, default=dict)
    result_count = Column(Integer, default=0)
    matched_document_ids = Column(JSON, default=list)
    clicked_document_id = Column(String, nullable=True)

class UnansweredSearch(Base):
    __tablename__ = "unanswered_searches"

    id = Column(Integer, primary_key=True, autoincrement=True)
    query = Column(String, unique=True, index=True, nullable=False)
    count = Column(Integer, default=1)
    last_asked = Column(DateTime, default=datetime.datetime.utcnow)
