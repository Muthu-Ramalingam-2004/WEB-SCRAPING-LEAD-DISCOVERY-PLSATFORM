from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import random

from app.database.database import get_db
from app.models.task import ScrapingTaskModel
from app.models.lead import LeadModel
from app.scraping.pipeline import run_scraping_job, get_progress, set_progress

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
    return [format_task_response(t) for t in reversed(tasks)]

@router.post("/", status_code=201)
@router.post("", status_code=201)
def create_task(payload: CreateTaskSchema, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
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

    # Launch background scraping pipeline
    background_tasks.add_task(run_scraping_job, new_id, payload.model_dump())

    return format_task_response(db_task)

@router.get("/{task_id}")
def get_task_by_id(task_id: str, db: Session = Depends(get_db)):
    task = db.query(ScrapingTaskModel).filter(ScrapingTaskModel.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return format_task_response(task)

@router.get("/{task_id}/progress")
def get_task_progress(task_id: str, db: Session = Depends(get_db)):
    # 1. Check in-memory progress store for real-time progress
    live_progress = get_progress(task_id)
    if live_progress:
        return live_progress

    # 2. If task completed earlier or server restarted, reconstruct progress state from DB
    task = db.query(ScrapingTaskModel).filter(ScrapingTaskModel.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    leads = db.query(LeadModel).filter(LeadModel.task_id == task_id).all()
    leads_count = len(leads)
    phones_count = sum(1 for l in leads if l.phone)
    emails_count = sum(1 for l in leads if l.email)
    addresses_count = sum(1 for l in leads if l.address)

    is_completed = task.status in ["COMPLETED", "COMPLETED_WITH_ERRORS", "FAILED"]
    percentage = 100 if is_completed else 50

    return {
        "taskId": task.id,
        "location": task.location,
        "keyword": task.keyword,
        "status": task.status,
        "percentage": percentage,
        "resultsDiscovered": task.results_count or leads_count,
        "websitesFound": task.websites_count or leads_count,
        "websitesCrawled": task.websites_count or leads_count,
        "phonesFound": phones_count,
        "emailsFound": emails_count,
        "addressesFound": addresses_count,
        "duplicatesRemoved": 0,
        "currentWebsite": "",
        "currentPage": "",
        "pagesCrawledForCurrentSite": 0,
        "maxPagesForCurrentSite": task.max_pages_per_website,
        "timeline": [
            {"id": "step-1", "status": "completed", "title": "Task created", "description": f"Target: {task.location} + {task.keyword}"},
            {"id": "step-2", "status": "completed", "title": "Discovery completed", "description": f"{task.results_count} results found"},
            {"id": "step-3", "status": "completed", "title": "Crawling & extraction completed", "description": f"{leads_count} leads saved"},
            {"id": "step-4", "status": "completed", "title": "Verification & finalization", "description": f"Status: {task.status}"},
        ],
        "failedWebsites": []
    }

@router.get("/{task_id}/leads")
def get_task_leads(task_id: str, db: Session = Depends(get_db)):
    leads = db.query(LeadModel).filter(LeadModel.task_id == task_id).all()
    from app.api.leads import format_lead_response
    return [format_lead_response(l) for l in leads]

@router.get("/{task_id}/export/csv")
def export_task_csv(task_id: str, db: Session = Depends(get_db)):
    from app.api.exports import build_csv_export_response
    return build_csv_export_response(db, task_id)

@router.get("/{task_id}/export/excel")
def export_task_excel(task_id: str, db: Session = Depends(get_db)):
    from app.api.exports import build_excel_export_response
    return build_excel_export_response(db, task_id)

