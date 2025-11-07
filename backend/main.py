from fastapi import FastAPI, File, UploadFile, HTTPException
from PIL import Image
import torch
import io
from datetime import datetime

from main import processor, model, device

app = FastAPI()

# Database test
captions_db = {}
caption_id_counter = 0

@app.post("/generate-captions")
async def generate_captions(file: UploadFile = File(...)):

    global caption_id_counter

    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data))

    # Generate Caption
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
    
    caption_id_counter += 1
    captions_db[caption_id_counter] = {
        "id": caption_id_counter,
        "title": title,
        "description": description,
        "filename": file.filename,
        "created_at": datetime.now().isoformat(),
    }

    return captions_db[caption_id_counter]

@app.get("/captions/{caption_id}")
async def get_caption(caption_id: int):
    if caption_id not in captions_db:
        raise HTTPException(status_code=404, detail="Caption not found")
    return captions_db[caption_id]

