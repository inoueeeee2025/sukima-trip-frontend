# Backend Logic Reference

このドキュメントは、frontend実装で参照するバックエンド仕様の要点をまとめたものです。

バックエンド側の実装およびドキュメントを正本とし、内容に差異がある場合はバックエンド側を優先します。

- Source: `sukima-trip-backend`
- Last confirmed: 2026-06-24
- Status: 初版。必要な仕様は随時追記する

## 取り扱い上の注意

- APIキー、アクセストークン、秘密鍵、DB接続情報は記載しない。
- バックエンドの仕様変更時は、このファイルも更新する。
- 未確認の内容は推測で確定せず、`TODO`として残す。

## アーキテクチャ

### システム構成

```text
フロントエンド（React Native + Expo）
    │
    │ HTTP / JSON
    ▼
バックエンドAPI（Go + Gin）
    │                 │
    │                 ├── Google Places API（スポット検索・座標取得）
    │                 └── Wikipedia REST API（スポット情報取得）
    ▼
Supabase
    ├── PostgreSQL（ユーザー・移動距離・訪問地・コイン・いいね・お気に入り）
    ├── Auth（JWT発行・検証）
    └── Storage（プロフィール画像）
```

frontendはSupabaseへ直接アクセスせず、認証・プロフィール・移動距離・SpotなどのアプリデータはGoのAPIを経由する。

現在のfrontendでは、地図とStreet Viewの表示にGoogle Maps JavaScript APIをWebViewから直接利用している。バックエンドのGoogle Places API利用とは役割が異なる。

### インフラ

| 項目 | 内容 |
| --- | --- |
| ホスティング | Render（Dockerコンテナ） |
| デプロイトリガー | `develop`ブランチへのpushで自動デプロイ |
| コールドスリープ対策 | UptimeRobotが`/health`を5分ごとにping |
| 本番URL | `https://sukima-trip-backend.onrender.com` |

frontendの本番接続先は次のように設定する。

```env
EXPO_PUBLIC_API_ORIGIN=https://sukima-trip-backend.onrender.com
```

## 移動距離

### 距離変換

現実世界の移動距離を10倍し、Street View探索に使える仮想距離へ変換する。

```text
virtual_distance_km = real_distance_km * 10
remaining_distance_km = virtual_distance_km - used_virtual_distance_km
```

例：現実で1.5km移動すると仮想距離は15kmになる。仮想旅行で3km消費した場合、残りは12kmになる。

距離変換はバックエンド側で行う。frontendはAPIから返された`virtual_distance_km`と`used_virtual_distance_km`を利用し、`real_distance_km`から再計算しない。

### 保存・加算ルール

`POST /api/movements/today`は当日のレコードを対象にする。

- 当日のレコードがある場合、`real_distance_km`と`used_virtual_distance_km`を加算する。
- 当日のレコードがない場合、新しいレコードを作成する。
- 日付が変わった場合、前日のデータは変更せず、当日分を新規作成する。

### frontendでの扱い

```text
real_distance_km
現実世界で移動した距離

virtual_distance_km
仮想旅行に利用できる合計距離

used_virtual_distance_km
仮想旅行ですでに消費した距離

remaining_distance_km
仮想旅行でまだ利用できる距離
```

## スポット

### 周辺スポット取得

`GET /api/spots`はGoogle Places APIのNearby Searchを使用する。

| 項目 | 値 |
| --- | --- |
| type | `tourist_attraction` |
| radius | 5000m |
| language | `ja` |

各スポットについて、リクエスト地点からの距離をハバーサイン公式で計算し、`distance_km`として返す。

### 最近Spot表示UIの検討

#### 現在できること

`GET /api/spots?lat=&lng=`は、各Spotに`distance_km`を付けて返す。frontendで`distance_km`の昇順に並べれば、最も近いSpotを特定できる。

方向矢印を表示するには、現在のレスポンスに含まれていない`bearing`（方位角、0〜360度）が追加で必要になる。

#### UI案の比較

| 案 | 概要 | 発見しやすさ | 邪魔になりにくさ | frontend実装コスト |
| --- | --- | --- | --- | --- |
| A | フッターに最近Spot名・距離・矢印を常時表示 | 高 | 低〜中 | 低〜中 |
| B | 地図上に看板・カードを重ねて表示 | 中〜高 | 低〜中 | 高 |
| C | Spotをタップした時だけ矢印を表示 | 低 | 高 | 中 |

現時点の推奨案は、歩行中でも確認しやすく実装コストも比較的低い**案A（フッター常時表示）**。

ただし、これは確定仕様ではなくUI検討案として扱う。実際の採用はFigmaとWalk mode全体のレイアウトを確認して決定する。

#### 段階的な実装案

| フェーズ | 内容 |
| --- | --- |
| Phase 1 | 最近Spotを特定できるAPIまたはfrontend処理を用意する |
| Phase 2 | フッターにSpot名と距離を表示する |
| Phase 3 | 端末の向きと連動する方向矢印を追加する |

Phase 2まで実装して使い勝手を確認してから、方位センサーを使うPhase 3へ進む方法も候補とする。

#### バックエンド実装済み

```text
GET /api/spots/nearest?lat=35.0&lng=135.0
Authorization: Bearer {access_token}
```

レスポンス：

```json
{
  "place_id": "ChIJxxx",
  "name": "金閣寺",
  "distance_km": 0.8,
  "bearing": 42.3
}
```

`bearing`は北を0度、東を90度とする0〜360度の値。frontendではStreet Viewの`pov_changed`で取得したカメラヘディングを引いて相対角度に変換し、矢印を回転させる。

```text
relativeAngle = (bearing - streetViewHeading + 360) % 360
```

### 到着判定

Spot到着までの処理フローは次のとおり。

1. frontendが`GET /api/spots/nearest`で最近スポットを取得し、200m以内に入ったら`POST /api/spots/:id/arrive`を送信する。
2. バックエンドが訪問地保存、コイン付与、Wikipedia情報取得を行う。
3. コイン残高、Wikipedia概要、画像URLをレスポンスとして返す。
4. 同一スポットへの重複到着の場合は`400 Bad Request`（`"このスポットにはすでに到着済みです"`）を返す。

距離バリデーションはバックエンド PR #85 で撤廃済み。リクエストボディは`{ place_name }`のみ。

### コイン付与

- 付与条件：スポットの到着判定に成功した時
- 付与枚数：10枚
- 更新場所：バックエンドの`coins`テーブル

## Wikipedia

スポット到着成功時にWikipedia REST APIから概要と画像を取得する。

```text
GET https://ja.wikipedia.org/api/rest_v1/page/summary/{スポット名}
```

| レスポンス | Wikipediaの取得元 |
| --- | --- |
| `wiki_summary` | `extract` |
| `photo_url` | `thumbnail.source` |

記事が存在しない場合や取得に失敗した場合は空文字を返し、スポット到着処理自体はエラーにしない。

既知の制限として、スポット名とWikipediaの記事名が一致しない場合は情報を取得できないことがある。

## 認証

### JWT検証

1. frontendが`POST /auth/register`または`POST /auth/login`を送信する。
2. Supabase AuthがJWTアクセストークンを発行する。
3. frontendがレスポンスの`access_token`を端末へ保存する。
4. 以降のリクエストに`Authorization: Bearer <token>`を付ける。
5. `AuthMiddleware`がトークンを取り出す。
6. Supabase Auth APIでトークンを検証する。
7. 成功した場合は`user_id`をcontextへ保存して処理を続ける。
8. 失敗した場合は`401 Unauthorized`を返す。

### トークン失効

- アクセストークンはSupabaseのデフォルト設定で1時間後に失効する。
- 認証が必要なAPIは、失効したトークンに対して`401`を返す。
- frontendは`401`を受け取ったら保存済みトークンを削除し、ログイン画面へ戻す。
- 自動リフレッシュは未実装。

## お気に入り・いいね

### お気に入り

| 操作 | バックエンド処理 |
| --- | --- |
| 追加 | `place_id`と`place_name`を`favorites`へ保存 |
| 一覧 | `user_id`で絞り、`created_at`の降順で返す |
| 削除 | `favorites`のレコードIDで削除 |

### いいね

| 操作 | バックエンド処理 |
| --- | --- |
| 追加 | `user_id`と`place_id`を`spot_likes`へ保存 |
| 削除 | `user_id`と`place_id`で削除 |

お気に入りはレコードID、いいねは`place_id`を使って削除する点に注意する。

## データベース

Supabase PostgreSQLを使用する。frontendはデータベースへ直接アクセスせず、GoのAPIを経由する。

### テーブル一覧

| テーブル名 | 説明 |
| --- | --- |
| `users` | ユーザープロフィール情報 |
| `movements` | 日付ごとの移動距離 |
| `visited_places` | 訪問済みSpot |
| `coins` | ユーザーごとのコイン残高 |
| `spot_likes` | Spotへのいいね情報 |
| `favorites` | お気に入りSpot情報 |

### users

Supabase Authがメールアドレスやパスワードなどの認証情報を管理し、`users`はプロフィール情報を保持する。

| カラム | 型 | NULL | 説明 |
| --- | --- | --- | --- |
| `id` | uuid | NO | Supabase Authの`user_id`と紐づく主キー |
| `name` | text | NO | 名前 |
| `avatar_url` | text | YES | Supabase Storageのプロフィール画像URL |
| `gender` | text | YES | `male` / `female` / `other` |
| `created_at` | timestamp | NO | 作成日時 |

### movements

日付ごとの現実の移動距離と、Street Viewで消費した仮想距離を保存する。累計移動距離はこのテーブルを集計して算出する。

| カラム | 型 | NULL | 説明 |
| --- | --- | --- | --- |
| `id` | uuid | NO | 主キー |
| `user_id` | uuid | NO | `users`への外部キー |
| `date` | date | NO | 計測日 |
| `real_distance_km` | float | NO | 当日の現実の移動距離（km） |
| `used_virtual_distance_km` | float | NO | Street Viewで消費した仮想距離（km） |
| `created_at` | timestamp | NO | 作成日時 |

`virtual_distance_km`と`remaining_distance_km`は保存カラムではなく、次の式で求める。

```text
virtual_distance_km = real_distance_km * 10
remaining_distance_km = virtual_distance_km - used_virtual_distance_km
```

### visited_places

Spot到着時に記録し、World Mapの訪問済み表示に利用する。

| カラム | 型 | NULL | 説明 |
| --- | --- | --- | --- |
| `id` | uuid | NO | 主キー |
| `user_id` | uuid | NO | `users`への外部キー |
| `place_id` | text | NO | Google Places APIの`place_id` |
| `place_name` | text | NO | Spot名 |
| `visited_at` | timestamp | NO | 到着日時 |

このテーブルには緯度・経度が保存されていない。World Mapへ旗や訪問地点を表示する際に、APIが座標を付けて返すのか、`place_id`から再取得するのかは確認が必要。

### coins

ユーザーごとの現在のコイン残高を保持する。

| カラム | 型 | NULL | 説明 |
| --- | --- | --- | --- |
| `id` | uuid | NO | 主キー |
| `user_id` | uuid | NO | `users`への外部キー |
| `balance` | integer | NO | コイン残高（初期値0） |
| `updated_at` | timestamp | NO | 最終更新日時 |

### spot_likes

| カラム | 型 | NULL | 説明 |
| --- | --- | --- | --- |
| `id` | uuid | NO | 主キー |
| `user_id` | uuid | NO | `users`への外部キー |
| `place_id` | text | NO | Google Places APIの`place_id` |
| `created_at` | timestamp | NO | いいねした日時 |

### favorites

| カラム | 型 | NULL | 説明 |
| --- | --- | --- | --- |
| `id` | uuid | NO | 主キー |
| `user_id` | uuid | NO | `users`への外部キー |
| `place_id` | text | NO | Google Places APIの`place_id` |
| `place_name` | text | NO | Spot名 |
| `created_at` | timestamp | NO | お気に入りへ追加した日時 |

### テーブルの関連

```text
users
  ├── movements        (user_id)
  ├── visited_places   (user_id)
  ├── coins            (user_id)
  ├── spot_likes       (user_id)
  └── favorites        (user_id)
```

### RLS

全テーブルに、ユーザー本人のデータだけを操作できるRow Level Securityポリシーを設定する。

| 操作 | ポリシー |
| --- | --- |
| SELECT | 自分の`user_id`のデータだけ取得可能 |
| INSERT | 自分の`user_id`でだけ追加可能 |
| UPDATE | 自分の`user_id`のデータだけ更新可能 |
| DELETE | 自分の`user_id`のデータだけ削除可能 |

## バックエンドのディレクトリ構成

```text
sukima-trip-backend/
├── cmd/
│   └── main.go              # エントリポイント・ルーティング設定
├── config/
│   └── config.go            # 環境変数の読み込み
├── internal/
│   ├── handler/             # リクエストのパース・レスポンス返却
│   │   ├── auth.go
│   │   ├── profile.go
│   │   ├── movement.go
│   │   ├── coin.go
│   │   ├── visited_place.go
│   │   ├── spot.go
│   │   ├── like.go
│   │   └── favorite.go
│   ├── middleware/
│   │   └── auth.go          # JWT検証ミドルウェア
│   ├── model/               # データ構造の定義
│   │   ├── user.go
│   │   ├── movement.go
│   │   ├── spot.go
│   │   ├── visited_place.go
│   │   ├── like.go
│   │   └── favorite.go
│   └── repository/          # DB・外部APIとのやり取り
│       ├── auth.go
│       ├── profile.go
│       ├── movement.go
│       ├── coin.go
│       ├── visited_place.go
│       ├── spot.go          # Google Places API・Wikipedia API
│       ├── like.go
│       └── favorite.go
├── docs/
├── Dockerfile
├── docker-compose.yml
├── render.yaml
├── .env.example
└── .gitignore
```

## TODO

- `POST /api/movements/today`の正確なリクエスト・レスポンス型を追記する。
- Spot一覧・詳細・到着APIの正確なレスポンス型を追記する。
- `visited_places`をWorld Mapへ表示する時の座標取得方法を確認する。
- Wikipedia取得が`POST /api/spots/:id/arrive`のレスポンスに含まれることを最終確認する。
- バックエンドの参照コミットIDを記録する。
