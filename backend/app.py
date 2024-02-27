import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Flask, jsonify
from backend import crud

app = Flask(__name__)

# ルーティングもここで書く

@app.route('/')
def hello_world():
    return 'ここにGAMトレンドを表示したいかもね'

@app.route('/sample')
def sample():
    return 'ここはsampleページです'

@app.route('/api/index')
def index():
    units_list = crud.get_units()
    return jsonify(units_list)

# html要素optionが組み込まれたパスにGETメソッド '/api/{selectedOption}'←こんな感じ
    # app.pyでは'/api/overlaydata','/api/interstitialdata'のルーティングを行う
    # SQL操作コマンドはcrud.pyにて行う
        # こちらにメソッド get_overlaydata, get_interstitaldata を定義
            # 上記メソッドをapp.pyのそれぞれのルーティングで呼び出し
    # App.tsxでhighchartsで描画できる形式でcrud.pyからデータを受け取るようにする

# app.tsxからのGETメソッドの投げ方の例
#       useEffect(() => {
#     fetch('/api/books')
#       .then(response => response.json())
#       .then(data => setBooks(data));
#   }, []);

if __name__ == '__main__':
    app.run(host='0.0.0.0')