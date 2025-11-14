# Lost and Found

Short summary
---------------
This repository contains full stack website (backend + frontend) for a "Lost & Found" website that helps list items found around campus/university. The backend uses YOLO for object detection and a vision-language model (BLIP) to auto-generate short titles and descriptions from item photos. Uploaded items are stored in the database with metadata (location, filename, generated captions (title + description), id) and can be listed, retrieved, or deleted.
**Click here to see it in action!** (https://www.youtube.com/watch?v=YZbugWGhxXA)

What this repository contains now (file structure)
-------------------------------------------------
- backend/
  - main.py                — FastAPI app and endpoints
  - main_model.py          — model & processor loader (BLIP-2) and device setup
  - yolo_detector.py       — YOLO wrapper for local detection
  - models.py              — SQLAlchemy model(s) (LostItem)
  - schemas.py             — Pydantic schemas (CreateLostItem)
  - db.py                  — DB session helper (get_db)
  - requirements.txt       — Python dependencies
- frontend/            	   — Next/js app
  - src/
  	- app/
	  - main.tsx		   		   — Main page / Hero page
	  - report-item/main.tsx       — Page to report lost item
	  - find-item/main.tsx		   — Page to find all listed items
	- components/
	  - header.tsx  	   — Header component

- README.md                — This file
-------------------------------------------------

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


## Future plans

- Optimization plan:
  - Probably change to a smaller BLIP variants to reduce memory and startup time.
  - Probably add model quantization to lower inference cost and latency.





