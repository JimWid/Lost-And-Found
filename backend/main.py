from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from PIL import Image
from typing import Optional
import torch
import io
from datetime import datetime
from sqlalchemy.orm import Session

from main_model import processor, model, device
from db import get_db
from models import LostItem

from yolo_detector import detect_object
from categories import get_category_from_detection

app = FastAPI()

@app.post("/create-lost-item")
async def create_lost_item(
    file: UploadFile = File(...),
    foundLocation: Optional[str] = None,
    db: Session = Depends(get_db)):

    # Reads and process the image
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data))

    # Detecting Object with YOLO
    detection_result = detect_object(image)

    if detection_result["detected"]:
        category = get_category_from_detection(detection_result["class_name"], detection_result["confidence"])

        detected_object = detection_result["class_name"]
        detection_confidence = detection_result["confidence"]

    else:
        category = "Other"
        detected_object = None
        detection_confidence = None

    # Generates Captions (title and description)
    # The vision-language model may not be available (large weights). If it's
    # not loaded, return placeholder text so the API is usable without the
    # heavy model present.
    if processor is None or model is None:
        title = "(model not available)"
        description = "The captioning model is not loaded on the server. Configure and load the BLIP2 model to enable automatic captions."
    else:
        inputs = processor(images=image, return_tensors="pt").to(device)

        generated_title = model.generate(
            **inputs, 
            max_new_tokens=3, # Generates up to 3 tokens
            min_new_tokens=2, # At least 2 tokens
            num_beams=2,
            length_penalty=1.0
        )

        generated_description = model.generate(
            **inputs, 
            max_new_tokens=30, # Generates up to 50 tokens
            min_new_tokens=15, # At least 30 tokens
            num_beams=5,
            length_penalty=1.2
        )
        
        title = processor.decode(generated_title[0], skip_special_tokens=True)
        description = processor.decode(generated_description[0], skip_special_tokens=True)
    
    db_item = LostItem(
        title=title,
        description=description,
        category=category,
        foundLocation=foundLocation
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
        "addedAt": db_item.addedAt,
        "confidence": detection_confidence,
        "objectName": detected_object
    }

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
        "addedAt": item.addedAt
    }

