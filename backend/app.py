from dotenv import load_dotenv
load_dotenv()

import pandas as pd
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
from werkzeug.utils import secure_filename

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


# ファイルアップロード時の処理
UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = {'csv'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# ファイルの拡張子が許可されているかどうかを確認します。
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

        # 最終行を除去
        df = df.iloc[:-1]

        # ファイルの最初の3つの列を 'date', 'name' および 'avg_cpm' として取得
        df = df.iloc[:, :3]
        df.columns = ['date', 'name', 'avg_cpm']

        # avg_cpmのカンマを取り除く
        df['avg_cpm'] = df['avg_cpm'].str.replace(',', '').astype(float)

        output_data = df[['date', 'name', 'avg_cpm']].to_dict('records')

        return jsonify(output_data), 200
    else:
        return {"Status": "File upload failed"}, 400




if __name__ == '__main__':
    app.run(host='0.0.0.0')