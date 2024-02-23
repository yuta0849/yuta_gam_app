import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Flask, jsonify
from database import crud

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
    # databaseディレクトリ内のファイルにて、SQLよりデータ抽出するコマンドを記載(SQL Archemy)
        # 上記コマンドをapp.pyで呼び出す
    # backendディレクトリ内のファイルにて、HighChartsにて描画するためのデータ整形をする
        # 上記コマンドをapp.pyで呼び出す

if __name__ == '__main__':
    app.run(host='0.0.0.0')