from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.database import get_db
from app.models.lead import LeadModel

router = APIRouter()

def format_lead_response(lead: LeadModel):
    return {
        "id": lead.id,
        "taskId": lead.task_id,
        "organizationName": lead.organization_name,
        "category": lead.category,
        "location": lead.location,
        "city": lead.city,
        "state": lead.state,
        "pincode": lead.pincode,
        "address": lead.address,
        "phone": lead.phone,
        "email": lead.email,
        "website": lead.website,
        "whatsapp": lead.whatsapp,
        "contactPerson": lead.contact_person,
        "socialLinks": lead.social_links or [],
        "confidence": lead.confidence,
        "verified": lead.verified,
        "scrapedDate": lead.scraped_date,
        "sources": lead.sources or {}
    }

@router.get("/")
@router.get("")
def get_leads(
    task_id: Optional[str] = Query(None, alias="taskId"),
    search: Optional[str] = None,
    location: Optional[str] = None,
    category: Optional[str] = None,
    confidence: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(LeadModel)
    
    if task_id:
        query = query.filter(LeadModel.task_id == task_id)
    if confidence:
        query = query.filter(LeadModel.confidence == confidence)
        
    leads = query.all()
    
    # Filter in python for string matching if needed
    if location:
        loc_l = location.lower()
        leads = [l for l in leads if loc_l in l.location.lower() or loc_l in l.city.lower() or loc_l in l.state.lower()]
    if category:
        cat_l = category.lower()
        leads = [l for l in leads if cat_l in l.category.lower()]
    if search:
        s_l = search.lower()
        leads = [
            l for l in leads if
            s_l in l.organization_name.lower() or
            s_l in l.city.lower() or
            s_l in l.email.lower() or
            s_l in l.phone or
            s_l in l.website.lower()
        ]
        
    return [format_lead_response(l) for l in leads]

@router.get("/{lead_id}")
def get_lead_by_id(lead_id: str, db: Session = Depends(get_db)):
    lead = db.query(LeadModel).filter(LeadModel.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return format_lead_response(lead)
