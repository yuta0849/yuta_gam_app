# Node.jsイメージをベースにする
FROM node:14

# 作業ディレクトリを設定
WORKDIR /app

# 依存関係ファイルをコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm install

# アプリケーションのコードをコピー
COPY . .

# アプリケーションを起動するためのコマンドを設定
CMD ["npm", "start"]