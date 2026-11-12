# DD / 高級感・信頼感 — 制作報告

状態：完成・検査済み。理想.mdの要望とユーザー指定のDDを対象に制作。

20秒・1920×1080・30fps・600フレーム。0–3秒導入、3–7秒製品、7–14秒照合結果と根拠、14–20秒サービス名とCTA。低彩度・余白・スローズーム・段階表示・3枚のカード展開。M-003 / M-012 / M-005の3種類。

## 成果物

- output/promo_16x9.mp4
- output/preview/index.html と同階層のMP4・ポスター
- ../../../動画ライブラリ/ の作品名付きフォルダ（HTMLとMP4を1作品1フォルダに集約）
- composition.json、storyboard.md、request.json、delivery.json、assets.json
- 編集：StudioのDdPremium、src/PremiumPromo.tsx、src/motions/premium.tsx
- 再生成：node scripts/render.mjs jobs/dd-premium-20261112 → node scripts/qa.cjs jobs/dd-premium-20261112

## 検査

- TypeScript成功。Reactはフレームからの決定論的描画、条件付きフック・副作用・外部通信なし。
- h264 / 1920×1080 / 600 frames、全編デコード成功。
- AAC音声、ピーク-7.56 dBFS。オリジナルのピアノ風合成音＋持続音、第三者録音なし。
- 600フレーム検査、全黒フレームなし。
- ローカルHTMLで音声ありの全編再生成功、エラーなし、PC・モバイルで横はみ出しなし。
- 全シーンと切り替え付近の静止画を生成・目視確認。結果画面の文字と画像の重なりを修正済み。
- MP4 SHA-256：db3a33fc560c4d5c24a2443b354d1a6ffa640be75ff40f4738c3c6b398ac2b33

実画面の静止キャプチャを再利用したCM。ライブ操作の新規録画ではない。カードは明示した機能の要約。サンプルデータ・最終判断は人が行う旨を全編表示。機能と権利の制約はfeature-audit.md。元アプリ・過去動画・本番DBを変更せず、push・外部公開なし。
