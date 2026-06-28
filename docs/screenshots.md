# Screenshot Capture Guide

This guide assists developers in capturing portfolio-grade screenshots of the KnowledgeFlow AI platform for documentation and client presentations.

---

## Technical Recommendations

* **Suggested Capture Resolution**: `1920x1080` (Full HD) or `1440x900`.
* **Recommended Browser Width**: `1440px` (Desktop-optimized layout).
* **Browser Settings**: Clean browser window (no bookmark bars or extensions). Enable dark mode or light mode consistently.
* **Image Format**: PNG (for high-contrast text rendering).
* **Target Output Directory**: `docs/images/`.

---

## Required Screenshots Directory

### 01. Login Screen
* **Filename**: `login.png`
* **Page URL**: `http://localhost:5173/`
* **Purpose**: Show the onboarding auth screen.
* **Recommended Data**: Email input: `sarah.chen@acme.com`. Password: `••••••••••••`.
* **Important UI Elements**: Card layout, input fields, company brand identifier.

### 02. System Dashboard
* **Filename**: `dashboard.png`
* **Page URL**: `http://localhost:5173/dashboard`
* **Purpose**: Show system metrics and document statistics.
* **Recommended Data**: Logged in as `Sarah Chen`. Total Chunks metric showing `8` or more.
* **Important UI Elements**: Stat cards row (Total documents, Collections, Pending indexing, Total chunks, Needs review), tabbed uploads/indexed panel switcher, storage progress bar.

### 03. Document Library
* **Filename**: `documents.png`
* **Page URL**: `http://localhost:5173/documents`
* **Purpose**: Show document library overview.
* **Recommended Data**: Complete library listing of seeded items.
* **Important UI Elements**: Library document cards, Status Badge tags (`INDEXED`), collection labels, file type tags.

### 04. Document Upload Dialog
* **Filename**: `upload-document.png`
* **Page URL**: `http://localhost:5173/documents/upload` (Modal or Page)
* **Purpose**: Show file upload metadata configuration and file validation indicators.
* **Recommended Data**: Form filled out with a test document (e.g. `Warehouse Safety SOP`).
* **Important UI Elements**: Drag & drop zone, tags selector, confidentiality dropdown selection.

### 05. Document Details Page
* **Filename**: `document-details.png`
* **Page URL**: `http://localhost:5173/documents/d3`
* **Purpose**: Show metadata sidebar and file preview tabs.
* **Recommended Data**: Page for `Q2 Expense Reimbursement Guidelines`.
* **Important UI Elements**: File Preview pane, version history table, action buttons (Download, Library), right-hand sidebar showing **Intelligence** card (`INDEXED` status, extraction time, method).

### 06. Extracted Text Panel
* **Filename**: `extracted-text.png`
* **Page URL**: `http://localhost:5173/documents/d3` (Extracted Text Tab)
* **Purpose**: Show the raw extracted text results.
* **Recommended Data**: The text content extracted from the text file.
* **Important UI Elements**: Selected **Extracted Text** tab and the raw text box in monospace font.

### 07. Document Chunks List
* **Filename**: `chunks.png`
* **Page URL**: `http://localhost:5173/documents/d3` (Chunks Tab)
* **Purpose**: Show the parsed chunks list.
* **Recommended Data**: Segments listed with character counts and index markers.
* **Important UI Elements**: **Chunks** tab selected, chunk index labels (e.g. `CHUNK #1`), character count indicators.

### 08. Enterprise Search Results
* **Filename**: `search.png`
* **Page URL**: `http://localhost:5173/search`
* **Purpose**: Show keyword matching results and dynamic snippets.
* **Recommended Data**: Search query: `"reimbursement"`.
* **Important UI Elements**: Search input with query term, results count label, matched document title, quote box showing the matched context snippet, match reason badge.

### 09. Collections Management
* **Filename**: `collections.png`
* **Page URL**: `http://localhost:5173/collections`
* **Purpose**: Show structured containers grouping documents.
* **Recommended Data**: Collections list (e.g., Human Resources, Finance, IT).
* **Important UI Elements**: Collection grid cards showing file counts and health bars.

### 10. Workspace Members Directory
* **Filename**: `users.png`
* **Page URL**: `http://localhost:5173/users`
* **Purpose**: Show directory of corporate accounts.
* **Recommended Data**: User list (e.g. Sarah Chen, Marcus Okafor, Daniel Weiss).
* **Important UI Elements**: User tables, user role labels, status badges.

### 11. Immutable Audit Log
* **Filename**: `audit.png`
* **Page URL**: `http://localhost:5173/audit`
* **Purpose**: Show governance event history.
* **Recommended Data**: Audit events (e.g., UPLOAD, DOCUMENT_INDEXED, SEARCH_PERFORMED).
* **Important UI Elements**: Timeline lists, event type labels, timestamp logs.

### 12. Security & Policy Settings
* **Filename**: `settings.png`
* **Page URL**: `http://localhost:5173/settings`
* **Purpose**: Show admin workspace policies.
* **Recommended Data**: Configured retention parameters.
* **Important UI Elements**: Policy toggle checkboxes, input selectors.
