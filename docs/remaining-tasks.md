# フロントエンド 残タスクリスト（優先度順）

`develop` ブランチ・全リモートブランチ・コードベースを照合して整理（2026-06-23）。

タスク解説の回答形式は [`explanation-format.md`](./explanation-format.md) を参照。本ファイルは残タスクの優先度と進捗管理用。

## 検証サマリー

- 提示リストは **80〜90% 正確**。優先度の大枠（P0 → Walk mode → Spots → Favorite → 権限/品質 → QA）は妥当。
- **他ブランチに未マージの WIP はない**（`develop` = `88dddfb` が最新の集約点）。
- `feature/spot-list` はローカルのみ・`develop` より古い。未マージの spots 実装なし。
- spots 等の新規作業は **`develop` からブランチを切る** 前提で正しい。

### 完了済み（1〜62）

[`explanation-format.md`](./explanation-format.md) のタスクリスト 1〜62 を参照。

### 既に進んでいるがリストに明示されていないもの

[`app/(tabs)/index.tsx`](../app/(tabs)/index.tsx) に Walk mode の土台あり:

- `isWalkMode` / `isExploreMode` 切替
- `virtualTrip` state（`startPoint`, `currentPoint`, `goalPoint`, 距離フィールド）
- 探索モード → 降り立ち確認 → Street View チェック → Walk mode 遷移
- [`StreetViewPanel`](../components/street-view/street-view-panel.tsx) / [`ExploreMapPanel`](../components/explore-map/explore-map-panel.tsx)
- 訪問ルート表示（[`VisitedMapPanel`](../components/visited-map/visited-map-panel.tsx)）— **`TEST_VISITED_ROUTE` ハードコード**

---

## P0 ── 前提条件（これがないと他が進まない）

| タスク | 理由 | 状態 |
| --- | --- | --- |
| 各開発者の `.env` に本番バックエンド URL を設定（issue #17） | 未設定だと `http://127.0.0.1:8080` にフォールバック | `.env.example` + README は PR #18 で整備済み。個人の `.env` 設定は各メンバー対応 |
| `expo-location` のインストールと設定 | タスク 72・97・98 の前提 | 未着手 |
| `api/spots.ts` の作成 | Spots 関連タスク全ての前提 | 未着手 |
| Spots 一覧・詳細画面のルーティング追加 | `app/(tabs)/` に Spots 画面ファイルが存在しない | 未着手 |

---

## P1 ── Walk mode（コア機能）

| No. | タスク | 備考 |
| --- | --- | --- |
| 74 | 探索中の状態管理を作る（開始時刻・距離・現在地など walk session 全体） | `virtualTrip` state は一部あり |
| 69 | 探索開始ボタンを作る | 素材 `start-button.svg` は未配線 |
| 72 | 探索中のリアルタイム移動距離を state で管理する | 起動時1回取得のみ。`expo-location` 前提 |
| 73 | Home(map) / Walk mode にリアルタイム移動距離を反映する | `movementResult` → `virtualTrip` 反映は未 |
| 68 | Walk mode 画面を Figma に合わせて整える | Street View 土台はある。オーバーレイ UI 未 |
| 75 | 探索中ダイアログを Figma に合わせて作る | `measuring-dialog.png` 未使用 |
| 76 | 探索終了確認ダイアログを作る | 未着手 |
| 115 | 探索終了後の戻り先と再開導線を整える | 未着手 |

---

## P1.5 ── ゴール設定（要確認・スコープ未決定）

`goalPoint` state はあるが機能未実装。Walk mode のコアフロー確定後に着手するか判断する。

| No. | タスク |
| --- | --- |
| 67 | ゴール設定機能を作る |
| 68-goal | 目的地の検索または候補選択 UI を作る |
| 69-goal | ゴール保存・変更機能を作る |
| 70 | ゴールまでの残距離表示を作る |
| 71 | ゴール到達時の表示を決める |

※ P1 の No.68（Walk mode Figma）・No.69（探索開始ボタン）と番号が重複するため、ゴール系は `-goal`  suffix で区別。

---

## P2 ── Spots（コア機能）

| No. | タスク |
| --- | --- |
| 77 | Spots 一覧・詳細画面を作り API を繋ぐ |
| 83 | 探索中の現在地周辺スポットを表示できるようにする |
| 95 | 発見したスポットを記録できるようにする |
| 89 | Wikipedia 画像や外部リンクを Spots 詳細に表示する |
| 90 | Wikipedia 情報が取れない場合のフォールバック表示を作る |
| 90b | スポット未発見時の空状態 UI を作る |

---

## P3 ── Favorite / Like / Visited

| No. | タスク |
| --- | --- |
| 91 | お気に入り・like・visited 系 API を繋ぐ |
| 92 | Favorite 画面を作る |
| 93 | Favorite 画面を Figma に合わせて整える |
| 94 | like・visited・お気に入りの見せ方を Figma に合わせて整える |
| 96 | 一覧・詳細・探索画面で like/visited/favorite の状態反映を揃える |

---

## P4 ── 権限・品質整備

| No. | タスク |
| --- | --- |
| 97 | 位置情報や移動データ利用の権限導線を整理する |
| 98 | 権限未許可時の案内画面を作る |
| 116 | splash 画面を作る |
| 112 | splash から認証状態に応じて遷移する流れを整える |
| 49 | プロフィール変更画面を作る（`profile.tsx` は存在するが Tabs 未登録で到達不能） |
| 99 | エラーハンドリングを全体で整理する |
| 100 | ローディング表示を全体で整理する |

---

## P5 ── QA・仕上げ

| No. | タスク |
| --- | --- |
| 113 | ログイン → Home(map) → Dashboard → Home(map) の流れを確認する |
| 114 | Home(map) → Walk mode → スポット発見 → 詳細閲覧 の流れを確認する |
| 117 | 動作確認と不具合修正をする |
| 118 | 全画面を Figma と見比べて差分修正する |

---

## 削除したタスク（不要・重複）

| No. | タスク | 理由 |
| --- | --- | --- |
| 65 | 実移動距離を仮想移動距離として使うルールを決める | API のデータ構造から自明。実装不要 |
| 66 | 距離の消費タイミングと更新方法を決める | タスク 72 に統合 |
| 67-walk | Walk mode 画面を作る | 基本実装済み（`index.tsx` 内 mode 切替 + Street View）。タスク 68 に統合 |
| 70-data | 探索中に取得・更新する移動距離データを整理する | タスク 72 に統合 |
| 71-location | 位置情報または移動ログから距離を更新する方法を決める | タスク 72 に統合 |

---

## MVP 後に検討

- 型定義を整理する（旧 108）
- API モジュールを機能ごとに分ける（旧 109）
- デザインと共通 UI を整える（旧 110）
- 共通 UI コンポーネントを Figma ベースで作り直す（旧 111）

---

## 旧番号との対応（参考）

| 残タスク No. | 旧 `explanation-format.md` No. |
| --- | --- |
| 74（状態管理） | 79 |
| 72（リアルタイム距離） | 77 |
| 73（距離反映） | 78 |
| 75（探索中ダイアログ） | 80 |
| 76（終了確認） | 81 |
| 115（終了後導線） | 120 |
