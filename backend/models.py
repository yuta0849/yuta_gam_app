from sqlalchemy import Column, Integer, String, Date, DECIMAL
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    google_user_id = Column(String(255), unique=True, nullable=False)
    name = Column(String(255))
    email = Column(String(255))

class Adx_Data(Base):
    __tablename__ = "Adx_Data"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    date = Column(Date)
    ad_unit = Column(String(255))
    adx_impressions = Column(Integer)
    adx_revenue = Column(DECIMAL(10, 2))
    avg_adx_cpm = Column(DECIMAL(10, 2))