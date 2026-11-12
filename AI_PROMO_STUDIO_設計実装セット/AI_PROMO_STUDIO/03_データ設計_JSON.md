# AI PROMO STUDIO｜データ設計・AI差分更新・カラー推薦 v1.0

## 1. 原則

- データの正本は `project.json`。プレビューとMP4はこれを**同じ描画関数**で解釈する。
- **sceneId と layerId は不変**。配列インデックスは編集対象の識別に使用しない。
- **時間は整数フレーム**。例：30fpsの7秒 = 210フレーム。UI表示は秒に換算。
- シーンは順番に連結し、開始位置は持続時間から算出。重複管理によるズレを防ぐ。
- シーンの動画尺、各レイヤーの表示タイミング、モーションの完了時間、元素材のトリム長は別々の値。
- AIが書いた内容にも `source: ai`、手動で変更した部分には `source: user` の変更履歴を保存。

## 2. 推奨ファイル構成

```text
ai-promo-studio/
  reference/motion-atlas-60/        # 元データそのまま（読取専用）
  src/app/                         # ブラウザUI
  src/editor/                      # シーン編集／履歴／状態管理
  src/compositions/                # Remotion: Preview & MP4共通描画
  src/motion-registry/             # 実装済みモーションID→Component
  src/lib/schema/                  # JSON Schema / Zod
  server/                          # localhost API / assets / render
  workspace/projects/<projectId>/
     project.json                  # 唯一の正本
     history/                      # スナップショット／履歴
     proposals/                    # AIの差分候補（未承認）
     assets/                       # 画像、動画、BGM、効果音
     output/                       # MP4、HTML共有パッケージ、QAレポート
  docs/
```

## 3. project.json の主要オブジェクト

| プロパティ | 役割 |
|---|---|
| schemaVersion, projectId, revision | 互換性と差分適用の整合性 |
| title, brief | プロジェクト名・初期依頼文 |
| video | fps、幅、高さ、目標尺、尺制御モード |
| theme | ユーザーが指定した色と、確定した配色パレット |
| assets[] | 元素材、種類、相対パス、権利・実録確認情報 |
| scenes[] | 配列順が再生順。sceneId、役割、尺、レイアウト、テンポ、レイヤー |
| scenes[].layout | single / split2 / grid4 / free + 方向・セルの構成 |
| scenes[].layers[] | 文字・動画・画像・形状・エフェクトとそれぞれの表示範囲 |
| scenes[].motions[] | ID参照、対象layerId、パラメーター、実装状態 |
| audioTracks[] | BGMとSEの参照、開始位置、音量、フェード |
| overrides | シーン別カラー等。全体テーマより優先（未ロックの範囲のみ） |
| locks[] | 手動固定したパス／対象を記録 |
| meta | 素材監査、撮影根拠、ライセンス、更新履歴への参照 |

実際に保存可能な例は `examples/example-project.json` を参照。初期4コマ・合計600フレーム（20秒）になっている。

## 4. 時間管理（20秒→22秒の例）

```text
30 fps
sc-intro      90f  = 3秒
sc-feature   120f  = 4秒
sc-explain   210f  = 7秒
sc-outro     180f  = 6秒
-------------------------
計           600f = 20秒

sc-explain を 270f (9秒) に変更
→ 計 660f = 22秒  [rippleモード]

20秒を維持したい場合
→ 60f分を他コマで調整する候補を提示する
→ ユーザー承認後のみ適用する
```

- フレーム丸めの例：30fpsで1.25秒は37.5fなのでUIに丸め規則を表示（例 38f=1.267s）。
- BGMは長さに合わせた切り詰め・追加ループ・無音などの候補を出す。無断でBGMの速度や音程を変えない。
- テンポは `paceKeyframes` の0〜1の相対時刻と0〜100の強度で保持。秒数変更で**曲線の位置は相対維持**、レイヤー内の局所時刻は原則絶対フレームのまま。変更影響を警告。

## 5. レイヤー設計

各レイヤー共通：
- `layerId`, `kind`（text / image / video / shape / overlay）
- `zIndex`, `inFrame`, `durationFrames`, `opacity`, `visible`, `locked`
- `transform`（x, y, width, height, rotateDeg; 正規化座標0〜1）
- `style`（文字サイズ、フォント、色キー、背景、clipなど）
- `source`（assetId、またはtext）、`motionStack[]`

エフェクト重ね合わせの例：
```json
{
  "layerId": "text-explain",
  "kind": "text",
  "text": "必要な情報を、すぐ確認。",
  "inFrame": 30,
  "durationFrames": 180,
  "motionStack": [
    { "motionId": "M-017", "name": "typewriter", "startOffsetFrames": 0, "durationFrames": 42, "params": { "charactersPerSecond": 12 } },
    { "motionId": "M-008", "name": "scan", "startOffsetFrames": 10, "durationFrames": 60, "params": { "opacity": 0.25, "scope": "layer-bounds" } }
  ]
}
```

上の2種類は現行のMOTION ATLASで`M-017`（タイピング）、`M-008`（スキャン）として登録されている。**製品の初期実装で移植・検証するまでは利用可能と扱わない。**

## 6. レイアウト設計

- `single`: 1セル全画面
- `split2`: direction horizontal/vertical、splitRatio（0.2〜0.8）
- `grid4`: 4セル。順番、各セルのassetIdまたはlayerId、gap、rounding
- `free`: レイヤーの座標とclipPath。`rect` / `circle` / `diamond`等の既定形状マスク

**重要：** レイアウト切替はレイヤーを削除せず、セルへの紐付けのみ変更。未割当レイヤーは`unplacedLayerIds[]`に保持。ランダム配置は乱数seedを固定。

## 7. カラー提案のデータ構造

`theme.requestedColors` は入力値。 `theme.palette` はユーザーが選んだ**確定パレット**。

```json
{
  "requestedColors": { "primary": "#14243A", "secondary": null },
  "palette": {
    "background": "#0C1522",
    "surface": "#14243A",
    "text": "#F5F7FA",
    "primary": "#356997",
    "accent": "#6BC5DA",
    "mutedText": "#B9C5D1"
  },
  "suggestedUsage": {
    "basePct": 80,
    "primaryPct": 15,
    "accentPct": 5,
    "note": "デザインの目安。画像・動画の画素占有比率を自動保証する数値ではない。"
  }
}
```

### 推奨処理
1. HEXバリデーション。原色が1色なら同系色・明度階層・ニュートラルを生成。2色なら色相・明度・彩度から役割分担を提案。
2. 配色の候補3パターンを作り、背景・本文・アクセントの割当を変える。
3. 文字コントラストをチェック（通常本文4.5:1、重要な大文字3:1を目安）。
4. 強いアクセントの面積は**目標比率を参考値として提示**し、背景が主役を奪う場合は注意を促す。
5. ユーザーが適用した時だけ `theme.palette` に反映。コマ別 `colorOverrides` で差別化可能。
6. アクセント色などの `locks` をAIによる再提案から保護。

## 8. AIに渡す情報の単位

### 初稿作成
- 自然文brief、指定尺、アスペクト、ブランド、素材メタデータ、許可済みモーション一覧、使用禁止条件。
- 結果は `project.json` 形式で返す。**スキーマ検証に失敗したら採用せずエラーを返す。**

### 部分修正（patch）
- `baseRevision`、`targetSceneId`、対象シーンオブジェクト、必要なtheme、利用可能な素材／モーション。
- AIは `proposals/<id>.json` に**意図・差分**を出力。元プロジェクトは変更しない。
- 許可操作：`setSceneDuration`、`setLayout`、`setLayerText`、`setLayerMotionStack`、`addLayer`、`setSceneTheme`、`setPaceKeyframes`等の限定操作。
- **任意のソースコードをAIのpatchから実行させない。** `eval`、自由なHTML/JSやシェル文字列を差分データに入れない。

### patch例
```json
{
  "proposalId": "prop-explain-001",
  "baseRevision": 3,
  "targetSceneId": "sc-explain",
  "reason": "説明コマを9秒化し、タイプとスキャンを合成する",
  "operations": [
    { "op": "setSceneDuration", "sceneId": "sc-explain", "durationFrames": 270 },
    { "op": "setLayerMotionStack", "sceneId": "sc-explain", "layerId": "text-explain", "motionStack": [
      { "motionId": "M-017", "startOffsetFrames": 0, "durationFrames": 42, "params": { "charactersPerSecond": 12 } },
      { "motionId": "M-008", "startOffsetFrames": 10, "durationFrames": 60, "params": { "opacity": 0.25, "scope": "layer-bounds" } }
    ] }
  ]
}
```

### patch検証の手順
1. baseRevision一致をチェック。
2. targetSceneIdと全オペレーションのsceneId一致をチェック。
3. レイヤーID、motionIdが存在するか確認。
4. 編集対象がロックされていないか確認。
5. 既存状態へのdry-run適用→スキーマ／合計尺／素材有無／レイヤー終端などを検証。
6. **差分・影響・総尺変化をUI表示**。
7. ユーザー承認した部分のみatomic commit。revisionを1増やし、Undo可能にする。
8. 競合・エラー時は採用せず元データを保存。

## 9. 60件モーションのアダプター

既存JSONは `{name, version, canvas, showreel, motions[]}` 形式。既存の`motion.id/name/category/duration/usage/tech/desc/prompt/mark`を読取専用で取り込み、別ファイル `motion-enrichment.json` に次を追加：

```json
{
  "M-017": {
    "moods": ["trust", "tech", "calm"],
    "paces": ["slow", "medium"],
    "sceneRoles": ["intro", "feature", "explanation"],
    "intensity": 2,
    "implementationStatus": "demo-only",
    "remotionComponent": null,
    "license": "original-atlas-demo"
  }
}
```

- **IDの一致が必須**。名前でコードを見つける設計にはしない。
- 実装状態：`demo-only` / `implemented` / `verified`。AI自動挿入対象は `implemented` 以上。
- 使用実績と評価（迫力・読みやすさ・相性）を後から登録できる。
- 将来、外部サイトの参考素材にはreference URLとライセンスを別管理し、無許諾のソースコードや素材をそのまま取り込まない。

## 10. 共有用HTMLと編集用HTMLの違い

| 種類 | 技術 | 目的 |
|---|---|---|
| 編集画面 | React + Remotion Player + localhost API | JSONを編集し即時プレビュー。保存・AI差分適用可 |
| 共有用HTML | 静的HTML + MP4（必要ならポスター画像） | 相手に見てもらう。編集機能・APIキー・素材制作情報なし |
| MP4 | Remotion Renderer | SNS・メール・イベント会場で再生 |
| プロジェクト一式 | project.json + 素材 | 後日再編集するためのデータ |

編集用Webアプリを `file://` の単一HTMLで完結させる必要はない。ローカルサーバーを立てて `http://127.0.0.1:xxxx` で開く。

## 11. 検証するエッジケース

- シーン尺を短くした結果、文字演出の終了がコマ末尾を超える。
- 20秒固定のまま9秒化したため、他シーンから減らせる尺が足りない。
- 4分割にしたが素材が2点しかなく、空セルがある。
- 既存モーションIDは見本だけで、書き出し対応が未実装。
- フォントロードが不安定で動画中に文字の幅が変わる。
- AI提案を開いている間に手動変更が入ってrevisionがずれる。
- モーションがランダムで再生のたびに形が変わる。
- BGMが20秒だが総尺22秒になった。
- 同じロゴ・テキストがアスペクト変更で見切れる。
- 外部素材の使用許諾が不明。

## 12. 付属機械可読データ

- `examples/example-project.json`: 編集可能な20秒4シーンのサンプル
- `examples/project.schema.json`: 構成バリデーション用の最小JSON Schema
- `examples/example-patch.json`: 7→9秒、タイプ＋スキャン指定のパッチ例

※ 実装時はTypeScript型・Zod等も同じスキーマから整合させ、**正規化と意味検証**（時間長、参照ID、許可モーション、各レイヤーの境界、コントラストなど）は追加で実装する。
