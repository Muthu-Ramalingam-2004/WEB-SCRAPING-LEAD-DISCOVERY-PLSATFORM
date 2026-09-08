# Web Scraping & Lead Discovery Platform - Backend

This is the backend for the Lead Discovery Platform. It is built with Python and FastAPI.

## Architecture

The backend handles:
- **API Endpoints**: RESTful API for the frontend dashboard.
- **Task Management**: Queuing and managing scraping tasks.
- **Scraping Engine** (Future): Discovering websites, crawling, extracting data, cleaning, and deduplication.
- **Database** (Future): PostgreSQL for storing tasks, organizations, websites, leads, and evidence.

## Directory Structure

- `app/api/`: FastAPI route definitions.
- `app/core/`: Application configuration and security.
- `app/models/`: Database ORM models (SQLAlchemy/SQLModel).
- `app/schemas/`: Pydantic models for request/response validation.
- `app/services/`: Business logic and database interactions.
- `app/scraping/`: Core scraping orchestration.
- `app/discovery/`: Modules for finding target websites.
- `app/crawler/`: Modules for navigating websites and respecting rate limits/robots.txt.
- `app/extraction/`: Modules for parsing HTML and extracting contact info.
- `app/cleaning/`: Modules for normalizing data.
- `app/deduplication/`: Modules for identifying and resolving duplicate leads.
- `app/database/`: Database connection and session management.

## Setup & Running

BACKEND — FastAPI

1. Open terminal.

2. Go to backend:
```bash
cd backend
```

3. Activate virtual environment:
```powershell
.\.venv\Scripts\Activate.ps1
```

4. Install dependencies:
```bash
python -m pip install -r requirements.txt
```

5. Start backend:
```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

6. API:
http://127.0.0.1:8000

7. Health:
http://127.0.0.1:8000/api/health

**CRITICAL WARNING:**
DO NOT run `npm run dev` inside backend.
npm is only for the Next.js frontend. The backend must remain Python/FastAPI.
