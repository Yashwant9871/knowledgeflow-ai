# Frequently Asked Questions

This document addresses common questions regarding the product strategy, security, and technical architecture of KnowledgeFlow AI.

---

## Technical & Search Strategy

### Why is semantic search not implemented yet?
Phase 2 focuses on establishing a secure, auditable keyword and metadata search foundation. Keyword search is predictable, highly performant, and has lower infrastructure requirements. Establishing this foundation ensures a cleaner transition to semantic search and RAG in future phases.

### Can the platform support vector embeddings later?
Yes. The database layer runs on PostgreSQL, which supports the `pgvector` extension. In future phases, we can add a vectorization service to generate embeddings for text chunks using models like OpenAI `text-embedding-3-small` or HuggingFace architectures, enabling hybrid search capabilities.

### How are text chunks created?
Raw text is parsed and split using a paragraph-aligned chunking algorithm. Chunks target ~750 characters with a ~150-character overlap. Paragraph boundaries (`\n`) are preserved to prevent splitting sentences in half. Large paragraphs are split at sentence limits, while small trailing fragments are merged into the previous chunk to maintain context.

### What database indexing is used?
The application uses PostgreSQL `pg_trgm` (trigram) indexes on `documents.title`, `documents.description`, and `document_chunks.chunk_text`. Trigram indexes support fast substring matching (e.g. `reimbursement` matches `eim`), providing fast keyword search across large documents without requiring external search clusters.

---

## Security & Governance

### How are document permissions enforced?
Permissions are enforced at both the API and database levels:
1. **RBAC Tier**: Guard dependencies check if the user role matches the required level for the requested action (e.g. only Admins and Content Managers can trigger indexing or reindexing).
2. **Collection Filters**: Non-Admin search results are filtered using the user's `collection_access` array: `WHERE collection_id IN (user.collection_access)`. Chunks and details endpoints perform similar validation checks, returning `403 Forbidden` if unauthorized.

### Does the system log all user activity?
Yes. The system logs all user interactions (logins, uploads, downloads, document views, reindexing, and search history events) to the `activity_events` table. The table is write-only, and no API exists to delete or modify logs.

---

## Integration Options

### Can the platform integrate with Microsoft SharePoint?
Yes. Custom sync adapters can be created using the SharePoint API to automatically pull and parse documents from SharePoint libraries into the platform's collections.

### Can it integrate with Confluence?
Yes. The system can connect to Confluence spaces using the Confluence REST API, converting page HTML into Markdown or text chunks for indexing.

### Can it connect to ERP systems?
Yes. Documents like vendor agreements, purchase contracts, and shipping procedures can be linked to ERP platforms (e.g. SAP, NetSuite) by referencing collection and document IDs in the ERP database records.
