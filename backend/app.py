from flask import Flask, jsonify, redirect, request, session, abort
from flask_cors import CORS
from flask_login import LoginManager
from requests_oauthlib import OAuth2Session
from werkzeug.utils import secure_filename

import pandas as pd
import sys
import os
import logging
import crud
import json
app = Flask(__name__)

# パスの設定
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# ログレベルの設定
logging.basicConfig(level=logging.DEBUG)
logging.info("FLASK_ENV value is: " + os.getenv('FLASK_ENV'))

# 開発/本番環境でOAUTHLIB_INSECURE_TRANSPORTの値を設定
if os.getenv('FLASK_ENV') == 'production':
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '0'
else:
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

# 開発/本番環境でcookie属性を分岐
if os.getenv('FLASK_ENV') == 'production':
    app.config.update(
        SESSION_COOKIE_SECURE=True,
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE='None'
    )
else:
    app.config.update(
        SESSION_COOKIE_SECURE=False,
        SESSION_COOKIE_HTTPONLY=False,
        SESSION_COOKIE_SAMESITE='Lax'
    )

# 開発/本番環境でCORSの設定を分岐
if os.environ.get('FLASK_ENV') == 'development':
    CORS(app, origins=['http://localhost:3000'], supports_credentials=True)
else:
    CORS(app, origins=['https://yuta-gam-app.vercel.app'], supports_credentials=True)


# GoogleOAuthに必要な情報を環境変数から読み込み
client_id = os.getenv('GOOGLE_CLIENT_ID')
client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
HOME_URL = os.getenv('HOME_URL')

app.secret_key = os.environ.get('SECRET_KEY')
login_manager = LoginManager(app)
redirect_uri = os.getenv('OAUTH_REDIRECT_URI')
oauth = OAuth2Session(client_id, redirect_uri=redirect_uri, scope='openid https://www.googleapis.com/auth/userinfo.email')

# ルーティング
@app.route('/')
def hello_world():
    return 'ここにGAMトレンドを表示したいかもね'

@app.route('/sample')
def sample():
    return 'ここはsampleページです'

# overlay / interstitial のデータを取得するエンドポイント
@app.route('/api/<option>', methods=['GET'])
def handle_option(option):
    data = crud.get_data(option)
    return jsonify(data)

# Google OAuth2.0を利用するエンドポイント
@app.route('/login')
def login():
    authorization_url, state = oauth.authorization_url(
        'https://accounts.google.com/o/oauth2/auth',
        access_type="offline",
        prompt="select_account")
    session['state'] = state  
    return redirect(authorization_url)

# ログアウト時のエンドポイント
@app.route('/logout')
def logout():
    session.pop('token', None)
    return {"loggedIn": False}

# Google OAuth2.0のリダイレクトURIとなるエンドポイント, tokenを作成してホーム画面にリダイレクト
@app.route('/token')
def token():
    code = request.args.get('code')
    if request.args.get('state') != session.get('state'):
        abort(403)
    try:
        token = oauth.fetch_token(
            'https://oauth2.googleapis.com/token',
            authorization_response=request.url,
            client_secret=client_secret, 
            code=code
        )
        # GoogleOAuthから取得したトークンを、flaskセッションに'token'として保存
        session['token'] = token  
        
        # 開発環境と本番環境でcookieの設定を変更
        secure_value = True if os.getenv('FLASK_ENV') == 'production' else False
        httponly_value = True if os.getenv('FLASK_ENV') == 'production' else False
        samesite_value = 'None' if os.getenv('FLASK_ENV') == 'production' else 'Lax'
        
        # レスポンスにクッキーの属性を設定(ここで改めて付与しないといけないぽい)
        response = app.make_response(redirect(HOME_URL))
        response.set_cookie('token', value=json.dumps(token), secure=secure_value, httponly=httponly_value, samesite=samesite_value) 
        
        return response
    except Exception as e:
        logging.exception("Error while setting the cookie:")
        return "トークンの取得に失敗しました: " + str(e)
    
# ログイン状態を保持するエンドポイント
@app.route('/loggedin')
def loggedin():
    # flask sessionにtokenが存在するかをcheck, ブラウザはリクエスト時にtokenを含んだcookieをサーバーサイドに送付、flask側でデコードして照合
    if 'token' in session:
        return {"loggedIn": True}
    else:
        return {"loggedIn": False}


# ファイルアップロード時の処理
UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = {'csv'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# ファイルの拡張子が許可されているかどうかを確認
def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

       # ファイルを読み込む
        df = pd.read_csv(filepath)

        # csvファイルの最終行を除去
        df = df.iloc[:-1]

        # csvファイルの最初の3つの列を 'date', 'name' および 'avg_cpm' として取得
        df = df.iloc[:, :3]
        df.columns = ['date', 'name', 'avg_cpm']
        
        # 日付を'YYYY/MM/DD'形式の文字列に変換
        df['date'] = pd.to_datetime(df['date'], format='%y/%m/%d').dt.strftime('%Y/%m/%d')

        # avg_cpmを文字列型にキャストし、その上でカンマを削除
        df['avg_cpm'] = df['avg_cpm'].astype(str).str.replace(',', '').astype(float)

        output_data = df[['date', 'name', 'avg_cpm']].to_dict('records')

        return jsonify(output_data), 200
    else:
        return {"Status": "File upload failed"}, 400

if __name__ == '__main__':
    app.run(host='0.0.0.0')