# Changelog

All notable changes to the KnowledgeFlow AI project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-06-28

### Added
* **Intelligence Extraction Engine**: Segmented parsers supporting PDF (`pypdf`), Word (`python-docx`), and Text/Markdown file streams.
* **Text Chunking Pipeline**: Paragraph-aligned segmenter dividing raw documents into ~750-character chunks with ~150-character overlaps.
* **Trigram Index Search**: Configured PostgreSQL `pg_trgm` GIN search indexes on document title, tags, description, and chunk text.
* **Dynamic Search Snippets**: Locates matching search queries inside text chunks, extracts a contextual text window, and displays it in search results.
* **Immutability Audit trail**: Immutable event logger tracking logins, views, downloads, uploads, reindexing, and search activities.
* **RBAC Controls**: Parameterized dependencies restricting access to users, audit trails, configurations, and reindexing pipelines.
* **Multi-Container Stack**: Docker Compose orchestrating `db` (PostgreSQL 16), `redis` (7), `backend` (FastAPI), and `frontend` (React Vite).

### Changed
* **Pydantic Serialization**: Configured schemas to automatically map snake_case attributes to camelCase JSON keys when communicating with the frontend.
* **Database Queries**: Refactored search queries to combine primary key sets in-memory to prevent PostgreSQL JSON distinct comparison errors.
* **Seeding Script**: Idempotent seeder that writes raw text assets to the uploads directory and runs them through the indexing pipeline automatically on startup.
