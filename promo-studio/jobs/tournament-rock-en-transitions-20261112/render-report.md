# Tournament Rock — English / Transitions

状態: 完成・検査済み

- 動画: output/promo_16x9.mp4
- プレビュー: output/preview/index.html
- 共有用: output/tournament-rock-en-share.zip（展開してpreview/index.htmlを開く）
- 編集: src/RockEnglishPromo.tsx、src/transitions/variety.tsx、composition.json
- 再生成: node scripts/render.mjs jobs/tournament-rock-en-transitions-20261112
- 検査: node scripts/qa.cjs jobs/tournament-rock-en-transitions-20261112

日本語版を保持し、別成果物として英語版を作成。全9境界で異なるトランジションを使用。詳細はtransition-guide.md。After Effects本体ではなくRemotionで実装。

## 検査結果

- H.264 / 1920×1080 / 30fps / 660フレーム / 22.016秒
- AAC音声、ピーク-1.33 dBFS
- 全編デコード成功、660フレーム検査、全黒フレームなし
- HTMLローカル再生が音声ありで最後まで完了、JavaScriptエラーなし
- PC / モバイル表示確認、横はみ出しなし
- 39枚の静止画を生成、各トランジションの前半・中央・後半と主要カットを目視確認
- 撮影対象の画面内に日本語が残らないことを撮影時に検査。コピーとCTAも検査

元のアプリ、過去の動画、公開設定は変更していない。映像は既存Animation Previewによる架空の大会・結果。元素材の権利等の制約は日本語版のfeature-audit.mdを継承。コミット・push・外部公開なし。
