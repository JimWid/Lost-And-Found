from sqlalchemy import Column, Integer, String, DateTime, Float
from datetime import datetime

from db import Base, engine

class LostItem(Base):
    __tablename__ = "lost_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False)
    foundLocation = Column(String, nullable=True)
    addedAt = Column(DateTime, default=datetime.now())
    confidence = Column(Float, nullable=True)
    objectName = Column(String, nullable=True)

Base.metadata.create_all(bind=engine)