import time
import asyncio
from app.database.database import SessionLocal
from app.models.task import ScrapingTaskModel
from app.models.lead import LeadModel
from app.scraping.pipeline import ScrapingPipeline, get_progress

def test_pipeline_execution():
    task_id = f"TEST-{int(time.time())}"
    print(f"[TEST] Creating test task {task_id}...")

    db = SessionLocal()
    try:
        db_task = ScrapingTaskModel(
            id=task_id,
            location="Puducherry",
            keyword="CBSE Schools",
            search_radius_km=25,
            max_results=5,
            max_pages_per_website=5,
            crawl_depth=2,
            required_fields=["name", "phone", "email", "website", "address"],
            results_count=0,
            websites_count=0,
            status="RUNNING",
            created_at="12 Sep 2026, 04:00 PM"
        )
        db.add(db_task)
        db.commit()

        pipeline = ScrapingPipeline(task_id, {
            "location": "Puducherry",
            "keyword": "CBSE Schools",
            "maxResults": 5,
            "maxPagesPerWebsite": 5,
            "crawlDepth": 2
        })

        print(f"[TEST] Running pipeline for {task_id}...")
        asyncio.run(pipeline.execute())

        # Verify progress
        prog = get_progress(task_id)
        print(f"[TEST] Final Progress State: percentage={prog['percentage']}, status={prog['status']}")
        print(f"[TEST] Discovered: {prog['resultsDiscovered']}, Crawled: {prog['websitesCrawled']}, Failed: {len(prog['failedWebsites'])}")

        # Verify DB task state
        db.refresh(db_task)
        print(f"[TEST] DB Task Status: {db_task.status}, Results Count: {db_task.results_count}")

        # Verify DB leads state
        leads = db.query(LeadModel).filter(LeadModel.task_id == task_id).all()
        print(f"[TEST] Extracted Leads Saved to Supabase: {len(leads)}")
        for lead in leads[:3]:
            print(f"  - Lead: {lead.organization_name} | Phone: {lead.phone} | Email: {lead.email} | City: {lead.city}")

        assert db_task.status in ["COMPLETED", "COMPLETED_WITH_ERRORS"], "Task status should be terminal!"
        assert prog["percentage"] == 100, "Progress percentage should be 100%!"
        assert len(leads) > 0, "Leads should be saved to Supabase!"
        print("[TEST SUCCESS] Real pipeline execution test PASSED!")

    finally:
        db.close()

if __name__ == "__main__":
    test_pipeline_execution()
