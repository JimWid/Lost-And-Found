from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CreateLostItem(BaseModel):
    title: str
    description: str
    category: Optional[str] = "Other"
    foundLocation: Optional[str] = ""
    filename: Optional[str] = None