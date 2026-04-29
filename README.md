# Sukima Trip Frontend

春プロ「Sukima Trip」のフロントエンドリポジトリです。
日常の移動をきっかけに、世界を探索する体験を提供するモバイルアプリのフロントエンドを管理します。

## 概要

Sukima Trip は、ユーザーの日常の移動を蓄積し、その移動量を使って世界のスポットを探索できるアプリです。
このリポジトリでは、Expo + React Native を用いてモバイルアプリの画面・UI・フロントエンドロジックを開発します。

## 使用技術

- Expo
- React Native
- TypeScript
- Expo Router

## 開発環境

- Node.js
- npm
- Xcode Simulator（iOS 確認用）
- VSCode

## セットアップ

### 1. リポジトリをクローン

```bash
git clone https://github.com/inoueeeee2025/sukima-trip-frontend.git
cd sukima-trip-frontend
```

### 2. パッケージをインストール

```bash
npm install
```

### 3. アプリを起動

iOS シミュレータで起動:

```bash
npm run ios
```

Expo 開発サーバーを起動:

```bash
npx expo start
```

## ディレクトリ構成

```text
app/          画面・ルーティング
assets/       画像やフォントなどの静的ファイル
components/   共通UIコンポーネント
constants/    色・固定値・設定
hooks/        共通ロジック
scripts/      補助スクリプト
```

## 開発方針

- まずは画面構成と UI を固める
- フロントエンドとバックエンドは別リポジトリで管理する
- バックエンドとは API 通信で接続する
- 機能ごとにブランチを切って開発する

## ブランチ運用

- `main` : 本番用 / 最終リリース用ブランチ
- `develop` : 開発内容を統合するブランチ
- `feature/xxx` : 各機能ごとの作業ブランチ

## 開発の流れ

1. `develop` ブランチから `feature/xxx` ブランチを切る
2. 機能開発を行う
3. `develop` にマージする
4. 最終リリース時に `main` にマージする

## 今後の予定

- ホーム画面の作成
- 探索画面の作成
- スポット詳細画面の作成
- ログ / コレクション画面の作成
- バックエンド API との接続
