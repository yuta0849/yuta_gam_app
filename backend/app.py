from dotenv import load_dotenv
load_dotenv()

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
# 安全でない輸送エラーを無視する機能
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
client_id = os.getenv('GOOGLE_CLIENT_ID')
client_secret = os.getenv('GOOGLE_CLIENT_SECRET')

from flask import Flask, jsonify, redirect, request, session
from backend import crud
from flask_cors import CORS
from flask_login import LoginManager
from requests_oauthlib import OAuth2Session

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY')
login_manager = LoginManager(app)
oauth = OAuth2Session(client_id, redirect_uri='http://localhost:5000/token', scope='openid https://www.googleapis.com/auth/userinfo.email')
CORS(app, supports_credentials=True)

# ルーティングもここで書く
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
    return redirect(authorization_url)

# ログアウト時のエンドポイント
@app.route('/logout')
def logout():
    session.pop('token', None)
    return {"loggedIn": False}

# Google OAuth2.0のリダイレクトURI, tokenを作成してホーム画面にリダイレクト
@app.route('/token')
def token():
    code = request.args.get('code')
    try:
        token = oauth.fetch_token(
            'https://oauth2.googleapis.com/token',
            authorization_response=request.url,
            client_secret=client_secret, 
            code=code
        )
        # トークンをセッションに保存
        session['token'] = token  
        return redirect("http://localhost:3000")
    except Exception as e:
        return "トークンの取得に失敗しました: " + str(e)

# ログイン状態を保持するエンドポイント
@app.route('/loggedin')
def loggedin():
    # セッションからトークンを取得し、ログイン状態をチェック
    if 'token' in session:
        return {"loggedIn": True}
    else:
        return {"loggedIn": False}


if __name__ == '__main__':
    app.run(host='0.0.0.0')