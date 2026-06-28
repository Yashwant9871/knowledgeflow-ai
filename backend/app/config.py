import os

class Settings:
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/knowledgeflow"
    )
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", 
        "42bf79cfc46de1825ac7282cb8dcfbbdb738ad646c26888c3a93a158eb0938f3"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50 MB
    ALLOWED_EXTENSIONS: set[str] = {
        "pdf", "docx", "xlsx", "xls", "md", "txt", "png", "jpg", "jpeg", "csv", "json"
    }
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    DEMO_AUTO_MIGRATION: bool = os.getenv("DEMO_AUTO_MIGRATION", "true").lower() in ("true", "1", "yes")

settings = Settings()
