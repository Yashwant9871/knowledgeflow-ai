from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.auth import RoleChecker

router = APIRouter(prefix="/settings", tags=["settings"])

admin_only = RoleChecker(["ADMIN"])

# Simulated simple settings storage
workspace_settings = {
    "general": {
        "workspaceName": "Acme Industries",
        "primaryDomain": "acme.com",
        "defaultLanguage": "English (US)",
        "timezone": "America/New_York"
    },
    "retention": {
        "autoArchiveDays": 365,
        "reviewLeadTimeDays": 30,
        "hardDeleteDays": 1095
    },
    "collections": {
        "defaultAccess": "Department",
        "requireApproval": True,
        "allowTagSuggestions": True
    },
    "indexing": {
        "engineUrl": "http://localhost:8000/api/v1/index",
        "cadence": "Real-time"
    },
    "security": {
        "sso": "Disabled",
        "require2FA": True,
        "sessionTimeout": 60,
        "ipAllowlist": ""
    }
}

@router.get("", response_model=Dict[str, Any])
def get_settings(current_user=Depends(admin_only)):
    return workspace_settings

@router.put("", response_model=Dict[str, Any])
def update_settings(new_settings: Dict[str, Any], current_user=Depends(admin_only)):
    # Simple update
    for key, val in new_settings.items():
        if key in workspace_settings:
            workspace_settings[key].update(val)
    return workspace_settings
