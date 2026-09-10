from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database.database import Base

class ExportRecord(Base):
    __tablename__ = "export_history"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    file_name = Column(String, nullable=False)
    task_title = Column(String, nullable=False)
    format = Column(String, nullable=False)  # "CSV" or "EXCEL"
    rows = Column(Integer, nullable=False, default=0)
    file_path = Column(String, nullable=False)
    created_at = Column(String, nullable=False)
