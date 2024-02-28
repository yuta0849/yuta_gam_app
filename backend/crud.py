# データベース操作（Create、Read、Update、Delete）を行う関数を記述するためのファイル。
from .database import SessionLocal, SQLALCHEMY_DATABASE_URL
from .models import AdxLast7daysData
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# app.pyで呼び出す
def get_data(option):
    if option == "index":
        session = SessionLocal()
        result = session.query(AdxLast7daysData).all()
        session.close()

        data = []
        for row in result:
            data.append({'id': row.id, 'date': str(row.date), 
                         'ad_unit': row.ad_unit, 'adx_revenue': row.adx_revenue}) 
    elif option == "overlay":
        # overlayデータを取得するためのクエリを実行
         data = query_overlay_data()
    elif option == "interstitial":
        # interstitialデータを取得するためのクエリを実行
        data = query_interstitial_data()
    return data


def query_overlay_data():
    # overlayデータを取得するためのSQLクエリ
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    query = text("""
        SELECT
            date,
            (SUM(adx_revenue) / SUM(adx_impressions)) * 1000 as avg_cpm
        FROM
            Adx_Last_7days_Data
        WHERE
            ad_unit LIKE '%overlay%'
        GROUP BY
            date
    """)
    result = session.execute(query)
    session.close()
    data = [{'date': row.date, 'avg_cpm': row.avg_cpm} for row in result]
    return data

def query_interstitial_data():
    # interstitialデータを取得するためのSQLクエリ
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    query = text("""
        SELECT
            date,
            (SUM(adx_revenue) / SUM(adx_impressions)) * 1000 as avg_cpm
        FROM
            Adx_Last_7days_Data
        WHERE
            ad_unit LIKE '%interstitial%'
        GROUP BY
            date
    """)
    result = session.execute(query)
    session.close()
    data = [{'date': row.date, 'avg_cpm': row.avg_cpm} for row in result]
    return data
