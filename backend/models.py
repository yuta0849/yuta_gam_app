from sqlalchemy import Column, Integer, String, Date, DECIMAL
from os import getenv
from database import Base, engine

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

# FLASK_ENVがproductionだった場合にのみテーブルを作成(開発環境ではdockercontainer内でSQLを実行している)
if getenv('FLASK_ENV') == 'production':
    User.__table__.create(bind=engine, checkfirst=True)