# Lost and Found

Short summary
---------------
**This is the same project but instead of using Blip2, we are using Qwen2, which is a most modern model, and faster. Follow the same instructions to use**
**Just to make a comparetion, Blip2 takes around ~10 minutes in generation captions in CPU, while Qwen2 takes ~3 mins, a major improvement!!**
**Click here to see it in action!** (https://www.youtube.com/watch?v=YZbugWGhxXA)

What this repository contains now (file structure)
```
lost-and-found/
│
├── backend/
│   ├── uploads/				# This folder will be created at the moment of uploading an image
│	│
│   ├── __init__.py				
│	├── categories.py			# Categories for detection
│   ├── db.py           		# Database
│   ├── main_model.py        	# Loads BLIP-2 model
│   ├── main.py       			# Main FastAPI
│   ├── models.py              	# SQLAlchemy models
│   ├── schemas.py             	# Pydantic schemas
│   ├── yolo_detector.py        # Loads YOLOv8 model
│	├── yolov8n.pt				# This will be created at the first run of backend
│	├── lost_items.db			# This will be created at the first run of backend (lost items local database)
│	└── requirements.txt		# Requirements
│
├── frontend/
│	│
│	├── public/	# Stores public assets/images
│	│
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             	# Main landing page
│   │   │   ├── find-item/page.tsx   	# List all lost items page
│   │   │   └── report-item/page.tsx    # Report lost item page
│   │   │
│   │   └── components/
│   │	  	└── Header.tsx
├── .gitignore	
└── README.md
```

How to run (backend + frontend) and try the site
------------------------------------------------
Requirements:
- Python 3.10–3.13, Node 16+ (or the version in frontend/package.json)
- Optional: NVIDIA GPU + CUDA for much faster model startup and inference

1. Open backend:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
2. (Optional) Open API docs to exercise endpoints: http://127.0.0.1:8000/docs

Run the frontend
1. Open a new shell and from repo root:
```powershell
cd frontend
npm install
npm run dev
```
2. Open the frontend: http://127.0.0.1:3000

Notes on models & startup
------------------------
- Models (BLIP-2 and YOLO weights) are large. Initial server start will be slow while models load (minutes on CPU).
- A NVIDIA GPU dramatically speeds startup and inference. On CPU-only machines expect much longer delays and higher memory usage.

Endpoints on FastAPI
-------------------------

- POST /upload
  - Purpose: accept a multipart/form-data image upload and save it to backend/uploads; returns filename.

- POST /analyze-image
  - Purpose: provide a saved filename (returned by /upload) to run YOLO detection + BLIP captioning; returns title, description, detected category, objectName, confidence and a filename or file_url.

- POST /create-lost-item
  - Purpose: create a DB entry for a lost item (title, description, category, foundLocation, filename). Payload follows CreateLostItem schema.
  
- GET /lost-items
  - Purpose: list lost items. Optional query params:
    - category — filter by category name
    - since — ISO datetime to filter items added after the timestamp

- GET /lost-items/{item_id}
  - Purpose: retrieve a single lost item by numeric id.

- DELETE /delete-lost-item/{item_id}
  - Purpose: remove an item from the DB (e.g., when claimed/found (not implemented yet)).

Downsides / Caveats
-------------------
- Slow startup: loading BLIP-2 and YOLO on CPU can take several minutes; memory heavy.
- Better with NVIDIA GPU and proper CUDA drivers.
- Persistence: DB and model state are local.


## Future plans (DONE)
**Optimization plan:**
Probably change to a smaller BLIP variants to reduce memory and startup time:
There is a new version using Qwen2, where caption generation is half the time with Blip2!
- **Click on Branch and change it to Using-Qwen2 and follow the same instructions to use!** 

## Images:
## Main Page:
<img width="1911" height="927" alt="Screenshot 2025-11-29 203926" src="https://github.com/user-attachments/assets/3c3b87c1-c7d3-4ca1-b62f-a56979545f2c" />

## Report Item Page:
<img width="1914" height="924" alt="Screenshot 2025-11-29 204640" src="https://github.com/user-attachments/assets/b240cad3-eb36-448a-a878-764f93e50925" />

## Find Lost Items Page:
<img width="1914" height="925" alt="Screenshot 2025-11-29 204849" src="https://github.com/user-attachments/assets/5e1ac9c9-bd96-4900-8eee-8fac34e5e7ca" />




