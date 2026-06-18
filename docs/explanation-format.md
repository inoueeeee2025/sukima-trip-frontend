# Codex 解説フォーマット

このメモは、Sukima Trip frontend の作業で Codex にタスク解説を依頼するときの回答形式を固定するためのものです。

ユーザーが `48. Dashboardに累計移動データを表示する` のように「数字. タイトル」を送った場合、Codex は勝手にコードを変更せず、まず以下の形式で説明する。

## 現在の進行ルール

- Sukima Trip frontend は、下のタスクリストを基準に進めている。
- ユーザーが「56お願いします」のように番号だけを送った場合、Codex は下のリストから該当タスク名を読み取って解説する。
- 1〜48は基本的に完了済みとして扱う。ただし、ユーザーが確認を求めた場合は現状コードを見て判断する。
- 49以降は、Figmaの画面構成・現在のコード・バックエンドAPIとのつながりを確認しながら進める。
- Street View周りは先に検証を進めているため、53〜61付近の順番や内容を特に重視する。
- リストにない作業が必要になった場合は、勝手に進めず「どの番号の前後に追加するのが自然か」を提案する。

## 現在のタスクリスト

```text
	①. APIの接続先を決めた
	②. API通信を共通化
	③. 認証apiの入口を作った
	④. バックエンドの返り値を確認
	⑤. 初期テンプレ画面をログイン替えに置き換えた
	⑥. ログインボタンでAPIを叩くようにした
	⑦. Access_tokenを保存するようにした
	⑧. ログイン状態をstateで持つようにした
	⑨. 起動時にtokenを読んでログイン状態を判定するようにした
	⑩. 認証済み・未認証で初期表示を分けた
	⑪. 仮ホームを作った
	⑫. ログアウト動線を作った
	⑬. 新規登録の準備を始めた
	⑭. 新規登録画面を完成させる
	⑮. 成功ログインを確認する
	⑯. 認証状態保持を実地確認する
	⑰. ログイン画面と新規登録画面を整理する
	⑱. 認証状態管理を共通化する
	⑲. 認証済みルート・未認証ルートを分ける
	⑳. 仮ホームを本物のホーム画面に置き換える
	21. プロフィール取得APIを繋ぐ
	22. プロフィール画面を作る
	23. movements 系APIを繋ぐ
	24. Home(map)画面に今日の移動データを表示する
	25. Figmaで全画面の必要素材を洗い出す
	26. 画像で書き出す素材とコードで再現するUIを分類する
	27. Home(map)用のFigma素材を書き出す
	28. Dashboard用のFigma素材を書き出す
	29. Walk mode用のFigma素材を書き出す
	30. Spots/Favorite用のFigma素材を書き出す
	31. 書き出した素材をfrontendのassetsに配置する
	32. 画像ファイルの命名ルールを決める
	33. React Nativeで画像素材を読み込めるか確認する
	34. Home(map)画面をFigmaの地図ベースUIに寄せる
	35. Home(map)にリアルタイム移動距離表示UIを配置する
	36. Home(map)にコイン表示UIを配置する
	37. Home(map)に探索モード導線を配置する
	38. Home(map)の別状態として、探索モード中の画面を作る
	39.  探索モード画面をFigmaに合わせて整える
	40. Explore modeで地図上の降り立つ場所を選択できるようにする
	41. 選択した降り立ち地点をstateで管理する
	42. 選択地点にピンや確認UIを表示する
	43.  探索モードからWalk modeへ進む導線を作る
	44. Home(map)にパスポート/Dashboard導線を配置する
	45. DashboardのパスポートUIをFigmaに合わせて整える
	46. DashboardPassportコンポーネントを作る
	47. パスポートUIを整える
	48. Dashboardに累計移動データを表示する
	49. プロフィール変更画面を作る
	50. プロフィール更新APIを繋ぐ
	51. profile（変更）画面をFigmaに合わせて整える
	52. 仮想旅行で必要な状態を整理する
	53. Street Viewの導入方法を決める
	54. Street Viewを表示する旅行画面の土台を作る
	55. Street view標準の移動矢印・操作UIが使えるか確認する
	56. 仮想現在地に応じて表示地点を更新できるようにする
	57. Explore mode の背景をGoogle Mapに置き換える
	58. Explore mode で地図上の地点を選択し、その地点からStreet Viewを開始できるようにする
	59.  Home(map)1 を訪問履歴確認用のGoogle Mapに置き換える
	60.  訪問済みスポットを地図上に表示できるようにする
	61. Street Viewが存在しない地点の代替表示を決める
	62. 現在地・ゴール・消費済み距離・残距離・移動ログの扱いを決める
	63. 実移動距離を仮想移動距離として使うルールを決める
	64. 距離の消費タイミングと更新方法を決める
	65. ゴール設定機能を作る
	66. 目的地の検索または候補選択UIを作る
	67. ゴール保存・変更機能を作る
	68. ゴールまでの残距離表示を作る
	69. ゴール到達時の表示を決める
	70. Walk mode画面を作る
	71. Walk mode画面をFigmaに合わせて整える
	72. 探索開始ボタンを作る
	73. 探索中に取得・更新する移動距離データを整理する
	74. 位置情報または移動ログから距離を更新する方法を決める
	75. 探索中のリアルタイム移動距離をstateで管理する
	76. Home(map) / Walk mode にリアルタイム移動距離を反映する
	77. 探索中の状態管理を作る
	78. 探索中ダイアログをFigmaに合わせて作る
	79. 探索終了確認ダイアログを作る
	80. Spots一覧/詳細APIを繋ぐ
	81. 探索中の現在地周辺スポットを表示できるようにする
	82. スポット発見画面を作る
	83. スポット発見画面をFigmaに合わせて整える
	84. Spots一覧画面を作る
	85. Spots一覧画面のUIをFigmaに合わせて作る
	86. Spots詳細画面を作る
	87. Spots詳細画面のUIをFigmaに合わせて作る
	88. スポット未発見時の空状態UIを作る
	89. Wikipedia APIの取得方法を決める
	90. スポットとWikipedia情報の紐付け方法を決める
	91. スポット詳細でWikipediaの説明文を表示する
	92. 必要ならWikipediaの画像や外部リンクも表示する
	93. Wikipedia情報が取れない場合の表示を作る
	94. お気に入り・like・visited系APIを繋ぐ
	95. Favorite画面を作る
	96. Favorite画面をFigmaに合わせて整える
	97. like・visited・お気に入りの見せ方をFigmaに合わせて整える
	98. 発見したスポットを記録できるようにする
	99. 一覧・詳細・探索画面で状態反映が揃うようにする
	100. 位置情報や移動データ利用の権限導線を整理する
	101. 権限未許可時の案内画面を作る
	102. エラーハンドリングを全体で整理する
	103. ローディング表示を全体で整理する
	104. ローディング中UIをFigmaに合わせて整える
	105. 外部API失敗時の再試行導線を作る
	106. 型定義を整理する
	107. APIモジュールを機能ごとに分ける
	108. デザインと共通UIを整える
	109. 共通UIコンポーネントをFigmaベースで作り直す
	110. 色・余白・文字サイズ・カードルールをFigma基準で変数化する
	111. タブバーや共通ヘッダーをFigmaに合わせて整える
	112. 画面遷移を本番寄りに整える
	113. 画面遷移と導線をFigmaのフローに合わせて調整する
	114. splash画面を作る
	115. splashから認証状態に応じて遷移する流れを整える
	116. ログイン → Home(map) → Dashboard → Home(map) の流れを確認する
	117. Home(map) → Walk mode → スポット発見 → 詳細閲覧 の流れを確認する
	118. 探索終了後の戻り先と再開導線を整える
	119. 動作確認と不具合修正をする
	120. 全画面をFigmaと見比べて差分修正する

```

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
