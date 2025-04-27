# models.py
from sqlalchemy import Column, Integer, String, Date
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    name_pl = Column(String, nullable=True)
    category = Column(String)
    room = Column(String, nullable=False)
    row = Column(Integer, nullable=False)
    column = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)
    depth = Column(Integer, nullable=False)
    amount = Column(Integer, default=1, nullable=False)
    expiry_date = Column(Date, nullable=True)
    keywords = Column(String)
    notes = Column(String)
    image_url = Column(String)
