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