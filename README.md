# Web Scraping & Lead Discovery Platform

This project is a complete end-to-end platform for automated web scraping, data extraction, and lead discovery.

## Project Structure

### `frontend/`
Contains the Next.js + React UI.
This frontend provides a modern, premium SaaS dashboard for managing scraping tasks, viewing real-time progress, verifying leads, and exporting data.

### `backend/`
Contains the Python + FastAPI API and the core scraping engine infrastructure.
The backend handles the task queuing, official website discovery, web crawling, contact extraction, and data deduplication.

---

## Running Frontend

The frontend runs on **Port 3000** (default).

```bash
cd frontend
npm install
npm run dev
```

Then visit `http://localhost:3000` in your browser.

---

## Running Backend

The backend API runs on **Port 8000** (default).

```bash
cd backend
python -m venv .venv
# Activate virtual environment
# Windows: .\.venv\Scripts\activate
# Mac/Linux: source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Then visit `http://localhost:8000/api/health` to verify the backend is running.
API documentation will be available at `http://localhost:8000/docs`.
