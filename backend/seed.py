import datetime
import os
from sqlalchemy.orm import Session

from app.database import SessionLocal, Base, engine
from app import models
from app.auth import get_password_hash
from app.services.indexing import run_indexing_pipeline

# Create a local session
db = SessionLocal()

SEED_USERS = [
    {
        "id": "u1",
        "name": "Sarah Chen",
        "email": "sarah.chen@acme.com",
        "role": "ADMIN",
        "department": "IT",
        "status": "ACTIVE",
        "last_active": "2026-06-28T09:14:00Z",
        "collection_access": ["c-hr","c-it","c-finance","c-ops","c-procurement","c-safety","c-quality","c-legal"],
        "avatar_color": "265"
    },
    {
        "id": "u2",
        "name": "Marcus Okafor",
        "email": "marcus.okafor@acme.com",
        "role": "CONTENT_MANAGER",
        "department": "HR",
        "status": "ACTIVE",
        "last_active": "2026-06-28T08:42:00Z",
        "collection_access": ["c-hr","c-legal"],
        "avatar_color": "30"
    },
    {
        "id": "u3",
        "name": "Priya Raman",
        "email": "priya.raman@acme.com",
        "role": "CONTENT_MANAGER",
        "department": "Operations",
        "status": "ACTIVE",
        "last_active": "2026-06-27T17:30:00Z",
        "collection_access": ["c-ops","c-safety","c-quality"],
        "avatar_color": "155"
    },
    {
        "id": "u4",
        "name": "Daniel Weiss",
        "email": "daniel.weiss@acme.com",
        "role": "EMPLOYEE",
        "department": "Finance",
        "status": "ACTIVE",
        "last_active": "2026-06-28T07:55:00Z",
        "collection_access": ["c-finance","c-procurement"],
        "avatar_color": "230"
    },
    {
        "id": "u5",
        "name": "Aiko Tanaka",
        "email": "aiko.tanaka@acme.com",
        "role": "EMPLOYEE",
        "department": "Procurement",
        "status": "ACTIVE",
        "last_active": "2026-06-26T14:10:00Z",
        "collection_access": ["c-procurement"],
        "avatar_color": "320"
    },
    {
        "id": "u6",
        "name": "Liam Murphy",
        "email": "liam.murphy@acme.com",
        "role": "EMPLOYEE",
        "department": "Engineering",
        "status": "INVITED",
        "last_active": "2026-06-20T11:00:00Z",
        "collection_access": ["c-it"],
        "avatar_color": "75"
    },
    {
        "id": "u7",
        "name": "Elena Rossi",
        "email": "elena.rossi@acme.com",
        "role": "CONTENT_MANAGER",
        "department": "Legal",
        "status": "ACTIVE",
        "last_active": "2026-06-28T06:01:00Z",
        "collection_access": ["c-legal","c-hr"],
        "avatar_color": "200"
    },
    {
        "id": "u8",
        "name": "Noah Brooks",
        "email": "noah.brooks@acme.com",
        "role": "EMPLOYEE",
        "department": "Quality",
        "status": "SUSPENDED",
        "last_active": "2026-05-18T10:22:00Z",
        "collection_access": [],
        "avatar_color": "0"
    }
]

SEED_COLLECTIONS = [
    { "id": "c-hr", "name": "Human Resources", "description": "Policies, onboarding, benefits, employee handbook", "owner": "Marcus Okafor", "access_level": "DEPARTMENT", "icon": "users" },
    { "id": "c-finance", "name": "Finance", "description": "Expense policies, financial controls, reporting standards", "owner": "Daniel Weiss", "access_level": "RESTRICTED", "icon": "wallet" },
    { "id": "c-procurement", "name": "Procurement", "description": "Vendor contracts, purchasing manuals, supplier compliance", "owner": "Aiko Tanaka", "access_level": "DEPARTMENT", "icon": "package" },
    { "id": "c-ops", "name": "Operations", "description": "SOPs, runbooks, operational checklists", "owner": "Priya Raman", "access_level": "OPEN", "icon": "settings" },
    { "id": "c-it", "name": "IT & Engineering", "description": "Runbooks, system documentation, security policies", "owner": "Sarah Chen", "access_level": "DEPARTMENT", "icon": "server" },
    { "id": "c-safety", "name": "Safety", "description": "Workplace safety, incident response, PPE guidelines", "owner": "Priya Raman", "access_level": "OPEN", "icon": "shield" },
    { "id": "c-quality", "name": "Quality", "description": "ISO 9001, audit reports, quality control procedures", "owner": "Priya Raman", "access_level": "DEPARTMENT", "icon": "badge-check" },
    { "id": "c-legal", "name": "Legal", "description": "Contracts, NDAs, compliance and regulatory documents", "owner": "Elena Rossi", "access_level": "RESTRICTED", "icon": "scale" }
]

SEED_DOCUMENTS = [
    { 
        "id": "d1", 
        "title": "Employee Handbook 2026", 
        "collection_id": "c-hr", 
        "department": "HR", 
        "owner": "Marcus Okafor", 
        "tags": ["handbook","policy","onboarding"], 
        "version": "4.2", 
        "status": "UPLOADED", 
        "uploaded_at": "2026-06-12T10:00:00Z", 
        "file_type": "TXT", 
        "file_size": 2450000, 
        "views": 1284, 
        "downloads": 432, 
        "document_type": "Policy", 
        "confidentiality": "INTERNAL",
        "text": "This Employee Handbook contains policies, guidelines, and benefits information for all Acme employees. It covers our workspace standards, PTO allowance (which is 25 days annually), health insurance plans, and general workplace etiquette. Please read this handbook carefully upon onboarding."
    },
    { 
        "id": "d2", 
        "title": "Remote Work Policy", 
        "collection_id": "c-hr", 
        "department": "HR", 
        "owner": "Marcus Okafor", 
        "tags": ["remote","policy","flexible-work"], 
        "version": "2.1", 
        "status": "UPLOADED", 
        "uploaded_at": "2026-05-28T14:32:00Z", 
        "file_type": "TXT", 
        "file_size": 540000, 
        "views": 892, 
        "downloads": 211, 
        "document_type": "Policy", 
        "confidentiality": "INTERNAL", 
        "expiry_date": "2027-05-28",
        "text": "The Remote Work Policy outlines the rules for flexible work locations. Employees are eligible to work remotely up to 3 days per week with manager approval. We offer a hardware stipend of $500 for home office setup. Core working hours are 10:00 AM to 4:00 PM EST."
    },
    { 
        "id": "d3", 
        "title": "Q2 Expense Reimbursement Guidelines", 
        "collection_id": "c-finance", 
        "department": "Finance", 
        "owner": "Daniel Weiss", 
        "tags": ["expense","finance","reimbursement"], 
        "version": "1.5", 
        "status": "UPLOADED", 
        "uploaded_at": "2026-06-20T09:15:00Z", 
        "file_type": "TXT", 
        "file_size": 320000, 
        "views": 612, 
        "downloads": 188, 
        "document_type": "Guideline", 
        "confidentiality": "CONFIDENTIAL",
        "text": "Expense guidelines detail allowable travel expenses. The daily per diem allowance for meals is $75. Hotel lodging is reimbursed up to $250 per night. All travel reimbursement requests must be submitted within 30 days of travel with valid receipts."
    },
    { 
        "id": "d4", 
        "title": "Vendor Master Agreement Template", 
        "collection_id": "c-procurement", 
        "department": "Procurement", 
        "owner": "Aiko Tanaka", 
        "tags": ["vendor","contract","template"], 
        "version": "3.0", 
        "status": "UPLOADED", 
        "uploaded_at": "2026-06-05T11:00:00Z", 
        "file_type": "TXT", 
        "file_size": 180000, 
        "views": 247, 
        "downloads": 99, 
        "document_type": "Template", 
        "confidentiality": "CONFIDENTIAL",
        "text": "This Vendor Master Agreement (VMA) governs the procurement of goods and services from external suppliers. It includes sections on supplier compliance, payment terms (default is Net 30), intellectual property rights, and mutual confidentiality."
    },
    { 
        "id": "d5", 
        "title": "Incident Response Runbook", 
        "collection_id": "c-it", 
        "department": "IT", 
        "owner": "Sarah Chen", 
        "tags": ["security","runbook","incident"], 
        "version": "5.4", 
        "status": "UPLOADED", 
        "uploaded_at": "2026-06-22T16:48:00Z", 
        "file_type": "TXT", 
        "file_size": 86000, 
        "views": 421, 
        "downloads": 67, 
        "document_type": "Runbook", 
        "confidentiality": "RESTRICTED",
        "text": "The Incident Response Runbook outlines security and system incident protocols. Severity 1 incidents must be resolved within 4 hours. Steps: 1. Identify system anomaly. 2. Contain breach. 3. Eradicate threat. 4. Recover systems."
    },
    { 
        "id": "d6", 
        "title": "Warehouse Safety SOP", 
        "collection_id": "c-safety", 
        "department": "Operations", 
        "owner": "Priya Raman", 
        "tags": ["safety","sop","warehouse","ppe"], 
        "version": "2.3", 
        "status": "UPLOADED", 
        "uploaded_at": "2026-04-18T08:10:00Z", 
        "file_type": "TXT", 
        "file_size": 1200000, 
        "views": 1543, 
        "downloads": 612, 
        "document_type": "SOP", 
        "confidentiality": "INTERNAL",
        "text": "Warehouse Safety Standard Operating Procedure (SOP). All employees must wear personal protective equipment (PPE), including steel-toed boots, high-visibility vests, and safety goggles. Forklift operators must be certified."
    },
    { 
        "id": "d7", 
        "title": "ISO 9001:2015 Quality Manual", 
        "collection_id": "c-quality", 
        "department": "Quality", 
        "owner": "Priya Raman", 
        "tags": ["iso","quality","manual"], 
        "version": "7.1", 
        "status": "UPLOADED", 
        "uploaded_at": "2026-03-30T13:22:00Z", 
        "file_type": "TXT", 
        "file_size": 4800000, 
        "views": 689, 
        "downloads": 312, 
        "document_type": "Manual", 
        "confidentiality": "INTERNAL",
        "text": "This Quality Manual details our ISO 9001 compliance standards. It covers quality control procedures, management review schedules, risk assessments, and the cadence for quality audits (which occurs bi-annually)."
    },
    { 
        "id": "d8", 
        "title": "Data Processing Agreement — GDPR", 
        "collection_id": "c-legal", 
        "department": "Legal", 
        "owner": "Elena Rossi", 
        "tags": ["gdpr","dpa","privacy"], 
        "version": "1.2", 
        "status": "UPLOADED", 
        "uploaded_at": "2026-02-14T10:00:00Z", 
        "file_type": "TXT", 
        "file_size": 720000, 
        "views": 211, 
        "downloads": 88, 
        "document_type": "Contract", 
        "confidentiality": "CONFIDENTIAL", 
        "expiry_date": "2026-08-14",
        "text": "Data Processing Agreement (DPA) compliant with GDPR. Personal data must be processed lawfully and transparently. Data breaches must be reported to the supervising authority within 72 hours of detection."
    }
]

SEED_ACTIVITIES = [
    { "id": "a1", "type": "UPLOAD", "actor": "Daniel Weiss", "target": "Annual Budget Process 2026", "target_id": "d13", "timestamp": "2026-06-28T06:45:00Z" },
    { "id": "a2", "type": "INDEX_COMPLETE", "actor": "system", "target": "Employee Handbook 2026", "target_id": "d1", "timestamp": "2026-06-28T05:30:00Z" },
    { "id": "a3", "type": "VIEW", "actor": "Aiko Tanaka", "target": "Vendor Master Agreement Template", "target_id": "d4", "timestamp": "2026-06-28T04:18:00Z" },
    { "id": "a4", "type": "PERMISSION_CHANGE", "actor": "Sarah Chen", "target": "Server Hardening Standard", "target_id": "d14", "timestamp": "2026-06-27T22:01:00Z", "detail": "Restricted to IT department" },
    { "id": "a5", "type": "UPLOAD", "actor": "Priya Raman", "target": "Manufacturing Line SOP — Line 4", "target_id": "d9", "timestamp": "2026-06-27T22:14:00Z" },
    { "id": "a6", "type": "DOWNLOAD", "actor": "Marcus Okafor", "target": "Onboarding Checklist — New Hires", "target_id": "d12", "timestamp": "2026-06-27T19:42:00Z" },
    { "id": "a7", "type": "METADATA_EDIT", "actor": "Elena Rossi", "target": "Data Processing Agreement — GDPR", "target_id": "d8", "timestamp": "2026-06-27T15:20:00Z", "detail": "Added expiry date" },
    { "id": "a8", "type": "ARCHIVE", "actor": "Daniel Weiss", "target": "Legacy Travel Expense Policy", "target_id": "d17", "timestamp": "2026-06-26T11:00:00Z" },
    { "id": "a9", "type": "COLLECTION_UPDATE", "actor": "Sarah Chen", "target": "IT & Engineering", "timestamp": "2026-06-26T09:15:00Z", "detail": "Updated access level to DEPARTMENT" }
]

def parse_iso_datetime(iso_str: str) -> datetime.datetime:
    return datetime.datetime.strptime(iso_str, "%Y-%m-%dT%H:%M:%SZ")

def seed_database():
    print("Starting database seeding...")
    
    # 1. Seed Collections
    for c_data in SEED_COLLECTIONS:
        col = db.query(models.Collection).filter(models.Collection.id == c_data["id"]).first()
        if not col:
            col = models.Collection(
                id=c_data["id"],
                name=c_data["name"],
                description=c_data["description"],
                owner=c_data["owner"],
                access_level=c_data["access_level"],
                icon=c_data["icon"]
            )
            db.add(col)
            print(f"Seeded collection: {c_data['name']}")
        else:
            col.name = c_data["name"]
            col.description = c_data["description"]
            col.owner = c_data["owner"]
            col.access_level = c_data["access_level"]
            col.icon = c_data["icon"]
            print(f"Updated collection: {c_data['name']}")
    db.commit()

    # 2. Seed Users
    demo_password_hash = get_password_hash("demo-password")
    for u_data in SEED_USERS:
        user = db.query(models.User).filter(models.User.email == u_data["email"].lower()).first()
        if not user:
            user = models.User(
                id=u_data["id"],
                name=u_data["name"],
                email=u_data["email"].lower(),
                hashed_password=demo_password_hash,
                role=u_data["role"],
                department=u_data["department"],
                status=u_data["status"],
                last_active=parse_iso_datetime(u_data["last_active"]),
                avatar_color=u_data["avatar_color"],
                collection_access=u_data["collection_access"]
            )
            db.add(user)
            print(f"Seeded user: {u_data['name']}")
        else:
            user.name = u_data["name"]
            user.role = u_data["role"]
            user.department = u_data["department"]
            user.status = u_data["status"]
            user.avatar_color = u_data["avatar_color"]
            user.collection_access = u_data["collection_access"]
            print(f"Updated user: {u_data['name']}")
    db.commit()

    # 3. Seed Documents & Create Physical Seed Files to trigger pipeline
    os.makedirs("uploads", exist_ok=True)
    
    for d_data in SEED_DOCUMENTS:
        doc = db.query(models.Document).filter(models.Document.id == d_data["id"]).first()
        file_path = os.path.join("uploads", f"{d_data['id']}_seed_file.txt")
        
        # Write seed contents to disk
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(d_data["text"])
            
        if not doc:
            doc = models.Document(
                id=d_data["id"],
                title=d_data["title"],
                collection_id=d_data["collection_id"],
                department=d_data["department"],
                owner=d_data["owner"],
                tags=d_data["tags"],
                version=d_data["version"],
                status="UPLOADED",
                uploaded_at=parse_iso_datetime(d_data["uploaded_at"]),
                file_type=d_data["file_type"],
                file_size=len(d_data["text"]),
                views=d_data["views"],
                downloads=d_data["downloads"],
                document_type=d_data["document_type"],
                confidentiality=d_data["confidentiality"],
                expiry_date=d_data.get("expiry_date")
            )
            db.add(doc)
            
            # Initial Version mapping
            v1 = models.DocVersion(
                document_id=d_data["id"],
                version=d_data["version"],
                uploaded_at=parse_iso_datetime(d_data["uploaded_at"]),
                uploaded_by=d_data["owner"],
                notes="Seeded file",
                file_path=file_path
            )
            db.add(v1)
            db.commit()
            print(f"Seeded document record: {d_data['title']}")
        else:
            doc.title = d_data["title"]
            doc.collection_id = d_data["collection_id"]
            doc.department = d_data["department"]
            doc.owner = d_data["owner"]
            doc.tags = d_data["tags"]
            doc.version = d_data["version"]
            doc.file_type = d_data["file_type"]
            doc.file_size = len(d_data["text"])
            doc.document_type = d_data["document_type"]
            doc.confidentiality = d_data["confidentiality"]
            doc.expiry_date = d_data.get("expiry_date")
            
            # Update path on version
            v1 = db.query(models.DocVersion).filter(models.DocVersion.document_id == doc.id).first()
            if v1:
                v1.file_path = file_path
            db.commit()
            print(f"Updated document record: {d_data['title']}")
            
        # Trigger the indexing pipeline to populate extracted_text & DocumentChunks dynamically
        run_indexing_pipeline(db, d_data["id"], actor_name="seeder")
        
    db.commit()

    # 4. Seed Activities
    for a_data in SEED_ACTIVITIES:
        act = db.query(models.ActivityEvent).filter(models.ActivityEvent.id == a_data["id"]).first()
        if not act:
            act = models.ActivityEvent(
                id=a_data["id"],
                type=a_data["type"],
                actor=a_data["actor"],
                target=a_data["target"],
                target_id=a_data.get("target_id"),
                timestamp=parse_iso_datetime(a_data["timestamp"]),
                detail=a_data.get("detail")
            )
            db.add(act)
            print(f"Seeded activity: {a_data['id']}")
        else:
            act.type = a_data["type"]
            act.actor = a_data["actor"]
            act.target = a_data["target"]
            act.target_id = a_data.get("target_id")
            act.detail = a_data.get("detail")
            print(f"Updated activity: {a_data['id']}")
    db.commit()

    print("Seeding completed successfully.")

if __name__ == "__main__":
    try:
        seed_database()
    finally:
        db.close()
