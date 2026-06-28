// Centralized type definitions for KnowledgeFlow AI
// Designed to map cleanly to a FastAPI backend.

export type Role = "ADMIN" | "CONTENT_MANAGER" | "EMPLOYEE";

export type DocumentStatus =
  | "UPLOADED"
  | "INDEXING_PENDING"
  | "INDEXED"
  | "NEEDS_REVIEW"
  | "ARCHIVED";

export type Confidentiality = "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";

export type AccessLevel = "OPEN" | "DEPARTMENT" | "RESTRICTED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  status: "ACTIVE" | "INVITED" | "SUSPENDED";
  lastActive: string;
  collectionAccess: string[];
  avatarColor: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  owner: string;
  accessLevel: AccessLevel;
  documentCount: number;
  recentActivity: string;
  indexingHealth: number; // 0-100
  icon: string;
}

export interface DocVersion {
  version: string;
  uploadedAt: string;
  uploadedBy: string;
  notes: string;
}

export interface ActivityEvent {
  id: string;
  type:
    | "UPLOAD"
    | "VIEW"
    | "DOWNLOAD"
    | "METADATA_EDIT"
    | "PERMISSION_CHANGE"
    | "COLLECTION_UPDATE"
    | "ARCHIVE"
    | "INDEX_COMPLETE";
  actor: string;
  target: string;
  targetId?: string;
  timestamp: string;
  detail?: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  collectionId: string;
  department: string;
  owner: string;
  tags: string[];
  version: string;
  status: DocumentStatus;
  uploadedAt: string;
  fileType: string;
  fileSize: number;
  views: number;
  downloads: number;
  documentType: string;
  confidentiality: Confidentiality;
  expiryDate?: string;
  versions: DocVersion[];
  permissions: { role: Role; access: "READ" | "WRITE" | "ADMIN" }[];
  searchAppearances: number;
  relatedDocumentIds: string[];
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  user: string;
  timestamp: string;
  filters: Record<string, string>;
  resultCount: number;
  matchedDocumentIds: string[];
  clickedDocumentId?: string;
}
