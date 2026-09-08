from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Web Scraping & Lead Discovery API",
    description="Backend API for managing scraping tasks, discovery, and lead generation.",
    version="0.1.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import auth
from app.database.database import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint to verify backend is running.
    """
    return {"status": "ok", "service": "lead-discovery-backend"}

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

# Future Endpoints - Placeholders to define architecture boundaries

@app.post("/api/scrape", status_code=201)
async def create_scrape_task():
    """
    FUTURE IMPLEMENTATION: Create a new scraping task.
    """
    raise HTTPException(status_code=501, detail="Not implemented yet. Architecture ready for future scraping engine integration.")

@app.get("/api/tasks")
async def get_all_tasks():
    """
    FUTURE IMPLEMENTATION: Retrieve a list of all scraping tasks.
    """
    raise HTTPException(status_code=501, detail="Not implemented yet.")

@app.get("/api/tasks/{task_id}")
async def get_task_details(task_id: str):
    """
    FUTURE IMPLEMENTATION: Retrieve details for a specific scraping task.
    """
    raise HTTPException(status_code=501, detail="Not implemented yet.")

@app.get("/api/tasks/{task_id}/leads")
async def get_task_leads(task_id: str):
    """
    FUTURE IMPLEMENTATION: Retrieve leads discovered by a specific scraping task.
    """
    raise HTTPException(status_code=501, detail="Not implemented yet.")

@app.get("/api/leads/{lead_id}")
async def get_lead_details(lead_id: str):
    """
    FUTURE IMPLEMENTATION: Retrieve details for a specific lead.
    """
    raise HTTPException(status_code=501, detail="Not implemented yet.")

@app.get("/api/tasks/{task_id}/export/csv")
async def export_leads_csv(task_id: str):
    """
    FUTURE IMPLEMENTATION: Export leads to CSV format.
    """
    raise HTTPException(status_code=501, detail="Not implemented yet.")

@app.get("/api/tasks/{task_id}/export/excel")
async def export_leads_excel(task_id: str):
    """
    FUTURE IMPLEMENTATION: Export leads to Excel format.
    """
    raise HTTPException(status_code=501, detail="Not implemented yet.")
