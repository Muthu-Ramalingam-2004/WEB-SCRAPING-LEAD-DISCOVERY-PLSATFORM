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

from app.api import auth, users, exports, tasks, leads
from app.database.database import engine, Base
from app.models import user, export, task, lead
from app.models.task import ScrapingTaskModel
from app.models.lead import LeadModel

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

def seed_initial_data():
    from app.database.database import SessionLocal
    db = SessionLocal()
    try:
        # Seed tasks if empty
        if db.query(ScrapingTaskModel).count() == 0:
            initial_tasks = [
                ScrapingTaskModel(
                    id="TASK-000124", location="Puducherry", keyword="CBSE Schools",
                    search_radius_km=25, max_results=100, max_pages_per_website=20, crawl_depth=2,
                    required_fields=["name", "phone", "email", "website", "address", "whatsapp", "socialLinks"],
                    results_count=100, websites_count=72, status="COMPLETED",
                    created_at="31 Aug 2026, 10:30 AM", completed_at="31 Aug 2026, 10:44 AM", duration="14 mins"
                ),
                ScrapingTaskModel(
                    id="TASK-000123", location="Chennai", keyword="Engineering Colleges",
                    search_radius_km=50, max_results=150, max_pages_per_website=30, crawl_depth=3,
                    required_fields=["name", "phone", "email", "website", "address", "contactPerson", "socialLinks"],
                    results_count=150, websites_count=118, status="COMPLETED",
                    created_at="30 Aug 2026, 02:15 PM", completed_at="30 Aug 2026, 02:38 PM", duration="23 mins"
                ),
                ScrapingTaskModel(
                    id="TASK-000125", location="Madurai", keyword="Multi-specialty Hospitals",
                    search_radius_km=25, max_results=80, max_pages_per_website=15, crawl_depth=2,
                    required_fields=["name", "phone", "email", "website", "address", "whatsapp"],
                    results_count=65, websites_count=52, status="RUNNING",
                    created_at="05 Sep 2026, 11:10 AM"
                ),
                ScrapingTaskModel(
                    id="TASK-000121", location="Coimbatore", keyword="Textile Manufacturers",
                    search_radius_km=50, max_results=200, max_pages_per_website=25, crawl_depth=2,
                    required_fields=["name", "phone", "email", "website", "address", "contactPerson", "designation"],
                    results_count=184, websites_count=140, status="COMPLETED",
                    created_at="28 Aug 2026, 09:00 AM", completed_at="28 Aug 2026, 09:32 AM", duration="32 mins"
                )
            ]
            db.add_all(initial_tasks)
            db.commit()

        # Seed leads if empty
        if db.query(LeadModel).count() == 0:
            initial_leads = [
                LeadModel(
                    id="LEAD-001", task_id="TASK-000124", organization_name="St. Joseph Higher Secondary School",
                    category="CBSE School", location="Puducherry", city="Puducherry", state="Puducherry",
                    pincode="605001", address="10, Saint Ange Street, White Town, Puducherry - 605001",
                    phone="+91 413 233 4567", email="info@stjosephpdy.edu.in", website="stjosephpdy.edu.in",
                    whatsapp="+91 98765 43210",
                    contact_person={"name": "Rev. Fr. A. Maria Joseph", "designation": "Principal & Correspondent", "email": "principal@stjosephpdy.edu.in", "phone": "+91 94432 10987"},
                    social_links=[{"platform": "facebook", "url": "https://facebook.com/stjosephpdy"}, {"platform": "youtube", "url": "https://youtube.com/c/stjosephschoolpuducherry"}],
                    confidence="HIGH", verified=True, scraped_date="31 Aug 2026",
                    sources={"phone": {"field": "phone", "value": "+91 413 233 4567", "sourceUrl": "https://stjosephpdy.edu.in/contact-us", "extractedAt": "31 Aug 2026 10:35:12 AM", "verified": True}}
                ),
                LeadModel(
                    id="LEAD-002", task_id="TASK-000124", organization_name="Petit Seminaire Higher Secondary School",
                    category="CBSE School", location="Puducherry", city="Puducherry", state="Puducherry",
                    pincode="605001", address="150, Mahatma Gandhi Road, Puducherry - 605001",
                    phone="+91 413 222 5678", email="contact@petitseminaire.ac.in", website="petitseminaire.ac.in",
                    whatsapp="+91 98765 43211",
                    contact_person={"name": "Fr. R. Pascal", "designation": "Headmaster", "email": "headmaster@petitseminaire.ac.in", "phone": "+91 94432 10988"},
                    social_links=[{"platform": "facebook", "url": "https://facebook.com/petitseminaire"}, {"platform": "linkedin", "url": "https://linkedin.com/school/petitseminaire"}],
                    confidence="HIGH", verified=True, scraped_date="31 Aug 2026",
                    sources={"email": {"field": "email", "value": "contact@petitseminaire.ac.in", "sourceUrl": "https://petitseminaire.ac.in/contact", "extractedAt": "31 Aug 2026 10:36:12 AM", "verified": True}}
                ),
                LeadModel(
                    id="LEAD-003", task_id="TASK-000123", organization_name="College of Engineering Guindy (CEG)",
                    category="Engineering College", location="Chennai", city="Chennai", state="Tamil Nadu",
                    pincode="600025", address="12, Sardar Patel Road, Guindy, Chennai - 600025",
                    phone="+91 44 2235 7004", email="dean@ceg.annauniv.edu", website="ceg.annauniv.edu",
                    contact_person={"name": "Dr. K. S. Shanthi", "designation": "Dean", "email": "dean@ceg.annauniv.edu", "phone": "+91 44 2235 7001"},
                    social_links=[{"platform": "wikipedia", "url": "https://en.wikipedia.org/wiki/College_of_Engineering,_Guindy"}, {"platform": "linkedin", "url": "https://linkedin.com/school/ceg-annauniv"}],
                    confidence="HIGH", verified=True, scraped_date="30 Aug 2026",
                    sources={"website": {"field": "website", "value": "ceg.annauniv.edu", "sourceUrl": "https://ceg.annauniv.edu", "extractedAt": "30 Aug 2026 02:20:10 PM", "verified": True}}
                )
            ]
            db.add_all(initial_leads)
            db.commit()
    except Exception as e:
        print(f"Error seeding initial data: {e}")
        db.rollback()
    finally:
        db.close()

auto_migrate()
seed_initial_data()

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint to verify backend is running.
    """
    return {"status": "ok", "service": "lead-discovery-backend"}

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(exports.router, prefix="/api/exports", tags=["exports"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(leads.router, prefix="/api/leads", tags=["leads"])

