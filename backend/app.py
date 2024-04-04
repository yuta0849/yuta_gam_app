from flask import Flask, jsonify, redirect, request, session, abort
from requests import get
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

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

logging.basicConfig(level=logging.DEBUG)
logging.info("FLASK_ENV value is: " + os.getenv('FLASK_ENV'))

# 開発環境ではHTTPでもOAuthを利用できるようにする
if os.getenv('FLASK_ENV') == 'production':
    os.getenv['OAUTHLIB_INSECURE_TRANSPORT'] = '0'
else:
    os.getenv['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

# 本番環境でcookieをブラウザに焼けるようにする
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

if os.environ.get('FLASK_ENV') == 'development':
    CORS(app, origins=['http://localhost:3000'], supports_credentials=True)
else:
    CORS(app, origins=['https://yuta-gam-app.vercel.app'], supports_credentials=True)


client_id = os.getenv('GOOGLE_CLIENT_ID')
client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
HOME_URL = os.getenv('HOME_URL')
redirect_uri = os.getenv('OAUTH_REDIRECT_URI')
app.secret_key = os.getenv('SECRET_KEY')

login_manager = LoginManager(app)
oauth = OAuth2Session(client_id, redirect_uri=redirect_uri, scope='openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email')


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
    session['state'] = state  
    return redirect(authorization_url)

@app.route('/logout')
def logout():
    session.pop('token', None)
    return {"loggedIn": False}

# Google OAuth2.0のリダイレクトURIとなるエンドポイント
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
        
        session['token'] = token
        
        USER_INFO = "https://www.googleapis.com/oauth2/v3/userinfo"
        response = get(USER_INFO, headers={"Authorization": "Bearer " + token["access_token"]})
        user_info = response.json()
        session["username"] = user_info["name"]
        session["userid"] = user_info["sub"]
        
        user = crud.get_user_by_google_id(session["userid"])
        
        if user is None:
            user = crud.create_user(session["userid"], user_info["name"], user_info["email"])
        
        # リダイレクト先であるため、レスポンスに明示的にクッキーの属性を設定
        secure_value = True if os.getenv('FLASK_ENV') == 'production' else False
        httponly_value = True if os.getenv('FLASK_ENV') == 'production' else False
        samesite_value = 'None' if os.getenv('FLASK_ENV') == 'production' else 'Lax'
        
        response = app.make_response(redirect(HOME_URL))
        response.set_cookie('token', value=json.dumps(token), secure=secure_value, httponly=httponly_value, samesite=samesite_value) 
        
        return response
    except Exception as e:
        logging.exception("Error while setting the cookie:")
        return "トークンの取得に失敗しました: " + str(e)
    
# 画面初回レンダリング時にログインの有無を確認する
@app.route('/loggedin')
def loggedin():
    # flask sessionにtokenが存在するかをcheck, ブラウザはリクエスト時にtokenを含んだcookieをサーバーサイドに送付、flask側でデコードして照合
    if 'token' in session:
        return {"loggedIn": True}
    else:
        return {"loggedIn": False}
    
@app.route("/user", methods=["GET"])
def get_user_info():
    return {"username": session.get('username', '')}


UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = {'csv'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

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

        df = pd.read_csv(filepath)
        df = df.iloc[:-1]
        df = df.iloc[:, :3]
        df.columns = ['date', 'name', 'avg_cpm']
        df['date'] = pd.to_datetime(df['date'], format='%y/%m/%d').dt.strftime('%Y/%m/%d')
        df['avg_cpm'] = df['avg_cpm'].astype(str).str.replace(',', '').astype(float)
        output_data = df[['date', 'name', 'avg_cpm']].to_dict('records')

        return jsonify(output_data), 200
    else:
        return {"Status": "File upload failed"}, 400
    
@app.route('/saveuploaddata', methods=['POST'])
def save_uploaded_file():
    uploadObject = request.get_json()
    result = crud.save_uploaded_data(session['userid'], uploadObject)
    
    if "error" in result:
        return {'error': result["error"]}, 400
    else:
        return {'status': 'success'}, 200
    
@app.route('/get-saved-data', methods=['GET'])
def get_saved_data_route():
    user_id = session.get('userid')
    data = crud.get_saved_data(user_id)
    return jsonify(data)

@app.route('/get-data-details', methods=['GET'])
def get_data_details():
    save_data_name = request.args.get('name')
    user_id = session.get('userid')
    data = crud.get_data_details(user_id, save_data_name)
    return jsonify(data)

@app.route('/delete-saved-data', methods=['GET'])
def delete_data():
    delete_data_name = request.args.get('name')
    message, status_code = crud.delete_data(delete_data_name)
    return message, status_code
    

if __name__ == '__main__':
    app.run(host='0.0.0.0')