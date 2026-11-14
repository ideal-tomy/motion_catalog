# トーナメント機能実査

## 対象と調査方法

- 対象リポジトリ：`C:/Users/ryoji/00myapp/ai_demo_workspace/tournament-latest-review-20261024`
- 目的：大会受付からペア発表、試合、勝ち上がり、優勝表示までの機能を動画向けに整理する。
- 調査：対象ソースと同梱の運用・検証記録を読み、`src/preview/PreviewApp.tsx` の演出専用プレビューをローカルで再生・撮影した。通常受付・本番運営・DBへのログインや書き込みは行っていない。
- ブラウザ証跡：[browser-audit.json](browser-audit.json)、[Draw](draw.png)、[Bracket advance](bracket.png)、[VS](vs.png)、[Champion](champion.png)。5場面でJavaScriptエラー、非GET通信、外部リクエストは0件。

## 機能と根拠

| 見せる価値 | 確認できた機能 | 根拠と確度 | 動画での扱い |
|---|---|---|---|
| 受付を一つの運営フローにつなぐ | スマートフォンから参加者の名前・写真を登録し、ratingは任意入力。参加者情報は運営・Display側へ連携する設計と検証記録がある。 | ソース `src/checkin/CheckinPage.tsx`、`src/checkin/EntryTeams.tsx`、`docs/CHECKIN_LIFECYCLE.md`。記録上の公開検証済み。今回のブラウザ再操作は未実施。 | 実データは撮影せず、氏名や写真を含まない図解と短いコピーで説明する。実UIとして見せる場合は隔離したサンプル環境で再撮影する。 |
| ペアを決めて大会へつなぐ | 参加者2人を選んでチーム登録。チーム名設定・編集や、受付終了後の確定状態がある。 | `src/checkin/EntryTeams.tsx`、`src/checkin/DrawControl.tsx`、`docs/PAIR_ANNOUNCEMENT_FLOW.md`、`docs/DRAW_D1_REHEARSAL.md`。コードと記録で確認。 | 選択→ペア確定→発表を画面要素に分けて見せる。固定サンプル表示は実大会の組合せと誤認させない。 |
| 試合を会場スクリーンで見せる | Draw、VS、WINNER、Bracket、Championなどの演出用プレビューがある。 | `docs/ANIMATION_PREVIEW.md` と今回のローカル画面確認。**プレビューはfixture専用**であり、本番Displayとの完全一致や実大会データ連携を意味しない。 | 撮影したプレビューは「SAMPLE PREVIEW」を明示し、演出サンプルとして使用する。 |
| 勝敗を次の試合へつなぐ | 運営が試合開始・勝者確定を操作し、保存結果に応じてBracketを更新、次試合へ進むフローが実装・検証記録にある。 | `src/checkin/DrawControl.tsx`、`src/checkin/AnimatedBracketAdvance.tsx`、`src/checkin/FlowPresentation.tsx`、`docs/MATCH_PROGRESS_LOOP.md`、`docs/TOURNAMENT_FLOW.md`。 | 勝者確定の運営操作と、該当する勝ち上がりラインを別カットにし、操作と結果の因果を見せる。自動で試合結果が決まるとは表現しない。 |
| 優勝の瞬間を締めくくる | Champion表示・セレモニーの描画と演出がある。 | `src/checkin/FlowPresentation.tsx`、`src/features/presentation/ceremony/ChampionBoard.tsx`、`docs/ANIMATION_PREVIEW.md`。演出プレビューはサンプル表示。 | Champion画面はサンプル演出と明記。実際の大会結果・参加者名・写真には見せない。 |

## 確認済みの限界・未確認

- 演出プレビュー内のDraw/Championは固定fixture、顔画像はプレースホルダー。Result/Bracket/VS/NEXT MATCHも本番の保存データと切り離された演出プレビューである。
- 今回、安全のため受付API・運営API・公開DBへの書き込み操作を行っていない。受付UIの実画面・画面遷移は新規撮影していない。
- 公開検証の過去記録は対象リポジトリ内の文書で追跡できるが、今回あらためて公開環境の稼働・当日データ・認証を確認していない。
- 本動画の機能説明はコードと検証記録に支えられた範囲に限定する。参加人数、処理時間、勝率、導入効果などの数値や実績は出さない。

## 制作上の判断

「参加登録 → チーム確定 → 抽選・発表 → 試合進行 → 勝ち上がり → Champion」を一本の物語として見せる。受付画面を撮れない状態では、架空の実画面を捏造せず、受付・ペア登録は文字と図解で見せ、演出プレビューだけをサンプル表示付きで使用する。最終制作時に隔離サンプルUIを安全に撮影できた場合は、図解の一部を実画面へ置き換える。
