# main.py
from fastapi import FastAPI, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import create_engine, or_
from sqlalchemy.orm import sessionmaker
from models import Base, Item
from datetime import date
from PIL import Image
import shutil
import os

DATABASE_URL = "sqlite:///./warehouse.db"
UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://192.168.1.126:5173"  # ← ADD THIS LINE if you use LAN IP like in your screenshot
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ItemCreate(BaseModel):
    name: str
    name_pl: str = None
    category: str = None
    room: str
    row: int
    column: int
    height: int
    depth: int
    amount: int = 1
    expiry_date: date = None
    keywords: str = None
    notes: str = None
    image_url: str = None

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # save original
    filename = file.filename
    orig_path = os.path.join(UPLOAD_DIR, filename)
    with open(orig_path, "wb+") as f:
        shutil.copyfileobj(file.file, f)

    # save thumbnail
    thumb_filename = f"thumb_{filename}"
    thumb_path = os.path.join(UPLOAD_DIR, thumb_filename)

    try:
        image = Image.open(orig_path)
        image.thumbnail((200, 200))
        image.save(thumb_path)
    except Exception as e:
        # fallback if file is not a valid image
        thumb_filename = None

    return {
        "filename": f"/uploads/{filename}",
        "thumbnail": f"/uploads/{thumb_filename}" if thumb_filename else None
    }


@app.post("/items")
def create_item(item: ItemCreate):
    db = SessionLocal()
    db_item = Item(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    db.close()
    return db_item

@app.get("/items/search")
def search_items(q: str = Query(..., min_length=1)):
    db = SessionLocal()
    # search in name, name_pl, and keywords
    items = db.query(Item).filter(
        or_(
            Item.name.ilike(f"%{q}%"),
            Item.name_pl.ilike(f"%{q}%"),
            Item.keywords.ilike(f"%{q}%")
        )
    ).all()
    db.close()
    return items

@app.put("/items/{item_id}")
def update_item(item_id: int, updated_item: ItemCreate):
    db = SessionLocal()
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if not db_item:
        db.close()
        return {"error": "Item not found"}

    for field, value in updated_item.dict().items():
        setattr(db_item, field, value)
    db.commit()
    db.refresh(db_item)
    db.close()
    return db_item

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
