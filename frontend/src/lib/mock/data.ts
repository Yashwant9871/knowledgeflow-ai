// Mock data for KnowledgeFlow AI.
// Replace these in src/lib/services/* with FastAPI calls later.
import type {
  Collection,
  KnowledgeDocument,
  User,
  ActivityEvent,
  SearchHistoryItem,
} from "../types";

export const mockUsers: User[] = [
  { id: "u1", name: "Sarah Chen", email: "sarah.chen@acme.com", role: "ADMIN", department: "IT", status: "ACTIVE", lastActive: "2026-06-28T09:14:00Z", collectionAccess: ["c-hr","c-it","c-finance","c-ops","c-procurement","c-safety","c-quality","c-legal"], avatarColor: "265" },
  { id: "u2", name: "Marcus Okafor", email: "marcus.okafor@acme.com", role: "CONTENT_MANAGER", department: "HR", status: "ACTIVE", lastActive: "2026-06-28T08:42:00Z", collectionAccess: ["c-hr","c-legal"], avatarColor: "30" },
  { id: "u3", name: "Priya Raman", email: "priya.raman@acme.com", role: "CONTENT_MANAGER", department: "Operations", status: "ACTIVE", lastActive: "2026-06-27T17:30:00Z", collectionAccess: ["c-ops","c-safety","c-quality"], avatarColor: "155" },
  { id: "u4", name: "Daniel Weiss", email: "daniel.weiss@acme.com", role: "EMPLOYEE", department: "Finance", status: "ACTIVE", lastActive: "2026-06-28T07:55:00Z", collectionAccess: ["c-finance","c-procurement"], avatarColor: "230" },
  { id: "u5", name: "Aiko Tanaka", email: "aiko.tanaka@acme.com", role: "EMPLOYEE", department: "Procurement", status: "ACTIVE", lastActive: "2026-06-26T14:10:00Z", collectionAccess: ["c-procurement"], avatarColor: "320" },
  { id: "u6", name: "Liam Murphy", email: "liam.murphy@acme.com", role: "EMPLOYEE", department: "Engineering", status: "INVITED", lastActive: "2026-06-20T11:00:00Z", collectionAccess: ["c-it"], avatarColor: "75" },
  { id: "u7", name: "Elena Rossi", email: "elena.rossi@acme.com", role: "CONTENT_MANAGER", department: "Legal", status: "ACTIVE", lastActive: "2026-06-28T06:01:00Z", collectionAccess: ["c-legal","c-hr"], avatarColor: "200" },
  { id: "u8", name: "Noah Brooks", email: "noah.brooks@acme.com", role: "EMPLOYEE", department: "Quality", status: "SUSPENDED", lastActive: "2026-05-18T10:22:00Z", collectionAccess: [], avatarColor: "0" },
];

export const mockCollections: Collection[] = [
  { id: "c-hr", name: "Human Resources", description: "Policies, onboarding, benefits, employee handbook", owner: "Marcus Okafor", accessLevel: "DEPARTMENT", documentCount: 48, recentActivity: "2 hours ago", indexingHealth: 98, icon: "users" },
  { id: "c-finance", name: "Finance", description: "Expense policies, financial controls, reporting standards", owner: "Daniel Weiss", accessLevel: "RESTRICTED", documentCount: 62, recentActivity: "5 hours ago", indexingHealth: 94, icon: "wallet" },
  { id: "c-procurement", name: "Procurement", description: "Vendor contracts, purchasing manuals, supplier compliance", owner: "Aiko Tanaka", accessLevel: "DEPARTMENT", documentCount: 35, recentActivity: "1 day ago", indexingHealth: 87, icon: "package" },
  { id: "c-ops", name: "Operations", description: "SOPs, runbooks, operational checklists", owner: "Priya Raman", accessLevel: "OPEN", documentCount: 124, recentActivity: "12 minutes ago", indexingHealth: 99, icon: "settings" },
  { id: "c-it", name: "IT & Engineering", description: "Runbooks, system documentation, security policies", owner: "Sarah Chen", accessLevel: "DEPARTMENT", documentCount: 89, recentActivity: "30 minutes ago", indexingHealth: 96, icon: "server" },
  { id: "c-safety", name: "Safety", description: "Workplace safety, incident response, PPE guidelines", owner: "Priya Raman", accessLevel: "OPEN", documentCount: 41, recentActivity: "3 hours ago", indexingHealth: 92, icon: "shield" },
  { id: "c-quality", name: "Quality", description: "ISO 9001, audit reports, quality control procedures", owner: "Priya Raman", accessLevel: "DEPARTMENT", documentCount: 56, recentActivity: "6 hours ago", indexingHealth: 90, icon: "badge-check" },
  { id: "c-legal", name: "Legal", description: "Contracts, NDAs, compliance and regulatory documents", owner: "Elena Rossi", accessLevel: "RESTRICTED", documentCount: 73, recentActivity: "1 hour ago", indexingHealth: 95, icon: "scale" },
];

const seedDocs: Omit<KnowledgeDocument, "versions" | "permissions" | "relatedDocumentIds" | "searchAppearances">[] = [
  { id: "d1", title: "Employee Handbook 2026", collectionId: "c-hr", department: "HR", owner: "Marcus Okafor", tags: ["handbook","policy","onboarding"], version: "4.2", status: "INDEXED", uploadedAt: "2026-06-12T10:00:00Z", fileType: "PDF", fileSize: 2_450_000, views: 1284, downloads: 432, documentType: "Policy", confidentiality: "INTERNAL" },
  { id: "d2", title: "Remote Work Policy", collectionId: "c-hr", department: "HR", owner: "Marcus Okafor", tags: ["remote","policy","flexible-work"], version: "2.1", status: "INDEXED", uploadedAt: "2026-05-28T14:32:00Z", fileType: "PDF", fileSize: 540_000, views: 892, downloads: 211, documentType: "Policy", confidentiality: "INTERNAL", expiryDate: "2027-05-28" },
  { id: "d3", title: "Q2 Expense Reimbursement Guidelines", collectionId: "c-finance", department: "Finance", owner: "Daniel Weiss", tags: ["expense","finance","reimbursement"], version: "1.5", status: "INDEXED", uploadedAt: "2026-06-20T09:15:00Z", fileType: "DOCX", fileSize: 320_000, views: 612, downloads: 188, documentType: "Guideline", confidentiality: "CONFIDENTIAL" },
  { id: "d4", title: "Vendor Master Agreement Template", collectionId: "c-procurement", department: "Procurement", owner: "Aiko Tanaka", tags: ["vendor","contract","template"], version: "3.0", status: "INDEXED", uploadedAt: "2026-06-05T11:00:00Z", fileType: "DOCX", fileSize: 180_000, views: 247, downloads: 99, documentType: "Template", confidentiality: "CONFIDENTIAL" },
  { id: "d5", title: "Incident Response Runbook", collectionId: "c-it", department: "IT", owner: "Sarah Chen", tags: ["security","runbook","incident"], version: "5.4", status: "INDEXED", uploadedAt: "2026-06-22T16:48:00Z", fileType: "MD", fileSize: 86_000, views: 421, downloads: 67, documentType: "Runbook", confidentiality: "RESTRICTED" },
  { id: "d6", title: "Warehouse Safety SOP", collectionId: "c-safety", department: "Operations", owner: "Priya Raman", tags: ["safety","sop","warehouse","ppe"], version: "2.3", status: "INDEXED", uploadedAt: "2026-04-18T08:10:00Z", fileType: "PDF", fileSize: 1_200_000, views: 1543, downloads: 612, documentType: "SOP", confidentiality: "INTERNAL" },
  { id: "d7", title: "ISO 9001:2015 Quality Manual", collectionId: "c-quality", department: "Quality", owner: "Priya Raman", tags: ["iso","quality","manual"], version: "7.1", status: "INDEXED", uploadedAt: "2026-03-30T13:22:00Z", fileType: "PDF", fileSize: 4_800_000, views: 689, downloads: 312, documentType: "Manual", confidentiality: "INTERNAL" },
  { id: "d8", title: "Data Processing Agreement — GDPR", collectionId: "c-legal", department: "Legal", owner: "Elena Rossi", tags: ["gdpr","dpa","privacy"], version: "1.2", status: "NEEDS_REVIEW", uploadedAt: "2026-02-14T10:00:00Z", fileType: "PDF", fileSize: 720_000, views: 211, downloads: 88, documentType: "Contract", confidentiality: "CONFIDENTIAL", expiryDate: "2026-08-14" },
  { id: "d9", title: "Manufacturing Line SOP — Line 4", collectionId: "c-ops", department: "Operations", owner: "Priya Raman", tags: ["sop","manufacturing","line-4"], version: "1.0", status: "INDEXING_PENDING", uploadedAt: "2026-06-27T22:14:00Z", fileType: "PDF", fileSize: 980_000, views: 0, downloads: 0, documentType: "SOP", confidentiality: "INTERNAL" },
  { id: "d10", title: "IT Asset Management Policy", collectionId: "c-it", department: "IT", owner: "Sarah Chen", tags: ["it","asset","policy"], version: "3.2", status: "INDEXED", uploadedAt: "2026-05-11T12:00:00Z", fileType: "PDF", fileSize: 410_000, views: 322, downloads: 104, documentType: "Policy", confidentiality: "INTERNAL" },
  { id: "d11", title: "Supplier Code of Conduct", collectionId: "c-procurement", department: "Procurement", owner: "Aiko Tanaka", tags: ["supplier","ethics","code"], version: "2.0", status: "INDEXED", uploadedAt: "2026-01-22T09:30:00Z", fileType: "PDF", fileSize: 560_000, views: 178, downloads: 56, documentType: "Policy", confidentiality: "INTERNAL" },
  { id: "d12", title: "Onboarding Checklist — New Hires", collectionId: "c-hr", department: "HR", owner: "Marcus Okafor", tags: ["onboarding","checklist","hr"], version: "4.0", status: "INDEXED", uploadedAt: "2026-06-01T10:00:00Z", fileType: "XLSX", fileSize: 92_000, views: 481, downloads: 220, documentType: "Checklist", confidentiality: "INTERNAL" },
  { id: "d13", title: "Annual Budget Process 2026", collectionId: "c-finance", department: "Finance", owner: "Daniel Weiss", tags: ["budget","finance","planning"], version: "1.0", status: "UPLOADED", uploadedAt: "2026-06-28T06:45:00Z", fileType: "DOCX", fileSize: 240_000, views: 0, downloads: 0, documentType: "Process", confidentiality: "CONFIDENTIAL" },
  { id: "d14", title: "Server Hardening Standard", collectionId: "c-it", department: "IT", owner: "Sarah Chen", tags: ["security","server","standard"], version: "2.7", status: "INDEXED", uploadedAt: "2026-04-04T15:20:00Z", fileType: "MD", fileSize: 64_000, views: 198, downloads: 41, documentType: "Standard", confidentiality: "RESTRICTED" },
  { id: "d15", title: "PPE Requirements Matrix", collectionId: "c-safety", department: "Operations", owner: "Priya Raman", tags: ["safety","ppe","matrix"], version: "1.4", status: "INDEXED", uploadedAt: "2026-05-19T08:00:00Z", fileType: "XLSX", fileSize: 78_000, views: 633, downloads: 254, documentType: "Reference", confidentiality: "INTERNAL" },
  { id: "d16", title: "Customer NDA Template", collectionId: "c-legal", department: "Legal", owner: "Elena Rossi", tags: ["nda","template","legal"], version: "2.2", status: "INDEXED", uploadedAt: "2026-05-02T11:10:00Z", fileType: "DOCX", fileSize: 110_000, views: 289, downloads: 132, documentType: "Template", confidentiality: "CONFIDENTIAL" },
  { id: "d17", title: "Legacy Travel Expense Policy", collectionId: "c-finance", department: "Finance", owner: "Daniel Weiss", tags: ["expense","travel","legacy"], version: "1.0", status: "ARCHIVED", uploadedAt: "2024-09-10T10:00:00Z", fileType: "PDF", fileSize: 200_000, views: 1820, downloads: 540, documentType: "Policy", confidentiality: "INTERNAL" },
  { id: "d18", title: "Quality Audit Report — May 2026", collectionId: "c-quality", department: "Quality", owner: "Priya Raman", tags: ["audit","quality","report"], version: "1.0", status: "INDEXED", uploadedAt: "2026-05-31T17:00:00Z", fileType: "PDF", fileSize: 1_400_000, views: 142, downloads: 68, documentType: "Report", confidentiality: "INTERNAL" },
];

export const mockDocuments: KnowledgeDocument[] = seedDocs.map((d) => ({
  ...d,
  versions: [
    { version: d.version, uploadedAt: d.uploadedAt, uploadedBy: d.owner, notes: "Current version" },
    { version: bumpDown(d.version, 1), uploadedAt: shiftDate(d.uploadedAt, -45), uploadedBy: d.owner, notes: "Updated policy references" },
    { version: bumpDown(d.version, 2), uploadedAt: shiftDate(d.uploadedAt, -120), uploadedBy: d.owner, notes: "Initial draft" },
  ],
  permissions: [
    { role: "ADMIN", access: "ADMIN" },
    { role: "CONTENT_MANAGER", access: "WRITE" },
    { role: "EMPLOYEE", access: d.confidentiality === "RESTRICTED" ? "READ" : "READ" },
  ],
  searchAppearances: Math.floor(d.views * 0.6),
  relatedDocumentIds: seedDocs
    .filter((x) => x.id !== d.id && x.collectionId === d.collectionId)
    .slice(0, 3)
    .map((x) => x.id),
}));

function bumpDown(v: string, n: number): string {
  const [maj, min] = v.split(".").map(Number);
  const newMin = (min ?? 0) - n;
  if (newMin < 0) return `${Math.max(0, maj - 1)}.0`;
  return `${maj}.${newMin}`;
}
function shiftDate(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export const mockActivity: ActivityEvent[] = [
  { id: "a1", type: "UPLOAD", actor: "Daniel Weiss", target: "Annual Budget Process 2026", targetId: "d13", timestamp: "2026-06-28T06:45:00Z" },
  { id: "a2", type: "INDEX_COMPLETE", actor: "system", target: "Employee Handbook 2026", targetId: "d1", timestamp: "2026-06-28T05:30:00Z" },
  { id: "a3", type: "VIEW", actor: "Aiko Tanaka", target: "Vendor Master Agreement Template", targetId: "d4", timestamp: "2026-06-28T04:18:00Z" },
  { id: "a4", type: "PERMISSION_CHANGE", actor: "Sarah Chen", target: "Server Hardening Standard", targetId: "d14", timestamp: "2026-06-27T22:01:00Z", detail: "Restricted to IT department" },
  { id: "a5", type: "UPLOAD", actor: "Priya Raman", target: "Manufacturing Line SOP — Line 4", targetId: "d9", timestamp: "2026-06-27T22:14:00Z" },
  { id: "a6", type: "DOWNLOAD", actor: "Marcus Okafor", target: "Onboarding Checklist — New Hires", targetId: "d12", timestamp: "2026-06-27T19:42:00Z" },
  { id: "a7", type: "METADATA_EDIT", actor: "Elena Rossi", target: "Data Processing Agreement — GDPR", targetId: "d8", timestamp: "2026-06-27T15:20:00Z", detail: "Added expiry date" },
  { id: "a8", type: "ARCHIVE", actor: "Daniel Weiss", target: "Legacy Travel Expense Policy", targetId: "d17", timestamp: "2026-06-26T11:00:00Z" },
  { id: "a9", type: "COLLECTION_UPDATE", actor: "Sarah Chen", target: "IT & Engineering", timestamp: "2026-06-26T09:15:00Z", detail: "Updated access level to DEPARTMENT" },
  { id: "a10", type: "VIEW", actor: "Liam Murphy", target: "Incident Response Runbook", targetId: "d5", timestamp: "2026-06-25T17:08:00Z" },
  { id: "a11", type: "UPLOAD", actor: "Elena Rossi", target: "Customer NDA Template", targetId: "d16", timestamp: "2026-05-02T11:10:00Z" },
  { id: "a12", type: "DOWNLOAD", actor: "Priya Raman", target: "ISO 9001:2015 Quality Manual", targetId: "d7", timestamp: "2026-06-24T08:33:00Z" },
];

export const mockSearchHistory: SearchHistoryItem[] = [
  { id: "s1", query: "remote work eligibility", user: "Liam Murphy", timestamp: "2026-06-28T08:42:00Z", filters: { collection: "HR" }, resultCount: 4, matchedDocumentIds: ["d2","d1"], clickedDocumentId: "d2" },
  { id: "s2", query: "expense limit per diem", user: "Daniel Weiss", timestamp: "2026-06-28T07:30:00Z", filters: { collection: "Finance", department: "Finance" }, resultCount: 2, matchedDocumentIds: ["d3"], clickedDocumentId: "d3" },
  { id: "s3", query: "PPE forklift", user: "Noah Brooks", timestamp: "2026-06-27T16:11:00Z", filters: { collection: "Safety" }, resultCount: 3, matchedDocumentIds: ["d15","d6"], clickedDocumentId: "d15" },
  { id: "s4", query: "vendor onboarding checklist", user: "Aiko Tanaka", timestamp: "2026-06-27T14:08:00Z", filters: {}, resultCount: 0, matchedDocumentIds: [] },
  { id: "s5", query: "iso 9001 audit cadence", user: "Priya Raman", timestamp: "2026-06-27T11:23:00Z", filters: { collection: "Quality" }, resultCount: 5, matchedDocumentIds: ["d7","d18"], clickedDocumentId: "d7" },
  { id: "s6", query: "nda customer template", user: "Elena Rossi", timestamp: "2026-06-26T18:45:00Z", filters: { documentType: "Template" }, resultCount: 2, matchedDocumentIds: ["d16","d4"], clickedDocumentId: "d16" },
  { id: "s7", query: "incident response severity 1", user: "Sarah Chen", timestamp: "2026-06-26T13:02:00Z", filters: { collection: "IT" }, resultCount: 1, matchedDocumentIds: ["d5"], clickedDocumentId: "d5" },
  { id: "s8", query: "parental leave policy", user: "Marcus Okafor", timestamp: "2026-06-26T10:18:00Z", filters: { collection: "HR" }, resultCount: 0, matchedDocumentIds: [] },
  { id: "s9", query: "supplier ethics escalation", user: "Aiko Tanaka", timestamp: "2026-06-25T15:33:00Z", filters: {}, resultCount: 1, matchedDocumentIds: ["d11"] },
  { id: "s10", query: "data retention gdpr", user: "Elena Rossi", timestamp: "2026-06-25T09:51:00Z", filters: { collection: "Legal" }, resultCount: 2, matchedDocumentIds: ["d8"], clickedDocumentId: "d8" },
  { id: "s11", query: "warehouse cleaning sop", user: "Priya Raman", timestamp: "2026-06-24T16:00:00Z", filters: { collection: "Operations" }, resultCount: 3, matchedDocumentIds: ["d6","d9"], clickedDocumentId: "d6" },
  { id: "s12", query: "asset tagging laptop", user: "Sarah Chen", timestamp: "2026-06-24T11:42:00Z", filters: { collection: "IT" }, resultCount: 1, matchedDocumentIds: ["d10"], clickedDocumentId: "d10" },
];

export const popularSearches: { query: string; count: number }[] = [
  { query: "remote work eligibility", count: 142 },
  { query: "expense limit per diem", count: 118 },
  { query: "parental leave policy", count: 96 },
  { query: "PPE forklift", count: 84 },
  { query: "iso 9001 audit cadence", count: 71 },
  { query: "nda customer template", count: 58 },
];

export const unansweredSearches: { query: string; count: number; lastAsked: string }[] = [
  { query: "vendor onboarding checklist", count: 12, lastAsked: "2026-06-27T14:08:00Z" },
  { query: "parental leave policy", count: 9, lastAsked: "2026-06-26T10:18:00Z" },
  { query: "expense card limit increase", count: 7, lastAsked: "2026-06-25T13:21:00Z" },
  { query: "remote work hardware stipend", count: 5, lastAsked: "2026-06-24T08:45:00Z" },
];
