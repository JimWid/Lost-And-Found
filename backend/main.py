from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from PIL import Image
from typing import Optional
from datetime import datetime
import io
import os
from sqlalchemy.orm import Session

from qwen_model import create_description, create_title, normalize_caption
from db import get_db
from models import LostItem
from schemas import CreateLostItem  

from yolo_detector import detect_object
from categories import get_category_from_detection

from uuid import uuid4
import uvicorn

from qwen_vl_utils import process_vision_info

app = FastAPI()

# Middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.post("/upload")
async def create_upload_file(file: UploadFile = File(...)):

    filename = f"{uuid4()}.jpg"
    contents = await file.read()
    saved_path = os.path.join(UPLOAD_DIR, filename)

    # Svaing the file
    with open(saved_path, "wb") as f:
        f.write(contents)

    return {
        "filename": filename,
        }

def generate_captions(image: Image.Image):

    # Generates Captions (title and description)
    title = create_title(image)
    description = create_description(image)

    title = normalize_caption(title)
    description = normalize_caption(description)

    return title, description   

@app.post("/analyze-image")
async def analyze_image_by_filename(payload: dict = Body(...)):
    filename = payload.get("filename")
    if not filename:
        raise HTTPException(status_code=400, detail="filename required")

    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="file not found")

    # Load image from disk
    with open(file_path, "rb") as f:
        image_data = f.read()
    try:
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Cannot open image: {e}")

    # Running detector & captioner
    detection_result = detect_object(image)
    if detection_result["detected"]:
        category = get_category_from_detection(detection_result["class_name"], detection_result["confidence"])
        detected_object = detection_result["class_name"]
        detection_confidence = detection_result["confidence"]
    else:
        category = "Other"
        detected_object = None
        detection_confidence = None

    title, description = generate_captions(image)

    return {
        "title": title,
        "description": description,
        "category": category,
        "objectName": detected_object,
        "confidence": detection_confidence,
        "filename": payload.get("file_url")
    }

@app.post("/create-lost-item")
async def create_lost_item(
    payload: CreateLostItem = Body(...),
    db: Session = Depends(get_db)):

    if not payload.title or not payload.description:
        raise HTTPException(status_code=400, detail="title and description required")

    db_item = LostItem(
        title=payload.title,
        description=payload.description,
        category=payload.category,
        foundLocation=payload.foundLocation,
        filename=payload.filename
    )

    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    return {
        "id": db_item.id,
        "title": db_item.title,
        "description": db_item.description,
        "category": db_item.category,
        "foundLocation": db_item.foundLocation,
        "filename": db_item.filename,
        "addedAt": db_item.addedAt,
    }

@app.get("/lost-items")
async def list_lost_items(
    category: Optional[str] = Query(None),
    since: Optional[str] = Query(None),
    db: Session = Depends(get_db)
    ):

    q = db.query(LostItem)
    if category:
        q = q.filter(LostItem.category == category)
    if since:
        try:
            dt = datetime.fromisoformat(since)
            q = q.filter(LostItem.addedAt >= dt)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid since datetime")
    
    items = q.order_by(LostItem.addedAt.desc()).all()
    results = []

    for item in items:
        results.append({
            "id": item.id,
            "title": item.title,
            "description": item.description,
            "category": item.category,
            "foundLocation": item.foundLocation,
            "filename": item.filename,
            "addedAt": item.addedAt.isoformat(),
        })

    return results
    

@app.get("/lost-items/{item_id}")
async def get_lost_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(LostItem).filter(LostItem.id == item_id).first()
    
    if item is None:
        raise HTTPException(status_code=404, detail="Lost item not found")
    
    return {
        "id": item.id,
        "title": item.title,
        "description": item.description,
        "category": item.category,
        "foundLocation": item.foundLocation,
        "filename": item.filename,
        "addedAt": item.addedAt,
    }


@app.delete("/delete-lost-item/{item_id}")
async def delete_lost_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(LostItem).filter(LostItem.id == item_id).first()

    if item is None:
        raise HTTPException(status_code=404, detail="Lost item not found")
    
    if item.filename:
        file_path = os.path.join(UPLOAD_DIR, item.filename)
        if os.path.exists(file_path):
            os.remove(file_path)

    db.delete(item)
    db.commit()

    return {"message": f"Item {item_id} deleted successfully"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1")


