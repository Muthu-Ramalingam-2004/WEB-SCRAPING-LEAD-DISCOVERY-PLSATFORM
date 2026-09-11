# Web Scraping & Lead Discovery Platform

This project is a complete end-to-end platform for automated web scraping, data extraction, and lead discovery.

## Quick Start (Recommended After Laptop Restart)

### Option A: One-Command Fullstack Start (Root Directory)

From the project root workspace:

```bash
npm run dev
```

This launches both the **FastAPI Backend (Port 8000)** and the **Next.js Frontend (Port 3000)** concurrently.

Alternatively, on Windows, double-click `start-all.bat`.

---

### Option B: Starting Backend & Frontend Separately

#### 1. Backend Startup (Python + FastAPI)

```bash
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

*(Fail-safe note: Running `npm run dev` inside `backend/` will also automatically execute the Python Uvicorn backend server).*

Verify backend health at: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
API documentation available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

#### 2. Frontend Startup (Next.js + React)

```bash
cd frontend
npm run dev
```

Access the UI at: [http://localhost:3000](http://localhost:3000)

---

## Project Structure

- `frontend/`: Next.js + React dashboard.
- `backend/`: Python + FastAPI backend, Supabase PostgreSQL ORM models, and scraping infrastructure.
- `start-all.bat`: One-click Windows batch launcher for both servers.
- `start-backend.bat`: One-click Windows batch launcher for backend.
- `start-frontend.bat`: One-click Windows batch launcher for frontend.
