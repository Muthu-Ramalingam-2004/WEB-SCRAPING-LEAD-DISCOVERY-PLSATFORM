import os
import uuid
import shutil
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile, File, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserProfileUpdate,
    ScrapingDefaultsUpdate,
    CrawlingSettingsUpdate,
    NotificationSettingsUpdate,
    FullUserResponse,
)

router = APIRouter()
logger = logging.getLogger(__name__)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "avatars")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    user: Optional[User] = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        if token.startswith("dummy-token-for-"):
            try:
                user_id = int(token.replace("dummy-token-for-", ""))
                user = db.query(User).filter(User.id == user_id).first()
            except ValueError:
                pass
    
    if not user:
        # Fallback to the first registered user or default user
        user = db.query(User).first()
        
    if not user:
        raise HTTPException(status_code=401, detail="User not authenticated.")
        
    return user

@router.get("/me", response_model=FullUserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me/profile", response_model=FullUserResponse)
def update_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if payload.email and payload.email != current_user.email:
        existing = db.query(User).filter(User.email == payload.email, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="An account with this email already exists.")
        current_user.email = payload.email

    if payload.full_name is not None:
        current_user.full_name = payload.full_name

    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/me/scraping-defaults", response_model=FullUserResponse)
def update_scraping_defaults(
    payload: ScrapingDefaultsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.default_max_results = payload.default_max_results
    current_user.default_max_pages = payload.default_max_pages
    current_user.default_crawl_depth = payload.default_crawl_depth

    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/me/crawling", response_model=FullUserResponse)
def update_crawling_settings(
    payload: CrawlingSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.request_timeout = payload.request_timeout
    current_user.retry_limit = payload.retry_limit
    current_user.domain_rate_limit = payload.domain_rate_limit

    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/me/notifications", response_model=FullUserResponse)
def update_notification_settings(
    payload: NotificationSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.task_complete_notify = payload.task_complete_notify
    current_user.task_failed_notify = payload.task_failed_notify
    current_user.weekly_report_notify = payload.weekly_report_notify

    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/me/avatar", response_model=FullUserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate content type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid image format. Supported formats: JPG, JPEG, PNG, WEBP."
        )

    # Read and check size limit (5MB)
    contents = await file.read()
    max_size = 5 * 1024 * 1024  # 5MB
    if len(contents) > max_size:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds maximum limit of 5MB."
        )

    # Generate unique filename
    ext = os.path.splitext(file.filename or "")[1].lower()
    if not ext or ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        ext = ".png"

    filename = f"user_{current_user.id}_{uuid.uuid4().hex[:8]}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    # Store static URL relative to server root
    avatar_url = f"/uploads/avatars/{filename}"
    current_user.avatar_url = avatar_url

    db.commit()
    db.refresh(current_user)
    return current_user
