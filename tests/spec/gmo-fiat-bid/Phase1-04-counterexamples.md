# Phase 1 Counterexamples — 動かないはず / 対象外の反例

## 反例の役割

「将来こう拡張するから」 と先回り抽象化しないための制約装置。 反例に明記したシナリオは Phase 1 で対応せず、 実装中に「ついで対応」 したくなった時に本 doc を参照して踏みとどまる。

## 反例 1 — bid 増額 (同 fiat bidder が同 auction に上乗せ bid)

### シナリオ

fiat bidder A が JPY 1.5 万円で bid → 別 bidder B が JPY 2.0 万円で bid → A が JPY 2.5 万円で再 bid したくなる。

### Phase 1 の期待挙動

- FiatBidModal は「既存 bid あり」 判定 (Ponder DB で auth ID が active 状態) を検知
- modal に「本 auction には既に bid 済みです。 増額対応は Phase 2 で提供予定です」 表示
- 再 bid button は disable、 cancel button のみ有効
- user は cancel or auction 終了待ちのいずれか

### Phase 2 で対応する内容 (先送り)

- grilling P3-b A 案 (5 phase sequential + 非同期 cleanup) の実装
- 旧 auth の非同期 cancel queue
- 新 spot rate での再 authorization (2% 許容幅 check 含む)

### 実装中の踏みとどまり

「せっかくだから増額対応 endpoint 用意しておこう」 は Phase 2 scope、 Phase 1 の endpoint (`POST /api/v1/fiat-bid/authorize`) は「新規 bid のみ受付、 同一 bidder の既存 auth ID がある場合 4xx 返却」 に厳格に絞る。

## 反例 2 — wallet 未接続 fiat bidder (custody 経路)

### シナリオ

crypto 未経験の user が webapp を訪問、 wallet も持たず「クレカだけで買いたい」 と要望。

### Phase 1 の期待挙動

- 「クレカで bid (JPY)」 button は wallet 未接続時 disable
- tooltip 表示「wallet 接続が必要です。 MetaMask 拡張をインストール後、 接続してください」
- MetaMask 公式 install page への外部 link 表示 (tutorial は Phase 1 で内蔵しない)

### 対応しない理由 (grilling P7 A' 案確定)

- 運営 custody 経路 (運営 EOA が NFT を保管 + 後日 user 作成 wallet に withdraw) は資金決済法「暗号資産のカストディ業務」 該当リスク
- 該当と判定されると暗号資産交換業 license (財務局登録 + 供託金 + 分別管理義務) 必要になる恐れ、 弁護士確認必須の重量経路
- 運営 wallet 秘密鍵漏洩リスク (全落札 NFT 一気消失) + hardware wallet + multisig 運用コスト大

### 実装中の踏みとどまり

「wallet ない user が可哀想だから運営で NFT 一時保管する経路作ろう」 は絶対に実装しない、 該当 code (運営 EOA が NFT を長期保有する logic) を書きそうになったら本反例を参照して user に停止依頼。

## 反例 3 — chargeback 発生時の on-chain 巻き戻し

### シナリオ

fiat bidder が落札 + NFT 受取後、 card 会社に「詐欺だ」 と dispute → GMO 経由で運営に chargeback 通知 → 運営が JPY 返金する必要が生じる。

### Phase 1 の期待挙動

- GMO mock server では chargeback event は emit しない (mock 実装対象外)
- 実際の chargeback は Phase 3 本番切替時に発生し得る
- Phase 1 では docs/operations/gmo-fiat-bid.md に「chargeback 発生時は運営が JPY 返金 + NFT 剥奪不可 = 運営全損吸収」 policy を doc 化するのみ

### 対応しない理由 (grilling P6 A 案確定)

- on-chain SSOT (auction contract settle が絶対) を維持、 chargeback 発生後の NFT 剥奪は on-chain 状態巻き戻しになり contract 側 revert logic 実装が過剰
- 事前 defense (与信枠 pre-flight + 3DS 強制 + bid 上限 100 万円) で発生率を抑制する方針
- 発生時は運営全損吸収で「後から NFT を取り返す」 経路は用意しない

### 実装中の踏みとどまり

「chargeback 対策で NFT freeze mechanism 実装しよう」 「運営 EOA が transferFrom で NFT を取り戻す emergency function 用意しよう」 は Phase 1 scope 外、 契約完全無改修 stance 崩れる。

## 反例 4 — auction 45 日超 (soft close 連続発火)

### シナリオ

anti-sniping の soft close (endTime - timeBuffer 内 bid で endTime を now + timeBuffer に延長) が異常な頻度で発火し、 auction 期間が 45 日超えた場合。

### Phase 1 の期待挙動

- 24h auction default 前提で e2e 検証
- 45 日超シナリオは Phase 1 では未検証、 Phase 2 で monitoring hook + GMO 再 authorization API 発火 fallback 実装

### 対応しない理由 (grilling P3-a A 案確定)

- 24h auction + soft close 24h cap で理論上限でも数日、 45 日到達は極めてレア
- Nouns 生態系の実運用でも 45 日超 auction は観測されておらず、 YAGNI (You Aren't Gonna Need It)

### 実装中の踏みとどまり

「45 日超対策として backend cron 実装しよう」 は Phase 2 scope、 Phase 1 では monitoring hook (ログ出力のみ) に留める。

## 反例 5 — Base Mainnet 環境での動作保証

### シナリオ

Phase 1 実装完了後、 user が「Mainnet で動かしたい」 と要望。

### Phase 1 の期待挙動

- Base Mainnet contract address / RPC endpoint / subgraph endpoint への切替は env 変更 + 追加検証で対応
- Phase 1 では Sepolia 前提の env / test を hardcode してよい、 Mainnet 対応は Phase 3

### 対応しない理由

- GMO 本番環境切替 (3DS 本番認証 / PCI DSS 監査対応) が Mainnet 稼働の prerequisite で、 Phase 1 完了時点では mock server 前提
- Phase 3 (Mainnet + GMO 本番切替) を独立 phase として分離し、 検証範囲を明確化

### 実装中の踏みとどまり

「Phase 1 のうちに Mainnet でも動くようにしておこう」 は環境 abstraction layer の overengineering 経路、 Phase 3 で必要になった時点で最小実装する。

## 反例 6 — Stripe 等の別 provider abstraction layer

### シナリオ

「将来 GMO 以外の provider も使うかもしれないから provider abstraction layer 作ろう」 という設計提案。

### Phase 1 の期待挙動

- GMO SDK 直呼出、 abstraction layer なし
- provider 切替 use case は Phase 4 (GMO revoke 時のみ) で発生時に refactor

### 対応しない理由 (rules/quality.md § Simplicity First)

- YAGNI、 実際に 2 provider 並存する use case は現時点ゼロ
- abstraction layer は provider 差異を吸収する複雑度大、 Phase 1 の 8 Issue に加えると scope 爆発

### 実装中の踏みとどまり

「payment provider の interface 定義しておこう」 は Phase 1 では実装しない、 GMO 直呼出で完結。
