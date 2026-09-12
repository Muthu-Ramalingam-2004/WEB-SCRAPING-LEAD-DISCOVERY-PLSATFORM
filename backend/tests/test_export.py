import time
from fastapi.testclient import TestClient
from app.main import app
from app.database.database import SessionLocal
from app.models.task import ScrapingTaskModel
from app.models.lead import LeadModel
from app.models.export import ExportRecord

client = TestClient(app)

def test_export_flow():
    task_id = f"EXPORT-TEST-{int(time.time())}"
    print(f"\n[TEST] Creating task {task_id} and saving newly scraped leads...")

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
            results_count=2,
            websites_count=2,
            status="COMPLETED",
            created_at="12 Sep 2026, 04:30 PM"
        )
        db.add(db_task)

        lead1 = LeadModel(
            id=f"LEAD-NEW-01-{task_id}",
            task_id=task_id,
            organization_name="New Puducherry International CBSE School",
            category="CBSE School",
            location="Puducherry",
            city="Puducherry",
            state="Puducherry",
            pincode="605001",
            address="100 ECR Road, Puducherry - 605001",
            phone="+91 413 299 8877",
            email="info@pdycbse.edu.in",
            website="pdycbse.edu.in",
            confidence="HIGH",
            verified=True,
            scraped_date="12 Sep 2026",
            sources={"phone": {"field": "phone", "value": "+91 413 299 8877"}}
        )

        lead2 = LeadModel(
            id=f"LEAD-NEW-02-{task_id}",
            task_id=task_id,
            organization_name="Pondicherry Public School",
            category="CBSE School",
            location="Puducherry",
            city="Puducherry",
            state="Puducherry",
            pincode="605008",
            address="50 Lawspet Main Rd, Puducherry - 605008",
            phone="+91 413 222 1100",
            email="contact@pondypublic.ac.in",
            website="pondypublic.ac.in",
            confidence="HIGH",
            verified=True,
            scraped_date="12 Sep 2026",
            sources={"phone": {"field": "phone", "value": "+91 413 222 1100"}}
        )

        db.add_all([lead1, lead2])
        db.commit()
    finally:
        db.close()

    # TEST 1: Task CSV Export GET /api/tasks/{task_id}/export/csv
    print(f"[TEST 1] Testing CSV Export: GET /api/tasks/{task_id}/export/csv...")
    res_csv = client.get(f"/api/tasks/{task_id}/export/csv")
    print(f"  Response Status: {res_csv.status_code}")
    print(f"  Content-Type: {res_csv.headers.get('content-type')}")
    print(f"  Content-Disposition: {res_csv.headers.get('content-disposition')}")

    assert res_csv.status_code == 200, f"Expected 200, got {res_csv.status_code}"
    assert "text/csv" in res_csv.headers.get("content-type", ""), "Should return CSV content type"
    assert "New Puducherry International CBSE School" in res_csv.text, "CSV output must contain newly scraped lead data!"
    assert "Pondicherry Public School" in res_csv.text, "CSV output must contain newly scraped lead data!"
    print("  [PASSED] Task CSV Export test succeeded!")

    # TEST 2: Task Excel Export GET /api/tasks/{task_id}/export/excel
    print(f"[TEST 2] Testing Excel Export: GET /api/tasks/{task_id}/export/excel...")
    res_excel = client.get(f"/api/tasks/{task_id}/export/excel")
    print(f"  Response Status: {res_excel.status_code}")
    print(f"  Content-Type: {res_excel.headers.get('content-type')}")

    assert res_excel.status_code == 200, f"Expected 200, got {res_excel.status_code}"
    assert "spreadsheetml" in res_excel.headers.get("content-type", ""), "Should return Excel content type"
    assert len(res_excel.content) > 1000, "Excel output byte size should be valid!"
    print("  [PASSED] Task Excel Export test succeeded!")

    # TEST 3: All Leads CSV Export GET /api/exports/csv
    print(f"[TEST 3] Testing All Leads CSV Export: GET /api/exports/csv...")
    res_all_csv = client.get("/api/exports/csv")
    assert res_all_csv.status_code == 200, f"Expected 200, got {res_all_csv.status_code}"
    print("  [PASSED] All Leads CSV Export test succeeded!")

    # TEST 4: Export History Record Verification
    print(f"[TEST 4] Verifying Export History records in Supabase...")
    res_hist = client.get("/api/exports/history")
    assert res_hist.status_code == 200
    hist_data = res_hist.json()
    print(f"  Export History contains {len(hist_data)} items.")
    latest_items = [item for item in hist_data if task_id in item.get("taskTitle", "")]
    assert len(latest_items) >= 2, "Export history records must be created for newly exported task!"
    print("  [PASSED] Export History test succeeded!")

    print("\n[ALL EXPORT TESTS PASSED SUCCESSFULLY!]")

if __name__ == "__main__":
    test_export_flow()
