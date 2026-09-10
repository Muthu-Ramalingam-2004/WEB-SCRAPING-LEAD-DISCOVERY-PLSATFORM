from sqlalchemy import Column, Integer, String, JSON
from app.database.database import Base

class ScrapingTaskModel(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    location = Column(String, nullable=False)
    keyword = Column(String, nullable=False)
    search_radius_km = Column(Integer, default=25)
    max_results = Column(Integer, default=100)
    max_pages_per_website = Column(Integer, default=20)
    crawl_depth = Column(Integer, default=2)
    required_fields = Column(JSON, nullable=True)
    results_count = Column(Integer, default=0)
    websites_count = Column(Integer, default=0)
    status = Column(String, default="RUNNING") # RUNNING, COMPLETED, FAILED, PAUSED
    created_at = Column(String, nullable=False)
    completed_at = Column(String, nullable=True)
    duration = Column(String, nullable=True)
