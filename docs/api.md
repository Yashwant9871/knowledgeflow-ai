# REST API Specification

All endpoints are prefixed with `/api/v1` and return JSON payloads.

---

## Authentication Endpoints

### 1. User Login
Exchanges email credentials for a JWT.

* **Method / URL**: `POST /api/v1/auth/login`
* **Authentication**: None
* **Request Header**: `Content-Type: application/json`
* **Request Body**:
```json
{
  "email": "sarah.chen@acme.com",
  "password": "demo-password"
}
```
* **Response (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5...",
  "tokenType": "bearer"
}
```
* **Status Codes**: 200 (Success), 401 (Invalid credentials).

---

### 2. Retrieve Profile
Returns profile details for the logged-in user.

* **Method / URL**: `GET /api/v1/auth/me`
* **Authentication**: Bearer Token
* **Response (200 OK)**:
```json
{
  "name": "Sarah Chen",
  "email": "sarah.chen@acme.com",
  "role": "ADMIN",
  "department": "IT",
  "status": "ACTIVE",
  "avatarColor": "265",
  "collectionAccess": ["c-hr", "c-it", "c-finance"]
}
```

---

## Documents Endpoints

### 1. List / Search Documents
List documents, with optional filters and keyword query.

* **Method / URL**: `GET /api/v1/documents`
* **Authentication**: Bearer Token
* **Query Parameters**:
  * `q`: Filter keywords.
  * `collectionId`: Filter by collection ID.
  * `department`: Filter by department.
  * `documentType`: Filter by document type.
  * `tag`: Filter by tag.
* **Response (200 OK)**:
```json
[
  {
    "id": "d3",
    "title": "Q2 Expense Reimbursement Guidelines",
    "collectionId": "c-finance",
    "department": "Finance",
    "owner": "Daniel Weiss",
    "tags": ["expense", "finance", "reimbursement"],
    "version": "1.5",
    "status": "INDEXED",
    "uploadedAt": "2026-06-20T09:15:00",
    "fileType": "TXT",
    "fileSize": 320,
    "views": 612,
    "downloads": 188,
    "documentType": "Guideline",
    "confidentiality": "CONFIDENTIAL",
    "matchingSnippet": "... lodging is reimbursed up to $250 per night. All travel reimbursement requests must...",
    "matchedChunkId": "c-abc123de",
    "matchReason": "Content match (Chunk #1)"
  }
]
```

---

### 2. Upload Document
Uploads a new document file.

* **Method / URL**: `POST /api/v1/documents/upload`
* **Authentication**: Bearer Token (Admin / Content Manager only)
* **Request Header**: `Content-Type: multipart/form-data`
* **Form Parameters**:
  * `title`: "Safety Incident Protocol"
  * `collection_id`: "c-safety"
  * `department`: "Operations"
  * `owner`: "Marcus Okafor"
  * `file`: (Binary File Upload)
* **Response (201 Created)**:
```json
{
  "id": "d-abc987f",
  "title": "Safety Incident Protocol",
  "collectionId": "c-safety",
  "department": "Operations",
  "owner": "Marcus Okafor",
  "tags": [],
  "version": "1.0",
  "status": "UPLOADED",
  "uploadedAt": "2026-06-28T16:23:00",
  "fileType": "PDF",
  "fileSize": 456720
}
```

---

### 3. Reindex Document
Manually triggers the ingestion pipeline for a document.

* **Method / URL**: `POST /api/v1/documents/{id}/reindex`
* **Authentication**: Bearer Token (Admin / Content Manager only)
* **Response (200 OK)**:
```json
{
  "id": "d3",
  "title": "Q2 Expense Reimbursement Guidelines",
  "status": "INDEXED",
  "extractionStatus": "EXTRACTED",
  "extractedAt": "2026-06-28T16:23:45",
  "extractionMethod": "UTF8_TEXT_EXTRACTOR"
}
```
* **Status Codes**: 200 (Success), 403 (Permission denied), 404 (Not found).

---

### 4. Fetch Chunks
Returns text chunks for a document.

* **Method / URL**: `GET /api/v1/documents/{id}/chunks`
* **Authentication**: Bearer Token
* **Response (200 OK)**:
```json
[
  {
    "id": "c-abc123de",
    "documentId": "d3",
    "chunkIndex": 0,
    "chunkText": "Expense guidelines detail allowable travel expenses. The daily per diem allowance for meals is $75.",
    "characterCount": 98,
    "pageNumber": 1,
    "sectionTitle": null,
    "metadataJson": {"department": "Finance", "file_type": "TXT"},
    "createdAt": "2026-06-28T16:23:45"
  }
]
```

---

### 5. Download Document File
Downloads the file associated with a document.

* **Method / URL**: `GET /api/v1/documents/{id}/download`
* **Authentication**: Bearer Token (supports header or `?token=` query parameter)
* **Response (200 OK)**: Binary file stream.

---

## Collections Endpoints

### 1. List Collections
* **Method / URL**: `GET /api/v1/collections`
* **Authentication**: Bearer Token
* **Response (200 OK)**:
```json
[
  {
    "id": "c-hr",
    "name": "Human Resources",
    "description": "Policies, onboarding, benefits, employee handbook",
    "owner": "Marcus Okafor",
    "accessLevel": "DEPARTMENT",
    "documentCount": 2,
    "indexingHealth": 100,
    "icon": "users"
  }
]
```

---

## Analytics Endpoints

### 1. Dashboard Summary
* **Method / URL**: `GET /api/v1/analytics/dashboard`
* **Authentication**: Bearer Token
* **Response (200 OK)**:
```json
{
  "totalDocs": 8,
  "indexed": 7,
  "pending": 0,
  "needsReview": 1,
  "archived": 0,
  "collections": 8,
  "recentUploads": [],
  "popularSearches": [
    { "query": "reimbursement", "count": 12 }
  ],
  "unansweredSearches": [],
  "storageBytes": 3456720,
  "storageQuotaBytes": 53687091200,
  "activeUsers7d": 4,
  "activeUsers30d": 8,
  "totalChunks": 18,
  "recentlyIndexed": []
}
```
