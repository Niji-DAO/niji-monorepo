# Phase 2 Counterexamples — 動かないはず / 対象外の反例

## 反例の役割

「将来こう拡張するから」 と先回り抽象化しないための制約装置。 反例に明記したシナリオは Phase 2 で対応せず、 実装中に「ついで対応」 したくなった時に本 doc を参照して踏みとどまる。

## 反例 1 — 3+ 回目 bid の別 flow 実装

### シナリオ

fiat bidder が同 auction 内で 3 回、 4 回、 と bid 増額を繰り返す想定。

### Phase 2 の期待挙動

- 5 phase sequential は N 回反復可能な設計、 追加 logic 不要
- 各回で AuthCleanupQueue に旧 auth を enqueue、 queue が rate limit + retry で順次 alterTran VOID を実行
- 3+ 回目でも 2 回目と同じ topup endpoint を再呼出、 特別 branch なし

### 対応しない理由

「3 回目は別 endpoint」 のような特別 case 分岐は複雑度を増やすだけで意味なし、 sequential は N 回反復で完結する設計。

## 反例 2 — 45 日超 fallback で新 authorization が繰り返し失敗

### シナリオ

45 日経過で再 authorization API 発火、 GMO 側で card 期限切れ等の理由で毎回失敗、 cron が 1h ごと発火し続けて log 洪水。

### Phase 2 の期待挙動

- 1 回目 fail = fiat_bid.status = cancelled + 運営 alert log + user 通知 email
- status = cancelled 移行後は cron 検出対象外 (pending / 3ds-verified / bid-placed のみ対象)
- 2 回目以降の cron 発火はなし

### 対応しない理由

「retry を N 回 attempt してから cancel」 は Phase 4 の retry queue 自動化 scope、 Phase 2 は 1 回 fail で cancel 確定の simple 設計。

## 反例 3 — 増額 bid の atomicity 保証 (transaction 全体を rollback 可能に)

### シナリオ

5 phase 途中で fail した場合に 5 phase 全体を rollback したい要望。

### Phase 2 の期待挙動

- rollback は phase 別に個別実装 (grilling P3-b A 案の SSOT)
- Phase 3 fail (chain tx revert) → 新 auth cancel + fiat_bid.status = cancelled + 旧 auth 保持
- Phase 4 fail (tx confirm 監視) → chain tx 状態を尊重、 rollback せず monitoring alert
- Phase 5 fail (cleanup queue) → retry 3 回 + fail 通知、 旧 auth は残す (orphan 検出は Phase 4)

### 対応しない理由

atomic rollback は on-chain 状態と off-chain 状態の 2 者を同時制御する必要があり、 grilling P6 A 案 (on-chain SSOT) と矛盾。 phase 別 rollback で運営 recovery 可能な状態を保つ。

## 反例 4 — subgraph 側の fiat 落札可視化

### シナリオ

Phase 2 で subgraph に fiat 落札 event を別 track で記録、 dashboard で ETH bid vs fiat bid を区別表示。

### Phase 2 の期待挙動

- subgraph は完全無改修 (grilling 判断)、 fiat 落札は ETH bid として記録
- fiat / crypto の区別は backend DB (Ponder fiat_bid table) のみ、 observability は担保

### 対応しない理由 (grilling 判断)

- Phase 3 の Base Mainnet 切替 (subgraph endpoint 変更) と同時実施が spec upgrade の切替コスト削減
- Phase 2 の主目的 (bid 増額 + 45 日超 fallback) に subgraph 変更は不要

## 反例 5 — Base Mainnet 環境での動作保証

### シナリオ

Phase 2 実装完了後、 user が「Mainnet で動かしたい」 と要望。

### Phase 2 の期待挙動

- Base Mainnet contract address / RPC endpoint / subgraph endpoint は Phase 3 で env 変更
- Phase 2 は Sepolia 前提の env / test を hardcode 継続 (Phase 1 と同じ)

### 対応しない理由

Phase 3 (Mainnet + GMO 本番切替) を独立 phase として分離、 検証範囲を明確化 (Phase 1 の反例 5 と同じ理由)。

## 反例 6 — 増額 bid の gas 料金を user に負担させる option

### シナリオ

「増額 bid の gas は運営でなく user が負担できる option」 の追加要望。

### Phase 2 の期待挙動

- Phase 1 と同じ、 全 fiat bidder の gas は運営負担 (grilling P3-c 確定)
- user gas 負担 option は fiat bid の意義 (「wallet あるけど gas 払いたくない」) と矛盾

### 対応しない理由

fiat bid の primary use case が「gas を気にせず JPY で支払う」 なので、 user gas 負担 option は self-contradictory。
