# Product Demonstration Script

This script outlines a 3–5 minute presentation demonstrating the key features and business value of KnowledgeFlow AI.

---

## ⏱️ Timeline & Script Outline

| Time | Segment | Focus | Action / Browser Page |
| :--- | :--- | :--- | :--- |
| **0:00 - 0:30** | Introduction | Business problem & overview | Login Screen (`localhost:5173`) |
| **0:30 - 1:15** | Dashboard & Metrics | System health, chunks, storage | Dashboard Screen (`localhost:5173/dashboard`) |
| **1:15 - 2:00** | Doc Detail & Chunks | Extraction preview, segments | Document Detail Screen (`/documents/d3`) |
| **2:00 - 2:45** | Search & Snippets | Trigram matching, citation quotes | Search Screen (`localhost:5173/search`) |
| **2:45 - 3:30** | Security & Auditing | RBAC, Audit logs, settings | Users & Audit Log Screens |
| **3:30 - 4:00** | Conclusion | Technology highlights & roadmap | Summary |

---

## 🎤 Presenter Script

### 1. Introduction (0:00 - 0:30)
* **Presenter Action**: Open the application at `http://localhost:5173` showing the Login Screen.
* **Presenter Script**:
  > *"Every day, enterprise employees waste time looking for information scattered across hundreds of SOPs, policies, and runbooks. KnowledgeFlow AI solves this by centralizing knowledge assets into secure, search-ready containers. Let's log in as our administrator, Sarah Chen, using secure credentials."*
* **Presenter Action**: Input `sarah.chen@acme.com` and password `demo-password`, click Login.

---

### 2. Dashboard Overview (0:30 - 1:15)
* **Presenter Action**: Navigate to the Dashboard.
* **Presenter Script**:
  > *"On the dashboard, administrators get a real-time overview of the system. We can track total document counts, active indexing queues, and storage usage. In our Phase 2 update, we've added a total chunk count metric—representing the logical text segments created for document search. Below, we can toggle between recent uploads and recently indexed assets, verifying that every file has been processed successfully."*

---

### 3. Document Details, Extracted Text, & Chunks (1:15 - 2:00)
* **Presenter Action**: Click on the document `Q2 Expense Reimbursement Guidelines` from the list.
* **Presenter Script**:
  > *"Let's open a document's details. Here, we see the document metadata, tags, and version history. In the central pane, users can switch between the file preview, the raw extracted text, and the parsed chunks. The chunking engine splits text into paragraph-aligned segments to provide precise search results. Content managers and admins can also trigger reindexing manually if a document is updated."*
* **Presenter Action**: Click on the **Extracted Text** tab, then the **Chunks** tab. Point to the **Reindex Document** button in the sidebar.

---

### 4. Search & Snippet Citations (2:00 - 2:45)
* **Presenter Action**: Click **Search** in the navigation bar. Type `"reimbursement"` in the input field.
* **Presenter Script**:
  > *"Let's test the search. When we type 'reimbursement', the search engine queries titles, tags, descriptions, and text chunks. The matching document is returned with a citation box showing the exact snippet containing the matching keyword, along with the match reason. This helps users quickly verify if the document contains the information they need before downloading it."*
* **Presenter Action**: Point to the quote snippet box and the `Content match (Chunk #1)` badge.

---

### 5. Security & Audit Trail (2:45 - 3:30)
* **Presenter Action**: Click on **Audit Log** in the sidebar.
* **Presenter Script**:
  > *"Security is a core focus of the platform. Under the Audit Log, we can inspect immutable trails of every login, upload, view, download, and index event. We also track searches returning zero results—helping administrators identify content gaps. To protect data privacy, the platform enforces strict collection-level permissions on the backend. For example, employee users are restricted from accessing IT security runbooks or admin settings panels."*

---

### 6. Conclusion (3:30 - 4:00)
* **Presenter Script**:
  > *"KnowledgeFlow AI delivers a secure foundation for enterprise knowledge management. The system is built on a modern stack using FastAPI, PostgreSQL, and React. This architecture is ready for future upgrades like hybrid semantic search and RAG integrations. Thank you for your time, and I welcome any questions."*
