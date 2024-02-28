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

@app.route('/api/<option>', methods=['GET'])
def handle_option(option):
    data = crud.get_data(option)
    return jsonify(data)


if __name__ == '__main__':
    app.run(host='0.0.0.0')