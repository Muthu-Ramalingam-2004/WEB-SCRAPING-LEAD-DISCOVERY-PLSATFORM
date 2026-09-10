from pydantic import BaseModel
from typing import Optional

class ExportHistoryResponse(BaseModel):
    id: str
    fileName: str
    taskTitle: str
    format: str
    rows: int
    createdAt: str

    class Config:
        from_attributes = True
