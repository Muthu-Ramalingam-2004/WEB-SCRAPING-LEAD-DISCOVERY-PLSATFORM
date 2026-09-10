from sqlalchemy import Column, String, Boolean, JSON
from app.database.database import Base

class LeadModel(Base):
    __tablename__ = "leads"

    id = Column(String, primary_key=True, index=True)
    task_id = Column(String, index=True, nullable=False)
    organization_name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    location = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    pincode = Column(String, nullable=True)
    address = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=False)
    website = Column(String, nullable=False)
    whatsapp = Column(String, nullable=True)
    contact_person = Column(JSON, nullable=True)
    social_links = Column(JSON, nullable=True)
    confidence = Column(String, default="HIGH") # HIGH, MEDIUM, LOW
    verified = Column(Boolean, default=True)
    scraped_date = Column(String, nullable=False)
    sources = Column(JSON, nullable=True)
