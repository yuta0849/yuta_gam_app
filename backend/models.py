# データベーススキーマを定義するためのファイルで、FlaskのORM（Object Relational Mapping）ツールであるSQLAlchemyを使用してモデルを定義。
# モデルはデータベーステーブルの各行を表すクラス。

# models.pyのコードは SQLAlchemy ORM (Object Relational Mapper) の使用を示しており、これはデータベース操作をより直観的でPythonらしいコードで行うためのもの。
# データベースとテーブルが既に作成されている場合でも、アプリケーション内からデータベースを操作するためにはこのようなモデル定義が必要になる。

from sqlalchemy import Column, Integer, String, Date, DECIMAL
from .database import Base

class AdxLast7daysData(Base):
    __tablename__ = "Adx_Last_7days_Data"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    date = Column(Date)
    ad_unit = Column(String(255))
    adx_impressions = Column(Integer)
    adx_revenue = Column(DECIMAL(10, 2))
    avg_adx_cpm = Column(DECIMAL(10, 2))