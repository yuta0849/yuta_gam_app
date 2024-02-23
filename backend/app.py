from flask import Flask

app = Flask(__name__)

# ルーティングもここで書く

@app.route('/')
def hello_world():
    return 'ここにGAMトレンドを表示したいかもね'

@app.route('/sample')
def sample():
    return 'ここはsampleページです'

@app.route('/api/index')
def sample():
    return 'ここにid,日付,ユニット名を表示したい'

# html要素optionが組み込まれたパスにGETメソッド '/api/{selectedOption}'←こんな感じ
    # databaseディレクトリ内のファイルにて、SQLよりデータ抽出するコマンドを記載(SQL Archemy)
        # 上記コマンドをapp.pyで呼び出す
    # backendディレクトリ内のファイルにて、HighChartsにて描画するためのデータ整形をする
        # 上記コマンドをapp.pyで呼び出す

if __name__ == '__main__':
    app.run(host='0.0.0.0')