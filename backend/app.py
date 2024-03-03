import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Flask, jsonify, redirect, request
from backend import crud
from flask_cors import CORS

app = Flask(__name__)
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
    code = request.args.get('code')  # Googleからの応答から認証コードを取得
    # ここにアクセストークンの取得と利用に関する処理を書く
    return redirect('http://localhost:3000/')

if __name__ == '__main__':
    app.run(host='0.0.0.0')