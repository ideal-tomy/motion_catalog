# MOTION ATLAS — AI PROMO STUDIO

実際のデモ画面を調査・撮影し、モーションと音を組み合わせて紹介動画を作るローカル制作基盤です。現在は案件別の手動支援MVPで、任意のデモを自動調査する共通機能は未実装です。

## 入口

- [UI/UX改善版の編集画面](http://127.0.0.1:4319/?project=copy-44e78c84-e29)：コマ／選択レイヤー／全体、要約付きの設定群、文字・素材の文脈表示、固定プレビューと時間軸（[v0.8の変更と検証](docs/UIUX_VERIFICATION.md)）

- [個別アニメーション24種・DD操作サンプル](http://127.0.0.1:4319/?project=copy-44e78c84-e29&panel=animations)：枠全体／内部画像、実文字の動き、合成、試着と保存（[v0.7レポート](ai-promo-editor/docs/LAYER_ANIMATIONS.md)）

- [編集状態・Codex引き継ぎサンプル](http://127.0.0.1:4319/?project=copy-8d2ed409-d89&panel=handoff)：メモと手動確定を区別し、保存済みJSON・最終差分・素材付きZIPを出力（[実装レポート](ai-promo-editor/docs/HANDOFF_IMPLEMENTATION.md)）
- [枠なし・配色・レイヤー編集サンプル](http://127.0.0.1:4319/?project=sample-7ede3a5b-62b)：全画面と6種類の見せ方を即時変更。素材内の拡大、レイヤー編集、全体配色に対応（[操作方法](ai-promo-editor/docs/PRESENTATION_EDITING.md)）
- [DD・30秒10コマのスキャンCM](promo-studio/jobs/dd-signature-ten-20261113/README.md)：2コマ目スキャン・9種類のページ切り替え。高級感と信頼のテンポアップ版
- [DD・高級感と信頼の30秒CM](promo-studio/jobs/dd-signature-20261113/README.md)：実画面の切り抜き・6場面の固有演出・オリジナルBGM。完成動画は動画ライブラリへ集約
- [再出力カタログの20秒テスト制作](promo-studio/jobs/atlas-reexport-tournament-20261113/README.md)：指定6種類の部品・単体プレビュー・大会オープニング
- [ブラウザ編集ツール](ai-promo-editor/README.md)：v3。原本60種の動く図鑑、素材サムネイル、12レイアウト試着、ドラッグ編集・保存
- 編集ツール起動中：[AI PROMO STUDIOを開く](http://127.0.0.1:4319)
- [素材付き編集サンプルを開く](http://127.0.0.1:4319/?project=sample-d041aeef-bcf)：画像・文字・BGMを別々に編集し、全60種の素材用モーションを即時試着
- [完成動画ライブラリ](動画ライブラリ/index.html)：対象・雰囲気・尺・言語で検索、MP4・HTMLを作品単位で保存
- [制作プラン比較](制作プラン/index.html)：同じ素材で迫力・落ち着き・緩急を比較、癒しも個別選択
- [動画制作基準](docs/動画制作基準.md)：新規制作・修正・画面演出・QA・保存・版管理の統合基準
- [タグと構成プラン](docs/タグと構成プラン.md)：タグの編集と推薦・除外条件
- [HTMLの入口](index.html)：カタログと完成動画へ移動
- [理想・制作方針](理想.md)：映像の印象に合う素材と演出を選ぶ
- [現状と次の進め方](docs/進め方.md)：実装済み範囲、課題、優先順位、合格条件
- [要件定義](MOTION_ATLAS_AI_PROMO_STUDIO_要件定義.md)：システム全体の要件
- [Codex制作指示](MOTION_ATLAS_AI_PROMO_STUDIO_Codex初回指示.md)：作業別に読む資料を絞る入口
- [制作本体](promo-studio/README.md)：編集・撮影・書き出しコマンド
- [整理記録](docs/整理記録.md)：統合・削除・保存方針と復元方法

## ファイルの役割

| 場所 | 役割 |
|---|---|
| `MOTION_ATLAS_60_AEE99382E38383%88/MOTION_ATLAS_60/` | 60種類のCanvas見本、motions.json、依頼文、画像。参照原本として保持 |
| `MOTION_ATLAS_60_AEE99382E38383%88.zip` | 参照原本の配布ZIP。展開先68ファイルとの一致を確認済み |
| `promo-studio/src/` | Remotion映像、実装済みモーション、制作側の登録情報 |
| `promo-studio/public/` | 撮影画像・生成音源。再編集に必要 |
| `promo-studio/jobs/` | 案件ごとの構成、証跡、検査結果、MP4・HTML・共有ZIP |
| `動画ライブラリ/` | 確認・共有用の完成動画とHTMLを集約。作品名付き、1作品1フォルダ |
| `制作プラン/` | 印象別の構成候補を比較するローカルHTML。新しい完成動画とは区別 |
| `docs/` | 計画、整理記録、HTML検査証跡、編集前の復元ZIP |

カタログの見本とRemotion実装は別です。登録情報で `demo-only` / `implemented` / `verified` を区別します。新しい独自トランジションは `TR-*` で管理し、既存の `M-001`〜`M-060` を流用しません。

同じ内容のプロンプト集・画像をルートへコピーせず、参照原本へリンクしてください。完成MP4と共有用HTML内のMP4は用途上必要な複製として保持します。作業上の承認範囲は [AGENTS.md](AGENTS.md) を参照。
