# Phase 2 Scope Boundary — 明示的 in / out

## in (本 Phase で対応)

| 観点 | 内容 | 対応 Issue |
|---|---|---|
| Ponder schema 拡張 | fiat_bid table に reauthorizationCount / lastReauthorizedAt 追加 | Issue P2-1 |
| async cleanup queue | 5 秒 delay + 1 req/sec + 3 retry で旧 auth alterTran VOID | Issue P2-1 |
| topup endpoint | POST /api/v1/fiat-bid/topup で増額 bid pre-flight + BidRelay 再利用 | Issue P2-2 |
| 45 日超 cron worker | 1h 周期で fiat_bid.createdAt から 45 日超検出 + 再 authorization | Issue P2-3 |
| 増額 bid UI | FiatBidModal に「増額 bid」 branch + 5 phase stepper + validation | Issue P2-4 |
| Playwright e2e | fiat-bid-topup.spec.ts golden path 1 spec | Issue P2-5 |
| operations runbook 追記 | bid 増額 flow + 45 日超対応手順 | Issue P2-5 |

## out (本 Phase で対応しない)

| 観点 | 内容 | 委譲先 Phase | 理由 |
|---|---|---|---|
| subgraph fiat 別 track | fiat 落札 event を subgraph で別 entity 管理 | Phase 3 | Base Mainnet 切替 (Phase 3) と同時実施が spec upgrade の切替コスト削減、 backend DB fiat_bid table で observability 担保済 |
| Base Mainnet 切替 | env + contract address + RPC 変更 | Phase 3 | Sepolia + GMO mock で Phase 2 検証確定後の本番化 |
| GMO 本番切替 | 加盟店本番契約 + 3DS 本番認証 + PCI DSS 監査 | Phase 3 | GMO デモ環境再取得 + 本番契約 が Phase 3 prerequisite |
| retry queue 自動化 | transfer fail / capture fail の 1h ごと自動 retry | Phase 4 | Phase 2 は手動 retry で許容 (Phase 1 と同じ)、 自動化は本番運用実績後 |
| 監視 dashboard | fiat bid 成功率 / capture fail 率 / 増額 bid 頻度の可視化 | Phase 4 | 本番稼働後の必要機能 |
| 運営 alert 自動化 | Slack / email / PagerDuty 経由の異常系通知 | Phase 4 | 本番稼働後の運用機能 |
| Stripe fallback | GMO revoke 時の Stripe 経路切替 | Phase 4 | GMO 事前調整済で Phase 2-3 では不要 |
| bidder 独自 KYC | 身分証提出 / 住所確認 | 対応しない | Phase 1 と同じ、 Terms 宣誓 + 3DS 2.0 で代替 |
| custody model | wallet 不要 bidder の運営 EOA 保管 | 対応しない | 資金決済法カストディ業務該当リスク (Phase 1 の反例 2 と同じ) |
| N 回目 bid の complex logic | 3+ 回目 bid の別 flow | 対応しない | 5 phase sequential が N 回反復可能な設計、 追加 logic 不要 |

## 境界判定基準

「in / out どちらか判断が難しい」 と感じた変更が発生した場合の判定基準。

- Phase 2 の deliverable (bid 増額 + 45 日超 fallback の e2e) に必須か? → Yes なら in、 No なら out
- 変更を追加すると Issue 1 つの推定行数 350 行超えるか? → 超えるなら Phase 3 に外出し
- 変更が「AI slop」 (不要 try-catch / 過剰抽象 / dead code) 経路の下地になるか? → なるなら削除

## 実装中の scope creep 予防

- 新機能追加提案は必ず本 file に「Phase X 委譲」 として記録、 in 側追加は user 承認必須
- refactor は Phase 2 実装対象 file のみ、 既存 Phase 1 file の「ついで整理」 禁止
- subgraph 改修は Phase 3 まで一切禁止 (grilling 判断済)
