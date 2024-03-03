import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Flask, jsonify, redirect, request
from backend import crud
from flask_cors import CORS
from flask_login import LoginManager
from requests_oauthlib import OAuth2Session

app = Flask(__name__)
login_manager = LoginManager(app)
oauth = OAuth2Session('GOOGLE_CLIENT_ID', redirect_uri='http://localhost:5000/authentication', scope='https://www.googleapis.com/auth/userinfo.email', client_secret='GOOGLE_CLIENT_SECRET')
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

@app.route('/authentication')
def authenticate():
    code = request.args.get('code')
    token = oauth.fetch_token('https://oauth2.googleapis.com/token', authorization_response=request.url, client_secret='GOOGLE_CLIENT_SECRET', code=code)
    # ここから先はアクセストークンを使った処理を書くことができます。
    return redirect('http://localhost:5000/')

if __name__ == '__main__':
    app.run(host='0.0.0.0')