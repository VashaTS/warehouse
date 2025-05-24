# main.py
from fastapi import FastAPI, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import create_engine, or_
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text, distinct
from models import Base, Item
from datetime import date
from PIL import Image
import shutil
import os
import unicodedata

DATABASE_URL = "sqlite:///./warehouse.db"
UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base.metadata.create_all(bind=engine)


with engine.begin() as conn:
    conn.exec_driver_sql("""
        CREATE VIRTUAL TABLE IF NOT EXISTS item_fts
        USING fts5(
            name,
            name_pl,
            keywords,
            content='items',          -- table you already have
            content_rowid='id',       -- PK column in items
            tokenize = 'unicode61 remove_diacritics 2'
        )
    """)
    conn.exec_driver_sql("""
        INSERT INTO item_fts(item_fts) VALUES('rebuild')
    """)
with engine.begin() as conn:
    conn.exec_driver_sql("""
    CREATE TRIGGER IF NOT EXISTS item_ai AFTER INSERT ON items BEGIN
      INSERT INTO item_fts(rowid, name, name_pl, keywords)
      VALUES (new.id, new.name, new.name_pl, new.keywords);
    END;
    """)
    conn.exec_driver_sql("""
    CREATE TRIGGER IF NOT EXISTS item_au AFTER UPDATE ON items BEGIN
      UPDATE item_fts
      SET name     = new.name,
          name_pl  = new.name_pl,
          keywords = new.keywords
      WHERE rowid = new.id;
    END;
    """)
    conn.exec_driver_sql("""
    CREATE TRIGGER IF NOT EXISTS item_ad AFTER DELETE ON items BEGIN
      DELETE FROM item_fts WHERE rowid = old.id;
    END;
    """)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://192.168.1.202:5173"
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
    
    # FTS query – we use tokens, so append * for prefix search
    # e.g. user typed "zar" -> query string "zar*"
    fts_query = f'{q}*'
    
    rows = db.execute(text("""
        SELECT items.*
        FROM item_fts
        JOIN items ON items.id = item_fts.rowid
        WHERE item_fts MATCH :fts_query
        ORDER BY rank  -- FTS5’s built-in relevancy
        LIMIT 50;
    """), {'fts_query': fts_query}).mappings().all()
    
    db.close()
    return [dict(r) for r in rows]
with engine.begin() as c:
    c.exec_driver_sql("INSERT INTO item_fts(item_fts) VALUES('rebuild');")

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
@app.get("/rows")
def list_rows():
    """Return a sorted list of distinct row numbers present in the DB."""
    db = SessionLocal()
    rows = [r[0] for r in db.query(distinct(Item.row)).order_by(Item.row).all()]
    db.close()
    return rows


@app.get("/items/by_row/{row_num}")
def items_by_row(row_num: int):
    """Return all items that belong to the given row (any column/height/depth)."""
    db = SessionLocal()
    items = db.query(Item).filter(Item.row == row_num).all()
    db.close()
    return items
# list every item in the table
@app.get("/items")
def list_items():
    db = SessionLocal()
    items = db.query(Item).all()
    db.close()
    return items

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="frontend")
