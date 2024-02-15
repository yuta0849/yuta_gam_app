# データベースエンジンとの接続を管理するファイルで、SQLAlchemyのエンジンとセッションを作成。
# 以下は仮なので要改変

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

user = os.getenv("MYSQL_USER")
password = os.getenv("MYSQL_PASSWORD")
host = os.getenv("MYSQL_HOST", "localhost")  # optional: "localhost" is a default value
dbname = os.getenv("MYSQL_DBNAME")

# ソースコード上にパスワード等を直接表記しない
# ターミナル上で以下の環境変数設定が必要
# export MYSQL_USER='username'
# export MYSQL_PASSWORD='password'
# export MYSQL_HOST='localhost'
# export MYSQL_DBNAME='dbname'
SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{user}:{password}@{host}/{dbname}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()