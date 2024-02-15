# データベーススキーマを定義するためのファイルで、FlaskのORM（Object Relational Mapping）ツールであるSQLAlchemyを使用してモデルを定義。
# モデルはデータベーステーブルの各行を表すクラス。
# 以下は仮なので要改変

# models.pyのコードは SQLAlchemy ORM (Object Relational Mapper) の使用を示しており、これはデータベース操作をより直観的でPythonらしいコードで行うためのものです。
# データベースとテーブルが既に作成されている場合でも、アプリケーション内からデータベースを操作するためにはこのようなモデル定義が必要になります。

from sqlalchemy import Column, Integer, String
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)