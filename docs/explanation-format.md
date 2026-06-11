# Codex 解説フォーマット

このメモは、Sukima Trip frontend の作業で Codex にタスク解説を依頼するときの回答形式を固定するためのものです。

ユーザーが `48. Dashboardに累計移動データを表示する` のように「数字. タイトル」を送った場合、Codex は勝手にコードを変更せず、まず以下の形式で説明する。

## 基本方針

- まず「この項目でやること」を一言でまとめる。
- 説明の中心は「手順」にする。
- 手順は数字で分ける。
- 各手順には、必ず「変更前コード」と「変更後コード」を入れる。
- 変更前コードと変更後コードの間に長い説明を挟まない。
- コードは省略しすぎず、コピペしやすい単位で出す。
- 実装の意味、責務、state、props、APIの入口などは、各手順のあとに短く説明する。
- ユーザーが明示的に「反映して」「実装して」と言うまでは、勝手にファイルを変更しない。

## 回答テンプレート

```text
番号. タイトル

この項目でやること：
一言で何をする項目かを書く。

手順

1. 何をする

変更前コード

```tsx
変更前のコード
```

変更後コード

```tsx
変更後のコード
```

意味：
この変更が何を意味しているのかを短く説明する。

2. 何をする

変更前コード

```tsx
変更前のコード
```

変更後コード

```tsx
変更後のコード
```

意味：
この変更が何を意味しているのかを短く説明する。

完了条件

```text
実装後に何ができていればOKか
```

この項目のポイント：
一番大事な学びや責務を短くまとめる。
```

## 例

```text
48. Dashboardに累計移動データを表示する

この項目でやること：
Dashboard内の仮の「通算移動記録」を、/movements/total API から取得した累計移動距離に置き換える。

手順

1. TotalMovementResponse を import する

変更前コード

```tsx
import {
  getTodayMovements,
  getTotalMovements,
  TodayMovementResponse,
} from "@/api/movements";
```

変更後コード

```tsx
import {
  getTodayMovements,
  getTotalMovements,
  TodayMovementResponse,
  TotalMovementResponse,
} from "@/api/movements";
```

意味：
totalMovement state の型として、累計移動データの型を使えるようにする。

2. 累計移動データ用の state を追加する

変更前コード

```tsx
const [todayMovement, setTodayMovement] =
  useState<TodayMovementResponse | null>(null);
const [isMovementLoading, setIsMovementLoading] = useState(true);
```

変更後コード

```tsx
const [todayMovement, setTodayMovement] =
  useState<TodayMovementResponse | null>(null);
const [totalMovement, setTotalMovement] =
  useState<TotalMovementResponse | null>(null);
const [isMovementLoading, setIsMovementLoading] = useState(true);
```

意味：
todayMovement は今日の移動データ、totalMovement は累計移動データを保存する state。

完了条件

```text
Dashboardを開く
通算移動記録に /movements/total の total_real_distance_km が表示される
データがない時は - km と表示される
```

この項目のポイント：
APIで取得したデータを index.tsx で state に保存し、それを DashboardPassport に props で渡す。
```

## 注意

- 「解説して」と言われた場合は、実装しない。
- 「お願いします」だけの場合も、学習用タスクではまず手順と変更前/変更後コードを出す。
- 「あなたが反映して」「実装して」と明示された場合だけ、コード変更に進む。
- 実装後の報告では、変更内容と検証結果を短くまとめる。
