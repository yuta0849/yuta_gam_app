# データベース操作（Create、Read、Update、Delete）を行う関数を記述するためのファイル。
from .database import SessionLocal
from .models import AdxLast7daysData

# app.pyで呼び出す
def get_units():
    session = SessionLocal()
    result = session.query(AdxLast7daysData).all()
    session.close()

    units_list = []
    for row in result:
        units_list.append({'id': row.id, 'date': str(row.date), 'ad_unit': row.ad_unit}) 
    return units_list
