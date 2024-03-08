import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base

user = os.environ['MYSQL_USER']
password = os.environ['MYSQL_PASSWORD']
host = os.environ['MYSQL_HOST']
dbname = os.environ['MYSQL_DATABASE']

SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{user}:{password}@{host}/{dbname}"
print(SQLALCHEMY_DATABASE_URL)

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal: Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()