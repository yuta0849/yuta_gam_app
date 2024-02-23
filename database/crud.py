# データベース操作（Create、Read、Update、Delete）を行う関数を記述するためのファイル。
from sqlalchemy.orm import Session
# from . import models
from .models import AdxLast7daysData

# app.pyで呼び出す
def get_units():
    session = Session()
    result = session.query(AdxLast7daysData).all()
    session.close()

    units_list = []
    for row in result:
        # 下記1行を変更する必要あり
        units_list.append({'id': row.id, 'date': str(row.date), 'ad_unit': row.ad_unit}) 
    return units_list


# def get_user(db: Session, user_id: int):
#     return db.query(models.User).filter(models.User.id == user_id).first()

# def create_user(db: Session, name: str):
#     db_user = models.User(name=name)
#     db.add(db_user)
#     db.commit()
#     db.refresh(db_user)
#     return db_user