import React from 'react';

import { formatEther } from 'viem';

interface TruncatedAmountProps {
  amount: bigint;
}

/**
 * ETH 額を表示用に整形する (2026-07-23 更新)。
 *
 * 旧実装 = `toFixed(2)` 固定で 0.0012 が「Ξ 0.00」 に潰れ、 min bid が 0.001 等の
 * 小さい値 (Base Sepolia の低 reservePrice) の時に入札履歴 / 現在値が全部 0 に見える問題。
 *
 * 新実装:
 *   ethNum === 0        → "0.00"       (未入札の空 auction)
 *   ethNum >= 0.01      → toFixed(2)  ("1.05", "0.05", "100.00" 等の通常経路)
 *   0 < ethNum < 0.01   → 有効数字 2 桁確保、 trailing zero は除去 ("0.001", "0.0012", "0.00012")
 *
 * 具体例:
 *   1.05     → "Ξ 1.05"
 *   1.2345   → "Ξ 1.23"      (2 桁 truncate、 通常経路)
 *   0.05     → "Ξ 0.05"
 *   0.001    → "Ξ 0.001"     (旧 "Ξ 0.00" が 0 と誤読される問題を解消)
 *   0.0012   → "Ξ 0.0012"
 *   0.00012  → "Ξ 0.00012"
 *   100      → "Ξ 100.00"
 *
 * 有効数字 2 桁の理由 = min bid 表示 (BidModal `minBidEth` 有効数字 3 桁切上) と
 * 揃えつつ、 「切り上げ」 ではなく実額の非零末端桁までを維持する (user を騙さない)。
 */
const TruncatedAmount: React.FC<TruncatedAmountProps> = ({ amount }) => {
  const eth = formatEther(BigInt(amount.toString()));
  const ethNum = parseFloat(eth);
  let formatted: string;
  if (ethNum === 0) {
    formatted = '0.00';
  } else if (ethNum >= 0.01) {
    formatted = ethNum.toFixed(2);
  } else {
    // ethNum < 0.01 の時、 最初の非零桁 + 1 桁分の有効数字を確保。
    // magnitude = 小数点以下の「最初の非零桁の位置」、 0.001 なら 3、 0.0001 なら 4。
    const magnitude = -Math.floor(Math.log10(ethNum));
    const withDecimals = ethNum.toFixed(magnitude + 1);
    // trailing zero を除去 ("0.0010" → "0.001")、 但し「0.001」 のように必要桁は残る。
    formatted = parseFloat(withDecimals).toString();
  }
  return <>Ξ {formatted}</>;
};
export default TruncatedAmount;
