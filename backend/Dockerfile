# Pythonイメージをベースにする
FROM python:3.11

# 作業ディレクトリを設定
WORKDIR /app/backend

# アプリケーションのコードをコピー
COPY . .

# 依存関係をインストール
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションを起動するためのコマンドを設定（app.pyはFlaskアプリケーションのエントリーポイント）
CMD ["python", "/app/backend/app.py"]

# 環境変数の設定（データベース名、ユーザ名、パスワード等）
ENV MYSQL_DATABASE=mydatabase
ENV MYSQL_USER=myuser
ENV MYSQL_PASSWORD=mypassword
ENV MYSQL_ROOT_PASSWORD=rootpassword