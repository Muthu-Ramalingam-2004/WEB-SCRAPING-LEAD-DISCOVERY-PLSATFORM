from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import random

from app.database.database import get_db
from app.models.task import ScrapingTaskModel

router = APIRouter()

class CreateTaskSchema(BaseModel):
    location: str
    keyword: str
    searchRadiusKm: Optional[int] = 25
    maxResults: int = 100
    maxPagesPerWebsite: int = 20
    crawlDepth: int = 2
    requiredFields: Optional[List[str]] = []
    acknowledgedResponsibleCrawling: Optional[bool] = True

def format_task_response(task: ScrapingTaskModel):
    return {
        "id": task.id,
        "location": task.location,
        "keyword": task.keyword,
        "searchRadiusKm": task.search_radius_km,
        "maxResults": task.max_results,
        "maxPagesPerWebsite": task.max_pages_per_website,
        "crawlDepth": task.crawl_depth,
        "requiredFields": task.required_fields or [],
        "resultsCount": task.results_count,
        "websitesCount": task.websites_count,
        "status": task.status,
        "createdAt": task.created_at,
        "completedAt": task.completed_at,
        "duration": task.duration
    }

@router.get("")
@router.get("/")
def get_all_tasks(db: Session = Depends(get_db)):
    tasks = db.query(ScrapingTaskModel).all()
    # Sort by creation date descending
    return [format_task_response(t) for t in reversed(tasks)]

@router.post("/", status_code=201)
@router.post("", status_code=201)
def create_task(payload: CreateTaskSchema, db: Session = Depends(get_db)):
    new_id = f"TASK-{random.randint(100000, 999999)}"
    now_str = datetime.now().strftime("%d %b %Y, %I:%M %p")
    
    db_task = ScrapingTaskModel(
        id=new_id,
        location=payload.location,
        keyword=payload.keyword,
        search_radius_km=payload.searchRadiusKm or 25,
        max_results=payload.maxResults,
        max_pages_per_website=payload.maxPagesPerWebsite,
        crawl_depth=payload.crawlDepth,
        required_fields=payload.requiredFields,
        results_count=0,
        websites_count=0,
        status="RUNNING",
        created_at=now_str
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return format_task_response(db_task)

@router.get("/{task_id}")
def get_task_by_id(task_id: str, db: Session = Depends(get_db)):
    task = db.query(ScrapingTaskModel).filter(ScrapingTaskModel.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return format_task_response(task)
