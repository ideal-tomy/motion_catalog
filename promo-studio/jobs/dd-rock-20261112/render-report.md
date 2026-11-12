# DD ROCK CUT — 完成・検査報告

状態: **完成・検査済み**

## 出力

- output/promo_16x9.mp4（8,301,599 bytes）
- output/preview/index.html、同階層のMP4・poster.png
- output/dd-rock-share.zip（展開後preview/index.htmlを開く）
- 編集: Remotion StudioのDdRock、src/DdPromo.tsx、src/motions/dd.tsx、composition.json
- 再生成: npm run music:dd → npm run render:dd → npm run qa:dd

## 映像

22秒。最初の9カットが2秒、最後が4秒。180 BPMのDリフを使うオリジナル・ロック調BGM。
前回とは異なる6種類: M-002 テキスト・スクランブル / M-008 スキャニングUI / M-018 分割文字の合流 / M-028 モーダル・ズーム / M-032 データ・パケット流動 / M-046 シャッター開閉。
主役は既存DDアプリの給与×勤怠突合と根拠確認。架空CSVの投入、差異の実計算、根拠ダイアログを撮影した。
資料投入→差異検出→根拠の参照行→人による判断、という流れで制作。説明図は実画面と区別して表示。

## 検査

| 項目 | 結果 |
|---|---|
| TypeScript | tsc --noEmit成功 |
| 動画 | h264 / 1920×1080 / 30/1 fps / 660フレーム |
| 音声 | aac / 48kHz / stereo |
| コンテナ尺 | 22.016秒（映像22秒、AACパディングを含む） |
| 全編デコード | 成功 |
| 黒画面 | 660フレームを検査し0件 |
| 音声ピーク | -1.31 dBFS、クリッピングなし |
| 音声RMS | -15.39 dBFS |
| HTML全編再生 | ローカルfile://で非ミュート、ended=true、エラー0 |
| PC・モバイル | 1440×1000 / 390×844、横はみ出しなし |
| 静止画 | 全10カットの1秒位置・冒頭・最終位置を出力し目視確認 |
| 撮影 | JSエラー0、HTTP失敗0、更新要求0、AI API呼び出し0 |

証跡: qa/result.json、qa/ffprobe.json、qa/frame-*.png、qa/html-desktop.png、qa/html-mobile.png、captures/evidence.json。

## 制約・保護

同梱の架空CSVによるデモで、実顧客の結果ではない。差異は債務の法的確定を意味しない。計算式や金額の妥当性を業務監査として保証したものでもない。
実績、削減率、解析精度、債務確定は主張していない。実況は元アプリにある表示演出、突合は元アプリのローカル実処理。
元アプリのソース・共有node_modules・本番DB・環境変数・デプロイ設定は変更せず、独立制作側に撮影物を保存。
外部フォントをローカル空応答で抑止し、OSフォントで描画。LLMや課金APIへ接続していない。
BGMは録音サンプルを使わず弦モデル・波形・ノイズから合成。フォントファイルは同梱しない。
元アプリの入力フォームのmin/step制約に合う架空値を入力した。ソースの修正はしていない。詳細はfeature-audit.md。
前回のトーナメント動画2版は保持。コミット・push・外部公開・有料契約は実行していない。
