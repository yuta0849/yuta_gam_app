from dotenv import load_dotenv
load_dotenv()

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
# 安全でない輸送エラーを無視する機能
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
client_id = os.getenv('GOOGLE_CLIENT_ID')
client_secret = os.getenv('GOOGLE_CLIENT_SECRET')

from flask import Flask, jsonify, redirect, request
from backend import crud
from flask_cors import CORS
from flask_login import LoginManager
from requests_oauthlib import OAuth2Session

app = Flask(__name__)
login_manager = LoginManager(app)
oauth = OAuth2Session(client_id, redirect_uri='http://localhost:5000/authentication', scope='openid https://www.googleapis.com/auth/userinfo.email')
CORS(app)

# ルーティングもここで書く

@app.route('/')
def hello_world():
    return 'ここにGAMトレンドを表示したいかもね'

@app.route('/sample')
def sample():
    return 'ここはsampleページです'

@app.route('/api/<option>', methods=['GET'])
def handle_option(option):
    data = crud.get_data(option)
    return jsonify(data)

@app.route('/login')
def login():
    authorization_url, state = oauth.authorization_url(
        'https://accounts.google.com/o/oauth2/auth',
        access_type="offline",
        prompt="select_account")
    return redirect(authorization_url)

@app.route('/authentication')
def authenticate():
    code = request.args.get('code')
    token = oauth.fetch_token('https://oauth2.googleapis.com/token', authorization_response=request.url, client_secret=client_secret, code=code)
    # ここから先はアクセストークンを使った処理を書くことができます。
    return redirect('http://localhost:3000/')

if __name__ == '__main__':
    app.run(host='0.0.0.0')