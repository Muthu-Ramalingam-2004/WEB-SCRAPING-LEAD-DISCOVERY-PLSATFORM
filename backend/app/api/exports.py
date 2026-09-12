import os
import io
import csv
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

from app.database.database import get_db
from app.models.export import ExportRecord
from app.schemas.export import ExportHistoryResponse

router = APIRouter()

EXPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "exports")
os.makedirs(EXPORTS_DIR, exist_ok=True)

# Sample lead dataset for exports
DEFAULT_LEADS = [
    {
        "id": "LEAD-001",
        "organization_name": "St. Joseph Higher Secondary School",
        "category": "CBSE School",
        "city": "Puducherry",
        "state": "Puducherry",
        "location": "Lawspet, Puducherry",
        "phone": "+91 413 225 1234",
        "email": "contact@stjosephpdy.edu.in",
        "website": "stjosephpdy.edu.in",
        "confidence": "HIGH",
        "sources_count": 4,
    },
    {
        "id": "LEAD-002",
        "organization_name": "Achariya World Class Educational Campus",
        "category": "International School",
        "city": "Puducherry",
        "state": "Puducherry",
        "location": "Villianur, Puducherry",
        "phone": "+91 413 260 0100",
        "email": "info@achariya.in",
        "website": "achariya.in",
        "confidence": "HIGH",
        "sources_count": 5,
    },
    {
        "id": "LEAD-003",
        "organization_name": "Kendriya Vidyalaya No. 1",
        "category": "Central Government School",
        "city": "Puducherry",
        "state": "Puducherry",
        "location": "JIPMER Campus, Puducherry",
        "phone": "+91 413 227 2345",
        "email": "kv1puducherry@gmail.com",
        "website": "no1puducherry.kvs.ac.in",
        "confidence": "HIGH",
        "sources_count": 3,
    },
    {
        "id": "LEAD-004",
        "organization_name": "College of Engineering Guindy (CEG)",
        "category": "Engineering College",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "location": "Guindy, Chennai",
        "phone": "+91 44 2235 7004",
        "email": "dean@ceg.annauniv.edu",
        "website": "ceg.annauniv.edu",
        "confidence": "HIGH",
        "sources_count": 6,
    },
    {
        "id": "LEAD-005",
        "organization_name": "SSN College of Engineering",
        "category": "Private Engineering College",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "location": "Kalavakkam, OMR, Chennai",
        "phone": "+91 44 2746 9700",
        "email": "info@ssn.edu.in",
        "website": "ssn.edu.in",
        "confidence": "HIGH",
        "sources_count": 5,
    },
    {
        "id": "LEAD-006",
        "organization_name": "PSG College of Technology",
        "category": "Engineering College",
        "city": "Coimbatore",
        "state": "Tamil Nadu",
        "location": "Peelamedu, Coimbatore",
        "phone": "+91 422 257 2177",
        "email": "principal@psgtech.ac.in",
        "website": "psgtech.edu",
        "confidence": "HIGH",
        "sources_count": 4,
    },
    {
        "id": "LEAD-007",
        "organization_name": "Zoho Corporation Headquarters",
        "category": "Software & SaaS Company",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "location": "Estancia IT Park, Guduvanchery",
        "phone": "+91 44 6744 7070",
        "email": "sales@zohocorp.com",
        "website": "zoho.com",
        "confidence": "HIGH",
        "sources_count": 7,
    },
    {
        "id": "LEAD-008",
        "organization_name": "Petit Seminaire Higher Secondary School",
        "category": "Matriculation School",
        "city": "Puducherry",
        "state": "Puducherry",
        "location": "Heritage Town, Puducherry",
        "phone": "+91 413 233 4567",
        "email": "petitseminaire@gmail.com",
        "website": "petitseminaire.ac.in",
        "confidence": "MEDIUM",
        "sources_count": 3,
    },
]

def generate_csv_bytes(leads: List[dict]) -> bytes:
    output = io.StringIO()
    # Add UTF-8 BOM so Excel opens non-ASCII properly
    output.write('\ufeff')
    writer = csv.writer(output)
    
    headers = [
        "Lead ID", "Organization Name", "Category", "City", "State", 
        "Location", "Phone", "Email", "Website", "Confidence Level", "Sources Count"
    ]
    writer.writerow(headers)
    
    for item in leads:
        writer.writerow([
            item.get("id", ""),
            item.get("organization_name", ""),
            item.get("category", ""),
            item.get("city", ""),
            item.get("state", ""),
            item.get("location", ""),
            item.get("phone", ""),
            item.get("email", ""),
            item.get("website", ""),
            item.get("confidence", ""),
            item.get("sources_count", 0),
        ])
        
    return output.getvalue().encode('utf-8')

def generate_excel_bytes(leads: List[dict]) -> bytes:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Discovered Leads"
    
    # Title Row
    ws.merge_cells("A1:K1")
    title_cell = ws["A1"]
    title_cell.value = "Lead Discovery Platform — Exported Leads"
    title_cell.font = Font(name="Calibri", size=14, bold=True, color="1E293B")
    title_cell.alignment = Alignment(horizontal="left", vertical="center")
    ws.row_dimensions[1].height = 28

    # Header Row
    headers = [
        "Lead ID", "Organization Name", "Category", "City", "State", 
        "Location", "Phone", "Email", "Website", "Confidence Level", "Sources Count"
    ]
    
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="0D9488", end_color="0D9488", fill_type="solid")
    header_alignment = Alignment(horizontal="center", vertical="center")
    thin_border = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )

    for col_num, header_title in enumerate(headers, 1):
        cell = ws.cell(row=2, column=col_num, value=header_title)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = header_alignment
        cell.border = thin_border

    ws.row_dimensions[2].height = 24

    # Data Rows
    row_font = Font(name="Calibri", size=10, color="334155")
    row_alt_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")

    for row_idx, item in enumerate(leads, start=3):
        row_data = [
            item.get("id", ""),
            item.get("organization_name", ""),
            item.get("category", ""),
            item.get("city", ""),
            item.get("state", ""),
            item.get("location", ""),
            item.get("phone", ""),
            item.get("email", ""),
            item.get("website", ""),
            item.get("confidence", ""),
            item.get("sources_count", 0),
        ]
        
        ws.row_dimensions[row_idx].height = 20
        use_alt = (row_idx % 2 == 0)

        for col_idx, val in enumerate(row_data, start=1):
            cell = ws.cell(row=row_idx, column=col_idx, value=val)
            cell.font = row_font
            cell.border = thin_border
            if use_alt:
                cell.fill = row_alt_fill
            if col_idx in [1, 4, 5, 10, 11]:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            else:
                cell.alignment = Alignment(horizontal="left", vertical="center")

    # Auto-adjust column widths
    for col in ws.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            if cell.row > 1 and cell.value:
                max_len = max(max_len, len(str(cell.value)))
        ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()

def seed_initial_history_if_needed(db: Session):
    count = db.query(ExportRecord).count()
    if count == 0:
        now_str = datetime.now().strftime("%d %b %Y, %I:%M %p")
        
        # 1. CBSE Schools CSV
        csv_bytes = generate_csv_bytes(DEFAULT_LEADS[:5])
        fn1 = "leads_export_cbse_puducherry_2026.csv"
        fp1 = os.path.join(EXPORTS_DIR, fn1)
        with open(fp1, "wb") as f:
            f.write(csv_bytes)
        rec1 = ExportRecord(
            id="EXP-1001",
            file_name=fn1,
            task_title="CBSE Schools in Puducherry",
            format="CSV",
            rows=5,
            file_path=fp1,
            created_at=now_str
        )

        # 2. Engineering Colleges Excel
        excel_bytes = generate_excel_bytes(DEFAULT_LEADS[3:7])
        fn2 = "leads_export_engineering_chennai_2026.xlsx"
        fp2 = os.path.join(EXPORTS_DIR, fn2)
        with open(fp2, "wb") as f:
            f.write(excel_bytes)
        rec2 = ExportRecord(
            id="EXP-1002",
            file_name=fn2,
            task_title="Engineering Colleges in Tamil Nadu",
            format="EXCEL",
            rows=4,
            file_path=fp2,
            created_at=now_str
        )

        # 3. All Discovered Leads CSV
        csv_bytes_all = generate_csv_bytes(DEFAULT_LEADS)
        fn3 = "leads_export_all_discovered_2026.csv"
        fp3 = os.path.join(EXPORTS_DIR, fn3)
        with open(fp3, "wb") as f:
            f.write(csv_bytes_all)
        rec3 = ExportRecord(
            id="EXP-1003",
            file_name=fn3,
            task_title="All Discovered Leads",
            format="CSV",
            rows=len(DEFAULT_LEADS),
            file_path=fp3,
            created_at=now_str
        )

        db.add_all([rec1, rec2, rec3])
        db.commit()

from app.models.lead import LeadModel
from app.models.task import ScrapingTaskModel
from fastapi import Query

def fetch_leads_for_export(db: Session, task_id: Optional[str] = None) -> List[dict]:
    query = db.query(LeadModel)
    if task_id:
        query = query.filter(LeadModel.task_id == task_id)
    db_leads = query.all()

    if not db_leads and not task_id:
        return DEFAULT_LEADS

    formatted_leads = []
    for l in db_leads:
        formatted_leads.append({
            "id": l.id,
            "organization_name": l.organization_name,
            "category": l.category,
            "city": l.city,
            "state": l.state,
            "location": l.location or l.address,
            "phone": l.phone,
            "email": l.email,
            "website": l.website,
            "confidence": l.confidence,
            "sources_count": len(l.sources) if l.sources else 1,
        })

    return formatted_leads

def build_csv_export_response(db: Session, task_id: Optional[str] = None) -> Response:
    if task_id:
        task = db.query(ScrapingTaskModel).filter(ScrapingTaskModel.id == task_id).first()
        if not task and db.query(LeadModel).filter(LeadModel.task_id == task_id).count() == 0:
            raise HTTPException(status_code=404, detail=f"Scraping task {task_id} not found.")
        task_title = f"{task.keyword if task else 'Task'} in {task.location if task else 'Target'} ({task_id})"
    else:
        task_title = "All Discovered Leads"

    leads = fetch_leads_for_export(db, task_id)
    csv_bytes = generate_csv_bytes(leads)
    
    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_name = f"leads_export_{task_id or 'all'}_{timestamp_str}.csv"
    file_path = os.path.join(EXPORTS_DIR, file_name)

    with open(file_path, "wb") as f:
        f.write(csv_bytes)

    now_str = datetime.now().strftime("%d %b %Y, %I:%M %p")
    exp_id = f"EXP-{uuid.uuid4().hex[:6].upper()}"
    rec = ExportRecord(
        id=exp_id,
        file_name=file_name,
        task_title=task_title,
        format="CSV",
        rows=len(leads),
        file_path=file_path,
        created_at=now_str
    )
    db.add(rec)
    db.commit()

    return Response(
        content=csv_bytes,
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{file_name}"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        }
    )

def build_excel_export_response(db: Session, task_id: Optional[str] = None) -> Response:
    if task_id:
        task = db.query(ScrapingTaskModel).filter(ScrapingTaskModel.id == task_id).first()
        if not task and db.query(LeadModel).filter(LeadModel.task_id == task_id).count() == 0:
            raise HTTPException(status_code=404, detail=f"Scraping task {task_id} not found.")
        task_title = f"{task.keyword if task else 'Task'} in {task.location if task else 'Target'} ({task_id})"
    else:
        task_title = "All Discovered Leads"

    leads = fetch_leads_for_export(db, task_id)
    excel_bytes = generate_excel_bytes(leads)

    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_name = f"leads_export_{task_id or 'all'}_{timestamp_str}.xlsx"
    file_path = os.path.join(EXPORTS_DIR, file_name)

    with open(file_path, "wb") as f:
        f.write(excel_bytes)

    now_str = datetime.now().strftime("%d %b %Y, %I:%M %p")
    exp_id = f"EXP-{uuid.uuid4().hex[:6].upper()}"
    rec = ExportRecord(
        id=exp_id,
        file_name=file_name,
        task_title=task_title,
        format="EXCEL",
        rows=len(leads),
        file_path=file_path,
        created_at=now_str
    )
    db.add(rec)
    db.commit()

    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="{file_name}"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        }
    )

@router.get("/history", response_model=List[ExportHistoryResponse])
def get_export_history(db: Session = Depends(get_db)):
    records = db.query(ExportRecord).order_by(ExportRecord.id.desc()).all()
    result = []
    for r in records:
        result.append(ExportHistoryResponse(
            id=r.id,
            fileName=r.file_name,
            taskTitle=r.task_title,
            format=r.format,
            rows=r.rows,
            createdAt=r.created_at
        ))
    return result

@router.get("/csv")
def export_csv(
    task_id: Optional[str] = Query(None, alias="taskId"),
    db: Session = Depends(get_db)
):
    return build_csv_export_response(db, task_id)

@router.get("/excel")
def export_excel(
    task_id: Optional[str] = Query(None, alias="taskId"),
    db: Session = Depends(get_db)
):
    return build_excel_export_response(db, task_id)

@router.get("/download/{export_id}")
def download_export_by_id(export_id: str, db: Session = Depends(get_db)):
    seed_initial_history_if_needed(db)
    rec = db.query(ExportRecord).filter(ExportRecord.id == export_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Export record not found.")

    if os.path.exists(rec.file_path):
        with open(rec.file_path, "rb") as f:
            content = f.read()
    else:
        # Regenerate if file missing
        if rec.format == "CSV":
            content = generate_csv_bytes(DEFAULT_LEADS)
        else:
            content = generate_excel_bytes(DEFAULT_LEADS)
        with open(rec.file_path, "wb") as f:
            f.write(content)

    media_type = "text/csv; charset=utf-8" if rec.format == "CSV" else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    return Response(
        content=content,
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{rec.file_name}"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        }
    )
