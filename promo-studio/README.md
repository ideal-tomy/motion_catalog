# MOTION ATLAS — Promo Studio MVP

実画面・文字・モーション・オリジナル音源をRemotionで合成する制作本体。After Effectsプロジェクトではない。全体方針は [親README](../README.md)、次の開発は [進め方](../docs/進め方.md) を参照。

確認・共有は [動画ライブラリ](../動画ライブラリ/index.html) を使用する。新規案件は `delivery.json` を作成し、render → qaを実行。QA合格後に作品名付きのMP4・HTMLが自動集約される。命名と版番号は [保存ルール](../docs/動画の保存ルール.md) を参照。

## 印象別の構成候補

60件の仮タグ、9件のTRタグ、4種の印象プリセット、案件別素材一覧を追加済み。[制作プラン](../制作プラン/index.html) で比較できる。まだ構成案であり、汎用Compositionでの新規動画生成は次の工程。

```powershell
npm run catalog:sync
npm run plan
npm run library
npm run verify:workflow
```

編集するタグの正本は `src/catalog/style-tags.json`。素材は案件内assets.json、印象・尺・強弱はpresets/styles.json。詳細は [タグと構成プラン](../docs/タグと構成プラン.md)。

## 既存案件

| ジョブ | Composition | 内容 |
|---|---|---|
| tournament-20261112 | TournamentPromo | トーナメント初版20秒 |
| tournament-rock-20261112 | TournamentRock | 日本語ロック22秒 |
| tournament-rock-en-transitions-20261112 | TournamentRockEnglish | 英語・9種類の独自トランジション22秒 |
| dd-rock-20261112 | DdRock | DDの給与×勤怠の突合・根拠確認22秒 |
| dd-premium-20261112 | DdPremium | 高級感・信頼感。余白と抑制した動きで照合・根拠を紹介20秒 |

各案件の `output/preview/index.html` で再生。`output/promo_16x9.mp4` が完成動画。共有ZIPは展開してHTMLを開く。案件内のJSONが構成、Markdownとqaが制作根拠・検査記録。

DD高級感版は `node scripts/music-premium.mjs` → `node scripts/render.mjs jobs/dd-premium-20261112` → `node scripts/qa.cjs jobs/dd-premium-20261112`。編集は `src/PremiumPromo.tsx`、M-005は `src/motions/premium.tsx`。今回の理想.mdは案件内creative-brief.mdに保存している。

## 編集・書き出し

このフォルダを作業ディレクトリにする。既存依存を使い、通常作業で再インストールしない。

```powershell
npm run studio
npm run typecheck
node scripts/render.mjs jobs/tournament-rock-en-transitions-20261112
node scripts/qa.cjs jobs/tournament-rock-en-transitions-20261112
```

Studioは3190番。Compositionを選び、案件のcomposition.jsonと対応するReactを編集する。現在のrender/QAは20・22秒、16:9、1920×1080、30fps前提。9:16・任意尺は未実装。

日本語ロックは `npm run music:rock` / `render:rock` / `qa:rock`、DDは `music:dd` / `render:dd` / `qa:dd`。初版は `npm run music` / `render` / `qa`。英語版は日本語ロックの音源を使用する。

`render.mjs` の `--stills-only` は静止画確認、`--skip-stills` は確認済み静止画を使って動画を出力する。検査後の報告書更新は案件に対応する `finalize-rock.mjs` / `finalize-dd.mjs` / `finalize-english.mjs`。共有ZIPは最終成果物から作成する。

## 撮影

トーナメントは既存Animation Previewを撮影する。対象アプリを変更せず、専用Vite設定とキャッシュを使う。

```powershell
node C:/Users/ryoji/00myapp/ai_demo_workspace/tournament-latest-review-20261024/node_modules/vite/bin/vite.js --config capture.vite.config.mjs --host 127.0.0.1 --port 5175 --strictPort
# 別ターミナル、同じ制作フォルダ
node scripts/capture.cjs
# 英語版の場合
node scripts/capture.cjs --english
```

DDは `capture-dd.vite.config.mjs` で4212番のローカルプレビューを起動し、`node scripts/capture-dd.cjs`。同梱の架空CSVを使う。詳細は案件内のfeature-audit.mdと撮影証跡。

## 共通部品と登録情報

- `src/motions/index.tsx`・`rock.tsx`・`dd.tsx`：実装済みM-ID
- `src/transitions/variety.tsx`：独自TR-ID
- `src/catalog/registry.json`：60件の説明と実装・検証状態
- `scripts/catalog.mjs`：参照カタログから説明を同期。既存実装・検証情報は保持
- `scripts/audit-workspace.cjs`：参照HTML60件の操作検査と証跡生成

参照原本を上書きしない。録画画像・音源・jobs・lockfileは再編集に必要。build・.cache・node_modulesは生成物/実行環境であり、通常の文書重複として削除しない。

対象アプリ・本番DB・公開設定は変更しない。権利・未確認機能等の制約は各案件のfeature-audit.md、承認範囲は [AGENTS.md](../AGENTS.md) を参照。
