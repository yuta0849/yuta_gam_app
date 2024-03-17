import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from models import User


user = os.environ['MYSQL_USER']
password = os.environ['MYSQL_PASSWORD']
host = os.environ['MYSQL_HOST']
dbname = os.environ['MYSQL_DATABASE']

SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{user}:{password}@{host}/{dbname}"
# print(SQLALCHEMY_DATABASE_URL)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
try:
    with engine.connect() as connection:
        result = connection.execute("SELECT 1")
        print(result.fetchone())
except Exception as e:
    print("データベース接続に失敗しました:", e)

Base = declarative_base()

# FLASK_ENVがproductionだった場合にのみテーブルを作成(開発環境ではdockercontainer内でSQLを実行している)
if os.getenv('FLASK_ENV') == 'production':
    Base.metadata.create_all(bind=engine, tables=[User.__table__])
    
SessionLocal: Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)