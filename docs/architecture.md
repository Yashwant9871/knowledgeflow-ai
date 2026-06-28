# Architecture Overview

This document details the high-level system architecture, component design, and integration layers of KnowledgeFlow AI.

## High-Level System Architecture

KnowledgeFlow AI is structured as a decoupled, multi-tier web application built for horizontal scalability, fast retrieval, and secure governance:

```mermaid
graph TD
    User([Enterprise User / Admin]) <--> |HTTPS / JSON| FE[React Vite Client]
    FE <--> |REST API / JWT| BE[FastAPI Application Server]
    
    subgraph BE_Container [FastAPI Application Server]
        Auth[Auth Service / RBAC]
        API[API Routers]
        Extractor[Extraction Service]
        Chunker[Chunking Engine]
        Auditor[Audit Trail Logger]
    end

    BE_Container <--> |SQL / pg_trgm| DB[(PostgreSQL 16 Database)]
    BE_Container <--> |PubSub / Index Queues| Cache[(Redis Cache & Queue)]
    
    subgraph Storage [File Storage]
        Disk[Local / Network Volume]
    end
    BE_Container --> |Multipart Write / Stream Read| Disk
```

---

## Key System Components

### 1. Frontend Client Tier
* **Technology**: React 18, Vite, TypeScript, TanStack Start & React Router.
* **Responsibilities**:
  * Render the Lovable UI design system.
  * Manage JWT storage (`localStorage`) and inject bearer credentials into API request headers.
  * Handle client-side routing, filtering (by collection, department, file type, or tags), and dashboard metrics rendering.
  * Enforce UI-level RBAC (hiding administration controls or reindex actions from Employee accounts).

### 2. Backend Application Tier
* **Technology**: Python 3.11, FastAPI, SQLAlchemy 2.0, Alembic, python-jose, bcrypt.
* **Responsibilities**:
  * **REST API**: Exposes versioned endpoints (`/api/v1`) for authentication, metadata retrieval, auditing, collections management, and file streams.
  * **Security & RBAC**: Decodes JWTs, validates scopes, and checks user rights via parameterized FastAPI dependency injectors.
  * **Text Extraction Service**: Traps PDF, Word, and text file uploads, extracting raw text and reporting compatibility metrics.
  * **Chunking Engine**: Segments raw text into paragraph-bounded units for precise citation searching.
  * **Audit Layer**: Generates immutable audit events (such as logins, views, downloads, uploads, reindexing, or zero-result searches).

### 3. Database Tier
* **Technology**: PostgreSQL 16.
* **Responsibilities**:
  * Acts as the single source of truth for schemas, migrations, metadata, and chunk text.
  * Implements `pg_trgm` (trigram) indexes for fast keyword search across large text documents without requiring heavy external search servers (e.g. Elasticsearch).

### 4. Cache & Queue Tier
* **Technology**: Redis 7.
* **Responsibilities**:
  * Configured as the message broker for future asynchronous worker engines.
  * Tracks processing statuses and job coordinates.

---

## Data Pipeline Flow (Upload to Indexed Search)

The sequence diagram below displays the ingestion, parsing, chunking, database mapping, and search retrieval lifecycle:

```mermaid
sequenceDiagram
    autonumber
    actor User as Client / Browser
    participant API as FastAPI Router
    participant DB as PostgreSQL
    participant File as Disk Storage
    participant Pipeline as Indexing Pipeline
    participant Extractor as Text Extractor
    participant Chunker as Chunker Engine

    User->>API: POST /documents/upload (Multipart File)
    API->>File: Write file to secure storage directory
    API->>DB: Insert Document & DocVersion records (UPLOADED)
    API->>User: Return Document metadata
    
    Note over API, Pipeline: Indexing can be triggered automatically or manually
    User->>API: POST /documents/{id}/index
    API->>Pipeline: Trigger indexing pipeline (INDEXING)
    Pipeline->>Extractor: Pass file path & type
    Extractor-->>Pipeline: Return raw extracted text & method
    Pipeline->>Chunker: Pass extracted text
    Chunker-->>Pipeline: Return paragraph-bounded text chunks
    Pipeline->>DB: Clear old chunks & insert new DocumentChunk records
    Pipeline->>DB: Update document status to INDEXED
    Pipeline->>DB: Log DOCUMENT_INDEXED audit event
    
    Note over User, DB: Search Flow
    User->>API: GET /documents?q=keyword
    API->>DB: Query title, tags, description, collections, and chunks
    DB-->>API: Return matching records & text chunks
    API->>API: Extract snippet highlights and reason
    API-->>User: Return results with snippets & matched chunk IDs
```
