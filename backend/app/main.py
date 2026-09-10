import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Web Scraping & Lead Discovery API",
    description="Backend API for managing scraping tasks, discovery, and lead generation.",
    version="0.1.0"
)

frontend_url = os.getenv("FRONTEND_URL")
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]
if frontend_url and frontend_url not in origins:
    origins.append(frontend_url)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text

# Static file serving for uploaded avatars
uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

from app.api import auth, users
from app.database.database import engine, Base

# Create tables & auto-migrate missing columns
Base.metadata.create_all(bind=engine)

def auto_migrate():
    with engine.connect() as conn:
        inspector = inspect(engine)
        if "users" in inspector.get_table_names():
            existing_cols = [c["name"] for c in inspector.get_columns("users")]
            new_cols = {
                "full_name": "VARCHAR",
                "avatar_url": "VARCHAR",
                "default_max_results": "INTEGER DEFAULT 100",
                "default_max_pages": "INTEGER DEFAULT 20",
                "default_crawl_depth": "INTEGER DEFAULT 2",
                "request_timeout": "INTEGER DEFAULT 30",
                "retry_limit": "INTEGER DEFAULT 3",
                "domain_rate_limit": "INTEGER DEFAULT 2",
                "task_complete_notify": "BOOLEAN DEFAULT 1",
                "task_failed_notify": "BOOLEAN DEFAULT 1",
                "weekly_report_notify": "BOOLEAN DEFAULT 0",
            }
            for col_name, col_type in new_cols.items():
                if col_name not in existing_cols:
                    try:
                        conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                        conn.commit()
                    except Exception:
                        pass

auto_migrate()

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint to verify backend is running.
    """
    return {"status": "ok", "service": "lead-discovery-backend"}

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])

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
