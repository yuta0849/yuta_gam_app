# データベース操作（Create、Read、Update、Delete）を行う関数を記述するためのファイル。
# 以下は仮なので要改変

from sqlalchemy.orm import Session
from . import models

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, name: str):
    db_user = models.User(name=name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user