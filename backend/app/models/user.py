from sqlalchemy import Column, Integer, String, Boolean
from app.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    # Profile & Avatar
    full_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)

    # Scraping Defaults
    default_max_results = Column(Integer, default=100)
    default_max_pages = Column(Integer, default=20)
    default_crawl_depth = Column(Integer, default=2)

    # Responsible Crawling
    request_timeout = Column(Integer, default=30)
    retry_limit = Column(Integer, default=3)
    domain_rate_limit = Column(Integer, default=2)

    # Notifications
    task_complete_notify = Column(Boolean, default=True)
    task_failed_notify = Column(Boolean, default=True)
    weekly_report_notify = Column(Boolean, default=False)

