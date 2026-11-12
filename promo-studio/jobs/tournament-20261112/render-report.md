# 制作状況 — 2026-11-12

状態: **完成。MP4・ローカルHTML・共有用ZIPを出力し、検査済み。**

## 作成済み

- 20秒・1920×1080・30fpsの企画、request.json、composition.json。
- 抽選120、対戦90、勝利90、優勝120、計420フレームの実画面キャプチャ。
- M-003、M-012、M-016、M-041、M-054の独立React部品と60件のregistry。
- オリジナル合成BGM（20秒、48kHz、16-bit、ステレオ）。ピーク0.503以下、生成時クリッピングなし。
- request.jsonを起点とするRemotionレンダリング・HTML出力スクリプト。
- output/promo_16x9.mp4（20,359,327 bytes）。
- output/preview/index.html・promo_16x9.mp4・poster.png。
- output/tournament-promo-share.zip（21,331,028 bytes）。展開してpreview/index.htmlを開く。
- 独立Gitリポジトリを初期化済み。コミット・push・公開は未実施。

## 確認済み

- 撮影中のJavaScriptエラー0、HTTP失敗0、更新リクエスト0、外部リクエスト0。
- 全シーンの画像読込成功。抽選完成フレーム・対戦フレームの目視確認。
- 撮影後、対象アプリのgit statusは変更なし。
- 元カタログのHTML/JSON/プロンプトは変更していない。
- サンプルである旨を動画とHTMLに表示する設計。
- ユーザー承認後、制作フォルダにRemotion 4.0.542 / React 19.3.1 / TypeScript 7.0.2等を導入。npm audit報告は脆弱性0。
- TypeScript検査成功、Remotion bundle・静止画出力・MP4レンダリング成功。
- H.264 / AAC、1920×1080、30fps、600フレーム。コンテナ尺20.011秒（音声パディングを含む）、映像20秒。
- MP4全編をネイティブデコードし、600フレームすべての縮小RGB画像を検査。黒画面0。
- AACをPCMへデコードしてピーク約-9.06dBFS、RMS約-26.15dBFS。クリッピングなし。
- Edgeでfile://のHTMLを開き、非ミュートで最初から最後まで再生。ended=true、再生フレーム600、エラー0。
- PC 1440×1000とモバイル390×844のHTML確認、横方向のはみ出しなし。
- frame-000 / 045 / 165 / 255 / 345 / 465 / 570 / 599の静止画を出力。冒頭・抽選・対戦・優勝・CTAを目視、文字切れなし。
- ZIPのHTML・MP4・posterの同梱を確認。
- 検査証跡: qa/result.json、qa/ffprobe.json、qa/html-desktop.png、qa/html-mobile.png。

## 制約・未確認事項

- 対象は既存Animation Previewのサンプル演出。本番操作・データ保存・端末間同期・実カメラ・会場音響は未検証。
- 元アプリ画像の商用利用・第三者配布権は確証を得られていない。外部公開前に確認する。
- Remotion Studioのタイムライン編集用ソースと起動コマンドを提供。Studioの対話編集操作そのものは今回のQA対象外。
- プロジェクト専用のBGM合成であり、アプリ自身の音声同期の実証ではない。
- 操作ごとのキャプチャを静止連番で保存し、完成動画を再現可能にした。背景の元アプリの環境アニメーションは実時間撮影であり、再撮影時の全ピクセル一致は保証しない。

権利・本番機能の未確認事項はfeature-audit.md参照。外部公開は行っていない。
