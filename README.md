# Lost and Found

Short summary
---------------
This project is a "Lost & Found" website. It uses computer vision (YOLO) to detect objects in uploaded images and a text-generation model to automatically produce short titles and descriptions for found items. Detected items are saved to the database so they can be browsed, claimed, or reported by users via a the webiste.

Future program vision
---------------------
Our goal is to build a full website that helps students and faculty find and list lost items found across campus. Key features we plan to deliver:

- Allow users to upload photos of found items. The backend will automatically:
	- detect the object (e.g., "backpack", "phone", "wallet") using YOLO,
	- generate a concise title and descriptive text using a vision-language model,
	- store the item with metadata (location, photo, generated caption, detection confidence).
- A front-end UI where people can browse recent items (maybe), search by category, and mark items as claimed/found.
- When an item is claimed, it should be removed or marked as claimed in the database.

What this repository contains now
---------------------------------

- `backend/` — FastAPI backend code, YOLO detector, model loader, and database bindings.
- `backend/yolov8n.pt` — YOLO weights used for local object detection.
- `requirements.txt` — Python dependencies used by the project.

Requirements
------------

- Python 3.13.9 or lower (don't use 3.14!!)
- Create and activate a virtual environment, then install dependencies:

```powershell
python -m venv venv
venv\Scripts\Activate
pip install -r requirements.txt
```

Copy the Repo:
```
git clone https://github.com/JimWid/Lost-And-Found.git
```

Run the backend (quick try)
---------------------------

Start the FastAPI app (run from the repository root):

```powershell
uvicorn backend.main:app --reload --port 8000
```
***make sure to add to the url "/docs", for example "http://127.0.0.1:8000/docs"***

Endpoints you can try now
-------------------------

- POST /create-lost-item — upload an image to create a lost-item entry.

- GET /lost-items/{item_id} — retrieve a saved item by id:

Next steps (just listed for planning)
----------------------------------------------------------------

- Design the front end (React/Next.js) and wire up UI flows to the backend endpoints.
- Implement delete or "mark as claimed" behavior to remove or flag lost items when they are returned.
- Connect the backend to the front end (file uploads, authentication???, and API wiring).
- Improve persistence and migrations (review SQLAlchemy models and add Alembic migrations if needed). (We could keep it local)



