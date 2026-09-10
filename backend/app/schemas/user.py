from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None

class ScrapingDefaultsUpdate(BaseModel):
    default_max_results: int = Field(..., ge=1, le=10000)
    default_max_pages: int = Field(..., ge=1, le=1000)
    default_crawl_depth: int = Field(..., ge=1, le=10)

class CrawlingSettingsUpdate(BaseModel):
    request_timeout: int = Field(..., ge=1, le=300)
    retry_limit: int = Field(..., ge=0, le=20)
    domain_rate_limit: int = Field(..., ge=1, le=60)

class NotificationSettingsUpdate(BaseModel):
    task_complete_notify: bool
    task_failed_notify: bool
    weekly_report_notify: bool

class FullUserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    default_max_results: int = 100
    default_max_pages: int = 20
    default_crawl_depth: int = 2
    request_timeout: int = 30
    retry_limit: int = 3
    domain_rate_limit: int = 2
    task_complete_notify: bool = True
    task_failed_notify: bool = True
    weekly_report_notify: bool = False

    class Config:
        from_attributes = True
