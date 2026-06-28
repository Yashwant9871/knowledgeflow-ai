import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.routes import (
    auth,
    users,
    collections,
    documents,
    audit,
    search_history,
    analytics,
    settings as settings_route,
)

app = FastAPI(
    title="KnowledgeFlow AI API",
    description="Backend services for SOPs, Policies, and runbook indexing",
    version="1.0.0",
)

# CORS Configuration
# Allow local dev server, default ports for Vite/Bun/Next
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:4173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
    "http://localhost:80",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static folder
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(collections.router, prefix="/api/v1")
app.include_router(documents.router, prefix="/api/v1")
app.include_router(audit.router, prefix="/api/v1")
app.include_router(search_history.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(settings_route.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "knowledgeflow-ai",
        "docs": "/docs"
    }

# Programmatic migration run if guarded flag is set
@app.on_event("startup")
def on_startup():
    if settings.DEMO_AUTO_MIGRATION:
        print("[Startup] DEMO_AUTO_MIGRATION is enabled. Running migrations...")
        try:
            from alembic.config import Config
            from alembic import command
            # Locate alembic.ini relative to this file
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            ini_path = os.path.join(base_dir, "alembic.ini")
            if os.path.exists(ini_path):
                cfg = Config(ini_path)
                # Overwrite connection string with config settings
                cfg.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
                command.upgrade(cfg, "head")
                print("[Startup] Migrations completed successfully.")
            else:
                print(f"[Startup] Warning: alembic.ini not found at {ini_path}. Skipping auto-migration.")
        except Exception as e:
            print(f"[Startup] Error running migrations: {e}")
