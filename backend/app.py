from flask import Flask

app = Flask(__name__)

# ルーティングもここで書く

@app.route('/')
def hello_world():
    return 'ここにGAMトレンドを表示したいかもね'

@app.route('/sample')
def sample():
    return 'ここはsampleページです'

if __name__ == '__main__':
    app.run(host='0.0.0.0')
