from database import SessionLocal, SQLALCHEMY_DATABASE_URL
from models import User, UploadedDataset, UploadedData
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
import datetime

def create_user(google_user_id, name, email):
    # セッションの生成
    db = SessionLocal()

    user = User(google_user_id=google_user_id, name=name, email=email)

    # ユーザを追加
    db.add(user)
    db.commit()

    # セッションをクローズ
    db.close()

    return user

def get_user_by_google_id(google_user_id):
    # セッションの生成
    with SessionLocal() as db:
        # Userモデルから指定されたgoogle_user_idを持つユーザーを探します
        user = db.query(User).filter(User.google_user_id == google_user_id).first()   
    return user

# app.pyで呼び出す
def get_data(option):
    if option == "overlay":
        data = query_overlay_data()
    elif option == "interstitial":
        data = query_interstitial_data()
    return data


def query_overlay_data():
    # セッションの生成 
    db = SessionLocal()

    query = text(""" 
    SELECT date, (SUM(adx_revenue) / SUM(adx_impressions)) * 1000 as avg_cpm 
    FROM Adx_Data 
    WHERE ad_unit LIKE '%overlay%' 
    GROUP BY date 
    """)

    result = db.execute(query)

    # セッションをクローズ
    db.close()

    data = [{'date': row.date, 'avg_cpm': row.avg_cpm} for row in result]
    return data


def query_interstitial_data():
    # セッションの生成 
    db = SessionLocal()

    query = text(""" 
    SELECT date, (SUM(adx_revenue) / SUM(adx_impressions)) * 1000 as avg_cpm 
    FROM Adx_Data 
    WHERE ad_unit LIKE '%interstitial%' 
    GROUP BY date 
    """)

    result = db.execute(query)

    # セッションをクローズ
    db.close()

    data = [{'date': row.date, 'avg_cpm': row.avg_cpm} for row in result]
    return data

def save_uploaded_data(user_id, uploadObject):
    save_data_name = uploadObject["dataName"]
    data = uploadObject["data"]
    
    upload_timestamp = datetime.datetime.utcnow()
    
    
    with SessionLocal() as db:
        try:
            # 第1段階：マスタテーブル(uploaded_datasets)に userid, timestamp, save_data_nameを保存
            dataset = UploadedDataset(
            user_id=user_id,
            upload_timestamp=upload_timestamp,
            save_data_name=save_data_name,
            )
            db.add(dataset)
            # `dataset_id`を生成するためにフラッシュ
            db.flush()

            # 第2段階：問題なくuploaded_datasetsテーブルに保存ができた場合、uploaded_dataにて実際のデータの保存を行う        
            for record in data:
                new_data = UploadedData(
                    dataset_id=dataset.dataset_id,
                    date=record['date'],
                    ad_unit=record['name'],
                    avg_adx_cpm=record['avg_cpm'],
                )
                db.add(new_data)
            
            # 第1段階と第2段階をまとめてコミット、どちらの保存処理も成功した時のみtableは更新される
            db.commit()
        except Exception as e:
            db.rollback()
            return {"error": str(e)}
        
    return {"status": "success"}
        