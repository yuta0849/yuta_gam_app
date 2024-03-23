from sqlalchemy import Column, Integer, String, Date, DECIMAL, DateTime, UniqueConstraint, ForeignKey
from os import getenv
from database import Base, engine
import datetime

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

# class UserUploadedData(Base):
#     __tablename__ = 'user_uploaded_data'

#     id = Column(Integer, primary_key=True, index=True, autoincrement=True)
#     upload_timestamp = Column(DateTime)
#     user_id = Column(String(255), nullable=False)
#     save_data_name = Column(String(255), nullable=False)
#     date = Column(Date, nullable=False)
#     ad_unit = Column(String(255), nullable=False)
#     avg_adx_cpm = Column(DECIMAL(10, 2), nullable=False)
    
#     UniqueConstraint('user_id', 'save_data_name', name='uix_1') 

class UploadedDataset(Base):
    __tablename__ = 'uploaded_datasets'

    dataset_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    upload_timestamp = Column(DateTime)
    user_id = Column(String(255), nullable=False)
    save_data_name = Column(String(255), nullable=False)

    __table_args__ = (UniqueConstraint('user_id', 'save_data_name', name='uix_1'),)


class UploadedData(Base):
    __tablename__ = 'uploaded_data'

    data_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dataset_id = Column(Integer, ForeignKey('uploaded_datasets.dataset_id'))
    date = Column(Date, nullable=False)
    ad_unit = Column(String(255), nullable=False)
    avg_adx_cpm = Column(DECIMAL(10, 2), nullable=False)

# FLASK_ENVがproductionだった場合にのみテーブルを作成(開発環境ではdockercontainer内でSQLを実行している)
if getenv('FLASK_ENV') == 'production':
    User.__table__.create(bind=engine, checkfirst=True)
    UploadedDataset.__table__.create(bind=engine, checkfirst=True)
    UploadedData.__table__.create(bind=engine, checkfirst=True)