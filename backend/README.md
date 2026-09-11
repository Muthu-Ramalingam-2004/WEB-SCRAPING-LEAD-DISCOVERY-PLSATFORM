# Web Scraping & Lead Discovery Platform - Backend

This is the backend for the Lead Discovery Platform. It is built with Python and FastAPI.

## Architecture

The backend handles:
- **API Endpoints**: RESTful API for authentication, user management, tasks, leads, and exports.
- **Database**: PostgreSQL (Supabase) via SQLAlchemy ORM.
- **Scraping Engine**: Automated discovery, crawling, extraction, cleaning, and deduplication.

## Setup & Running

1. Open terminal and navigate to backend:
```bash
cd backend
```

2. Activate virtual environment (if needed):
```powershell
.\.venv\Scripts\Activate.ps1
```

3. Start backend:
```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

*Note: Running `npm run dev` or `npm start` inside `backend/` will also automatically invoke `node start-backend.js`, which launches the Python Uvicorn server.*

4. Verification Endpoints:
- Base API: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
- Interactive Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
