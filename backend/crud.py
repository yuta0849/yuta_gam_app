# データベース操作（Create、Read、Update、Delete）を行う関数を記述するためのファイル。
from backend.database import SessionLocal, SQLALCHEMY_DATABASE_URL
from backend.models import Adx_Data
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# app.pyで呼び出す
def get_data(option):
    if option == "overlay":
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
            Adx_Data
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
            Adx_Data
        WHERE
            ad_unit LIKE '%interstitial%'
        GROUP BY
            date
    """)
    result = session.execute(query)
    session.close()
    data = [{'date': row.date, 'avg_cpm': row.avg_cpm} for row in result]
    return data
