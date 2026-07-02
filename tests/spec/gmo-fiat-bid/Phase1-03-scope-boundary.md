# Phase 1 Scope Boundary — 明示的 in / out

## in (本 Phase で対応)

| 観点 | 内容 | 対応 Issue |
|---|---|---|
| GMO SDK 導入 | webapp + api 両 package に @gmo/pg-sdk (or 同等) + mock server (MSW/Prism) 導入、 env 変数整備 | Issue 1 |
| spot rate fetcher | GMO コイン API primary + CoinGecko fallback + 5 秒 cache + 2% 許容幅 check | Issue 2 |
| 与信枠 authorize | GMO entryTran + execTran 呼出、 bid 上限 100 万円 check、 auth ID 保存 | Issue 3 |
| 3DS 2.0 認証 | full redirect (popup 回避 + mobile safari 対応)、 callback で auth 確定 or cancel | Issue 4 |
| 運営 EOA 代理 bid tx | viem で Base Sepolia createBid tx sign + broadcast、 tx receipt watch | Issue 5 |
| bid modal UI | 「クレカで bid (JPY)」 button + JPY 入力 + spot rate 表示 + Terms checkbox + 4 段 stepper | Issue 6 |
| 落札後 flow | webapp modal + 3DS 追加認証 + GMO capture + 運営 EOA から user wallet に transferFrom | Issue 7 |
| Terms + 特商法 | webapp footer link + `/legal/tokushoho` static page (8 項目全記載) | Issue 8 |
| 落札通知 email | SendGrid or SES で fiat winner に email 通知 | Issue 8 |
| e2e test | Playwright + Base Sepolia + GMO mock で golden path 1 spec | Issue 8 |
| operations runbook | 運営 EOA 鍵管理 / GMO 契約情報 / 異常系対応 (capture fail / transfer fail) 手順 | Issue 8 |

## out (本 Phase で対応しない)

| 観点 | 内容 | 委譲先 Phase | 理由 |
|---|---|---|---|
| bid 増額 (再 authorization) | 同 fiat bidder が同 auction に上乗せ bid する 5 phase sequential (P3-b A 案) | Phase 2 | Phase 1 は fiat bid 1 発 e2e 検証専念、 増額 flow は複雑度大 (GMO 与信枠 cancel + 新 auth + 旧 auth cleanup queue) |
| 45 日超 auction fallback | soft close 連続発火で auction 期間 45 日超えた時の GMO 再 authorization API 発火 monitoring | Phase 2 | 24h auction default では発生確率極低、 monitoring hook のみ Phase 1 (実発火は Phase 2) |
| Base Mainnet 切替 | env 変更 + contract address 更新 + subgraph endpoint 更新 + RPC 変更 | Phase 3 | Sepolia で e2e 検証確定後の本番化 |
| GMO 本番環境切替 | 加盟店本番契約 + 3DS 本番認証 + PCI DSS 監査対応 + mock server 廃止 | Phase 3 | GMO 側 再連絡 + デモ環境再取得 + 本番契約 が Phase 3 prerequisite |
| retry queue 自動化 | transfer fail 時の 1h ごと自動 retry 3 回 + 運営 alert 自動化 | Phase 4 | Phase 1 は手動 retry で許容 (runbook 記載)、 自動化は運用実績積んだ後 |
| 監視 dashboard | fiat bid 成功率 / capture fail 率 / transfer fail 率 / chargeback 発生率の可視化 | Phase 4 | 本番運用開始後の必要機能、 MVP 検証段階では不要 |
| 運営 alert 自動化 | Slack / email / PagerDuty 経由の異常系 alert 通知 | Phase 4 | 本番稼働後の運用機能 |
| Stripe fallback provider | GMO revoke 時の Stripe 経路切替、 provider abstraction layer | Phase 4 (or GMO revoke 時のみ) | GMO 事前調整済で Phase 1-3 では不要、 revoke 発生時のみ緊急対応 |
| bidder 側独自 KYC | 身分証提出 / 住所確認 / 銀行口座証跡 | 対応しない (Terms 宣誓 + 3DS 2.0 で代替) | rules/quality.md § Simplicity First、 落札率悪化 30-50% リスクは fiat 導入意義を毀損 |
| custody model (wallet 不要 bidder) | 運営 EOA が NFT 保管 + 後日 user 作成 wallet に withdraw | 対応しない (wallet 接続必須 stance) | 資金決済法「暗号資産のカストディ業務」 該当リスクで弁護士確認必須、 grilling で採用しない確定 |
| 委託販売モデル | 運営が全 NFT 先行 mint + auction は落札者選定のみ | 対応しない | DAO 主権を根本から弱める、 Nouns fork identity と矛盾 |
| DAO governance 補填 | chargeback / capture fail を DAO 提案経由で treasury 補填 | 対応しない (運営全損吸収) | governance overhead (2 週間決議) が chargeback 頻度に見合わない |
| Chainlink oracle 経由 spot rate | 分散 oracle + on-chain rate 参照 | 対応しない (GMO コイン API primary) | GMO group 内統一で税務 / audit simple、 Chainlink heartbeat 3600s は fiat bidder の秒単位感覚に不整合 |

## 境界判定基準

「in / out どちらか判断が難しい」 と感じた変更が発生した場合の判定基準。

- Phase 1 の deliverable (fiat bid 1 発 → capture → transferFrom の e2e) に必須か? → Yes なら in、 No なら out
- 変更を追加すると Issue 1 つの推定行数 300 行超えるか? → 超えるなら Phase 2 に外出し
- 変更が「AI slop」 (不要 try-catch / 過剰抽象 / dead code) 経路の下地になるか? → なるなら削除

## 実装中の scope creep 予防

- 新機能追加提案は必ず本 file に「Phase X 委譲」 として記録、 in 側追加は user 承認必須
- refactor は Phase 1 実装対象 file のみ、 既存 file の「ついで整理」 禁止
- 依存 package upgrade は Phase 1 影響範囲確認後に別 Issue (「chore/upgrade-X」) で分離
