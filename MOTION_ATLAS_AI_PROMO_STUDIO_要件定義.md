# MOTION ATLAS — AI PROMO STUDIO
## デモ・アプリを指定するだけで宣伝動画を作るためのシステム要件定義 v0.1

作成日: 2026-11-12
状態: **全体要件。案件別の手動支援MVPは実装済み、汎用化は継続開発**

2026-11-12追記：`promo-studio/` にトーナメント・DDの4案件、MP4・HTML・検査記録がある。現状との差分と今後の優先順位は [docs/進め方.md](docs/進め方.md)、制作手順は [promo-studio/README.md](promo-studio/README.md) を参照。以下のPhaseや構造は目標要件であり、すべて実装済みという意味ではない。

## 1. 目的

ユーザーが自分のデモ、Webツール、アプリの **URL / ローカルパス / GitHubリポジトリ** と「15〜20秒の宣伝動画を作る」という自然文を渡すと、AIが対象を調査して重要な機能を見つけ、実際の操作・画面を素材にしながらMOTION ATLASのモーションを選択し、BGM付きの動画を制作する。

成果物は **MP4、共有用HTMLプレビュー、再編集可能な動画プロジェクトと制作根拠**。最初はローカルPCのCursor/Codex内で完結。Webサービス化や完全自動公開は後回し。

### 依頼例

> この受入検査デモを読んで、現場の担当者が「何を楽にできるツールなのか」が20秒で伝わるCMを作成して。実際に動作する照合と判定の画面を見せて。文字は短く。MOTION ATLASのモーションは自分で選択。16:9、BGM付き。MP4と共有用HTMLを出して。

## 2. 入力

**必須**
- source: ローカルディレクトリ／リポジトリ／操作可能なURL
- instruction: 動画制作の自然文

**任意（未指定なら安全な初期値）**
- duration: 10 / 15 / 20 / 30秒（既定20秒）
- aspectRatio: 16:9 / 9:16 / 1:1（既定16:9）
- audience: 誰に見せるか
- goal: 機能理解 / ブランド認知 / 問い合わせ / イベント告知
- visualTone: calm / professional / energetic / cinematic
- brand: 名前・ロゴ・色・リンク（根拠のある値のみ）
- musicPath, sfxPaths: 利用許諾済みの音素材
- captureMode: actual-ui（既定）/ reconstruction（演出用再構築）/ mixed
- noGo: 使用を避けたい演出・表現・データ

## 3. 主要フロー

### A. 対象の読み取り（Inspector）

1. ローカルリポジトリの場合、README、画面構成、ルーティング、主要コンポーネントを読み取り、変更は加えない。
2. Webデモの場合、Playwrightなどで**許可された**ページにアクセスし、画面・主要操作・変化を確認する。デモ用アカウント／テストデータを使用。
3. 機能を `verified / inferred / inaccessible` に分類し、根拠（画面、操作、コード）を保存。
4. 認証が必要な場合や対象画面に到達できない場合、未確認機能を作り話で補わない。
5. ブラウザ操作によって注文・送信・決済・本番更新など不可逆な操作を起こさない。実演用データのみ。

### B. 素材化（Capture）

- 各機能について「開始画面 → 操作 → 結果」のスクリーンショットまたは短いクリップを保存。
- 撮影時に固定の画面サイズ、拡大率、カーソル、ウェイト時間、表示データを再現可能にする。
- 氏名・メール・顧客データ・トークン等は原則**収録しない**。必ずダミーデータにする。
- 演出によるUIの再構築が必要な場合は、元画面の忠実な再現と誤認させず、重要機能を変えない。

### C. CM企画（Planner）

- ターゲットごとに「課題 → 操作 → 変化 → CTA」を一本の短い物語にする。
- 20秒では**一番魅力的な機能を1つ、補助的に1機能まで**。詰め込みを避ける。
- 60件のモーションカタログから、表示目的・画面の見やすさ・映像のテンポに合う **3〜6件**を選ぶ。選択理由を記録。
- 自動生成した絵コンテとシーン情報を `storyboard.md` / `composition.json` に保存。
- 事実未確認の性能・削減率・導入実績・顧客名・UI機能を主張しない。

### D. 映像制作（Composer）

- Remotion/Reactで、実際の画面キャプチャ・文字・図形・モーション・音をタイムラインに配置。
- 各モーションは `M-001`〜`M-060` のIDと、実装コンポーネントの対応表（registry）を使う。
- 各モーションの主要パラメータを固定形式のpropsに整理：`durationFrames, text, accentColor, intensity, speed, easing, audioCue` など。
- 字幕はモバイルで読めるサイズと表示時間を確保する。光やフラッシュは控えめ。
- 音源がないときは、無断取得せず、無音または利用可能な仮音源と明記する。

### E. 出力と検証（Render / QA）

- MP4: H.264、1920×1080／30fps（縦型では1080×1920）。音付きの場合はAAC。
- HTML: ローカルで開ける `preview/index.html` と同階層のMP4で再生できるシンプルなプレーヤー。共有URLにする場合は別途ホスティングする。
- Remotion Studio: タイムラインを編集し、個別シーンと完成版を確認できる状態。
- QA: 全編再生、最初・途中・最後の静止画確認、黒画面・文字切れ・音声クリップ・アスペクト・ロゴリンクを検査。
- `render-report.md` に選んだ機能、使用モーション、出力内容、未確認事項を記録。

## 4. MOTION ATLAS 60の扱い

`MOTION_ATLAS_60_AEE99382E38383%88.zip` と展開先 `MOTION_ATLAS_60_AEE99382E38383%88/MOTION_ATLAS_60/` は参照原本。元のHTML/JSON/プロンプト/IDを**変更・上書きしない**。

現状の60件はCanvas 2Dで動くサンプルと説明文。すべてがRemotionに移植済みではない。そのため、3段階に分ける。

1. **参照カタログ化**: 60件の説明・タグ・IDを機械的に検索できるようにする。
2. **MVPの実装**: 1作品で使う4〜6件だけを`src/motions/`へ独立移植し、プレビューとMP4で同じ結果になるかを検証する。
3. **継続移植**: 利用頻度順に残りを拡張する。未実装IDは「未実装」として扱い、別の動きへの無断置き換えを避ける。

モーションごとに以下を備える。
- id, name, category, tags, suitableFor, notSuitableFor
- propsSchema, minDurationFrames, recommendedDurationFrames
- runtimeStatus: demo-only / implemented / verified
- sourceAsset, implementationPath, previewPath
- 説明文および英語・日本語の依頼文

## 5. システム構造（案）

```text
motion-atlas-promo-studio/
  reference/
    motion-atlas-60/         # 参照原本。読取専用
  src/
    inspector/               # 機能監査、根拠整理
    capture/                 # Playwright操作・キャプチャ
    planner/                 # 絵コンテ、モーション推薦
    catalog/                 # ID / タグ / 登録状態
    motions/                 # 実装済みの独立モーション
    compositions/            # Remotionのシーン合成
    components/              # タイトル、端末フレーム、字幕、CTA
  presets/
    product-demo-20s.json
    tournament-teaser-15s.json
  jobs/
    <project-slug>/
      request.json
      feature-audit.md
      storyboard.md
      captures/
      composition.json
      render-report.md
      output/
        promo_16x9.mp4
        preview/index.html
        preview/promo_16x9.mp4
  package.json
  README.md
```

**技術**: Node.js / TypeScript / Playwright / Remotion / 必要に応じてFFmpeg。公開用HTMLは動画タグ、編集用はRemotion Player・Studioを採用。クラウド出力の自動化は初期MVPの対象外。

## 6. 動画構成データのイメージ

```json
{
  "project": "incoming-inspection-demo",
  "durationSeconds": 20,
  "fps": 30,
  "width": 1920,
  "height": 1080,
  "captureMode": "mixed",
  "scenes": [
    {"from": 0, "to": 3, "role": "hook", "text": "確認作業、もっとスムーズに。", "motionIds": ["M-017"]},
    {"from": 3, "to": 9, "role": "real-demo", "source": "captures/compare.mp4", "motionIds": ["M-008"]},
    {"from": 9, "to": 15, "role": "result", "source": "captures/result.png", "motionIds": ["M-031"]},
    {"from": 15, "to": 20, "role": "cta", "text": "実際のデモで体験", "motionIds": ["M-020"]}
  ]
}
```

※ 上記の文言・機能・モーションは**動作確認をしていない架空の例**。実制作では対象デモから確認した内容に置き換える。

## 7. 開発順序と合格条件

### Phase 1｜手動支援MVP（最優先）
- 独立リポジトリを作成。既存のデモのソースは読み取り専用。
- まず**自分が管理しているデモ1本**でInspectorを実装し、実画面を撮影。
- 20秒の絵コンテを作成し、4〜6件のモーションをコード部品化。
- 一つの `request.json` からMP4を書き出し、共有用HTMLも生成する。
- 人がレビューして修正できる。AIがリポジトリへ破壊的な変更をしない。

**合格**: 自分が指定したデモの本当の画面・動きが見え、20秒のMP4とローカルHTMLの両方で再生できること。

### Phase 2｜依頼を自然文だけに近づける
- URL / パスと短い要望から `request.json`、機能監査、絵コンテを作る。
- カタログから使用可能なモーションだけを推薦・自動配置。
- 修正指示「4秒目のズームを弱めて」などから該当シーンだけを更新。
- 16:9と9:16の両対応。

**合格**: 同じデモに対する別の指示で、異なるが正しい動画を再生成できること。

### Phase 3｜共有・量産
- サービス共通のテーマやCTAを保存。
- MP4とHTMLのURL共有、権限管理、レンダリング履歴、再生成を整備。
- 60件のモーションを使用頻度順に移植・テスト。

**合格**: 複数デモのCMを混同せず、案件ごとに素材・ブランド・権限を分離できること。

## 8. 制作時の重要な制約

- **既存サイト／デモの公開リポジトリ、本番DB、Cloudflare、Vercelを勝手に変更しない。**
- 公開済みサイトの閲覧だけでは、非公開機能や操作時の正しい挙動はわからない。必要ならデモアカウントやローカル実行環境を用意する。
- 実際のアプリを撮影するモードと、演出のためにUIを再構築するモードを区別。架空画面を実機デモと誤認させない。
- 生成された営業文・数値・効果は根拠照合する。根拠がない場合は主張しない。
- 音楽、フォント、画像のライセンスを確認し、利用が不明な素材は使わない。
- Remotionの商用ライセンス条件は使用主体・規模・自動化形態により異なるため導入時に確認する。
- カットを増やしすぎない。20秒では基本4〜6シーン、主役の操作を見せる時間を確保する。
- ログイン資格情報・顧客データ・環境変数をレポート、動画、HTML、生成AIへのプロンプトに含めない。

## 9. 参考となる公式ドキュメント

- Remotion導入: https://www.remotion.dev/docs
- 動画の書き出し: https://www.remotion.dev/docs/render
- 動画へパラメータを渡す: https://www.remotion.dev/docs/passing-props
- ブラウザのPlayer: https://www.remotion.dev/docs/player
- Codex/Cursor向けガイド: https://www.remotion.dev/docs/ai/skills
- Playwrightのスクリーンショット: https://playwright.dev/docs/screenshots
- Playwrightの動画記録: https://playwright.dev/docs/videos
- Remotionの利用条件: https://www.remotion.dev/docs/license/pricing
