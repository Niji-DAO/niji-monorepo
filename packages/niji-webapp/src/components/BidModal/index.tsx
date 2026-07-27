/**
 * BidModal — 単一 bid button click で開く modal、 内部で Tabs (ETH / クレカ JPY) 切替 (Issue #3033)
 *
 * 役割 —
 * (1) 従来の auction ページの 2 button (ETH bid + 「クレカで bid (JPY)」) を単一「bid」 button に統合
 * (2) modal を open、 modal 上部に Tabs で「ETH で bid」 / 「クレカで払う (JPY)」 切替表示
 * (3) ETH tab = ETH 額入力 + 既存 useWriteNijiAuctionHouseCreateBid で ETH bid 発火
 * (4) クレカ tab = 既存 FiatBidForm を Tab content として組込 (form / stepper / Terms checkbox 継承)
 * (5) Tab 切替時の state は Tab 単位で独立 (fiat 途中で ETH tab に切替えるとデータ消失、
 *     user 選択の結果として許容、 confirm modal は overkill、 Issue #3033 リスク section 参照)
 *
 * wallet 未接続時は本 modal は open されない (親 Bid 側で button 全体を disable + tooltip、
 * Issue #3033 P7 stance 維持)。
 *
 * Issue #3039 以降 — site design (cool/warm palette + PT Root UI + border-radius 8/12) に統合。
 * BidModal.module.css で shadcn/ui default class を override、 data-palette=cool|warm で 2 色系切替。
 *
 * SSOT — GH Issue #3033、 GH Issue #3039、 Linear CAR-324。
 */

import type { Auction } from '@/wrappers/nijiAuction';

import * as React from 'react';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
import {
  useReadNijiAuctionHouseMinBidIncrementPercentage,
  useReadNijiAuctionHouseReservePrice,
  useWriteNijiAuctionHouseCreateBid,
} from '@niji/sdk/react';
import { CheckCircle2Icon } from 'lucide-react';
import { Spinner } from 'react-bootstrap';
import { toast } from 'sonner';
import { formatEther, parseEther } from 'viem';
import { useWaitForTransactionReceipt } from 'wagmi';

import FiatBidForm from '@/components/FiatBidModal/FiatBidForm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { defaultChain } from '@/wagmi';

import classes from './BidModal.module.css';

/**
 * 次の最低入札額を求める。 Niji (Nouns 由来) の auction 仕様に合わせる。
 * - まだ誰も入札していない (currentBid=0) 新 auction は reservePrice が下限
 * - 入札済みなら「現額 × (1 + minBidInc%)」、 ただし reservePrice を下回らない
 * minBidIncPercentage が読めない場合も reservePrice を下限に fallback する。
 */
const computeMinimumNextBid = (
  currentBid: bigint,
  minBidIncPercentage: bigint | undefined,
  reservePrice: bigint | undefined,
): bigint => {
  const floor = reservePrice ?? 0n;
  if (currentBid === 0n || minBidIncPercentage === undefined) {
    return floor;
  }
  const next = (currentBid * (minBidIncPercentage + 100n)) / 100n;
  return next < floor ? floor : next;
};

/**
 * 表示用 min bid を「reservePrice の整数倍」 で切り上げる (2026-07-23、 user 提案)。
 *
 * 旧実装 = 有効数字 3 桁切り上げ、 例 currentBid=0.000105 → minBid=0.00011 → 「0.000111 以上」 の
 * 6 桁表示になり細かすぎて読めない。 かつ contract 側は 5% up (minBidIncPercentage) 判定のため
 * 端数が発生 (0.00011025 wei 相当) して user は「なぜ半端な桁？」 と困惑した。
 *
 * 新仕様 = reservePrice の整数倍で切り上げ、 例 reservePrice=0.0001 なら:
 *   currentBid=0        → 0.0001 (reservePrice そのもの)
 *   currentBid=0.0001   → 0.0002 (2 × reservePrice)
 *   currentBid=0.00015  → 0.0002 (0.00015 × 1.05 = 0.0001575 → ceil / reservePrice = 2)
 *   currentBid=0.0003   → 0.0004
 *
 * chain 側 validation `msg.value >= amount + amount*minInc%/100` は 0.0002 で必ず通る
 * (0.0002 >= 0.0001 * 1.05 = 0.000105)、 UX の桁数と chain 契約の整合を両立する。
 *
 * reservePrice が undefined の間 (contract 読み込み前) は旧経路 (有効数字 3 桁切り上げ) に fallback。
 */
const minBidEth = (minBid: bigint, reservePrice: bigint | undefined): string => {
  if (minBid === 0n) {
    return reservePrice !== undefined && reservePrice > 0n ? formatEther(reservePrice) : '0';
  }
  if (reservePrice !== undefined && reservePrice > 0n) {
    // bigint ceil (a + b - 1) / b で reservePrice の整数倍に切り上げ。
    const roundedUp = ((minBid + reservePrice - 1n) / reservePrice) * reservePrice;
    return formatEther(roundedUp);
  }
  // fallback = reservePrice 未取得時の旧経路 (有効数字 3 桁切り上げ)。
  const ethNum = parseFloat(formatEther(minBid));
  const exponent = Math.ceil(Math.log10(ethNum));
  const decimals = Math.max(0, 3 - exponent);
  const factor = 10 ** decimals;
  return String(Math.ceil(ethNum * factor) / factor);
};

/**
 * ETH input で許可する小数点以下の桁数 (2026-07-23 追加、 min bid 桁数に動的追随)。
 *
 * 旧実装は `input.split('.')[1].length > 2` で 2 桁固定制限、 Base Sepolia の低 reservePrice
 * (0.001 等) 環境で 3 桁目以降が打てず「0.00」 で止まる問題があった。 min bid の桁数に合わせて
 * 動的に切替える (TruncatedAmount の有効数字ベース表示と同じ考え方)。
 *
 *   min bid 未取得 (undefined / 0)   → 6 (低 reservePrice の安全側、 wei 直下まで許可)
 *   min bid >= 0.01                  → 2 (通常経路、 旧実装と互換)
 *   min bid < 0.01                   → 「最初の非零桁 + 1」 = 有効数字 2 桁を確保
 *                                      (0.001 → 4、 0.0001 → 5、 0.00012 → 5)
 */
const maxDecimalsForMinBid = (minBid: bigint | undefined): number => {
  if (minBid === undefined || minBid === 0n) return 6;
  const ethNum = parseFloat(formatEther(minBid));
  if (ethNum >= 0.01) return 2;
  const magnitude = -Math.floor(Math.log10(ethNum));
  return magnitude + 1;
};

/**
 * BidModal palette 種別 (Issue #3039、 Issue #3037 の auction cool/warm 判定を継承)
 * cool = grey background (デフォルト)、 warm = beige background。
 * 親 (Bid.tsx) が jotai atom `isCoolBackgroundAtom` から判定して渡す。
 */
export type BidModalPalette = 'cool' | 'warm';

export type BidModalProps = {
  /** modal open state (親から制御) */
  open: boolean;
  /** modal close callback */
  onClose: () => void;
  /** auction (bid 対象) */
  auction: Auction;
  /** bidder wallet address (親から wagmi useAccount 経由で渡す、 空文字は wallet 未接続) */
  bidderWallet: string;
  /** palette 種別 (Issue #3039、 default = "cool" で後方互換) */
  palette?: BidModalPalette;
  /**
   * test 用 injectable (fiat 側) — useFiatBid の fetchers 差替経路
   * 型は FiatBidForm props と一致 (import 循環を避けるため any 経路)。
   */
  fiatFetchersOverride?: React.ComponentProps<typeof FiatBidForm>['fetchersOverride'];
  fiatSpotRateOverride?: React.ComponentProps<typeof FiatBidForm>['spotRateOverride'];
  /** default tab (test 用、 default = "eth") */
  defaultTab?: 'eth' | 'fiat';
};

/**
 * BidModal component
 *
 * 単一 bid button click で open、 内部で ETH tab / クレカ tab を切替。
 * ETH tab 提出 → useWriteNijiAuctionHouseCreateBid、
 * クレカ tab 提出 → FiatBidForm 経由 useFiatBid.authorize。
 */
export const BidModal = ({
  open,
  onClose,
  auction,
  bidderWallet,
  palette = 'cool',
  fiatFetchersOverride,
  fiatSpotRateOverride,
  defaultTab = 'eth',
}: BidModalProps): React.JSX.Element => {
  const { t } = useLingui();
  const [ethInput, setEthInput] = useState<string>('');
  const ethInputRef = useRef<HTMLInputElement>(null);

  const { data: minBidIncPercentage } = useReadNijiAuctionHouseMinBidIncrementPercentage();
  const { data: reservePrice } = useReadNijiAuctionHouseReservePrice();
  /**
   * `minBidReserve` = reservePrice を BigInt 化した値、 minBidEth に「切り上げ単位」 として渡す。
   * computeMinimumNextBid の 3 番目引数と同じ変換を 1 度だけ行い、 minBidEth 5 箇所で共有する。
   */
  const minBidReserve = reservePrice !== undefined ? BigInt(reservePrice.toString()) : undefined;
  const minBid = computeMinimumNextBid(
    auction.amount !== undefined ? BigInt(auction.amount.toString()) : 0n,
    minBidIncPercentage !== undefined ? BigInt(minBidIncPercentage.toString()) : undefined,
    minBidReserve,
  );

  const {
    writeContract: placeBid,
    data: placeBidTxHash,
    isPending: isPlacingBid,
    isError: didPlaceBidFail,
  } = useWriteNijiAuctionHouseCreateBid();

  /**
   * tx broadcast 後の block confirm 待ちを追跡 (2026-07-23、 「反映中が分からない」 UX 問題対応)。
   *
   * wagmi の `isPending` は wallet 署名待ちの間だけ true、 broadcast 直後に false に戻る =
   * chain confirm を待っている 5-15 秒の間 UI が「入札」 button に戻って空白に見え、 user から
   * 「反映されるまで何も変わらず怖い」 と指摘。 useWaitForTransactionReceipt で receipt が
   * 返るまで isConfirming を維持し、 その間 button の spinner + label で「block 反映中」 を伝える。
   */
  const { isLoading: isConfirmingBid, isSuccess: placeBidSucceeded } = useWaitForTransactionReceipt(
    { hash: placeBidTxHash },
  );

  /** wallet 署名待ち + broadcast 済 confirm 待ち 両方を包む in-flight flag */
  const isBidInFlight =
    isPlacingBid || (placeBidTxHash !== undefined && !placeBidSucceeded && !didPlaceBidFail);

  /** button に出す進行 label = 状態別に切替、 spinner と一緒に「今どこか」 を明示 */
  const bidButtonLabel = isPlacingBid
    ? t`ウォレットの承認を待っています`
    : isConfirmingBid
      ? t`ブロックに反映中`
      : t`入札`;

  const ethInputHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    // 小数点以下の許容桁数は min bid に追随 (低 reservePrice 環境で 3 桁目以降が打てない旧問題の解消)。
    // 旧実装 = 2 桁固定、 min bid 0.001 の Base Sepolia 環境で「0.00」 で止まっていた。
    const maxDecimals = maxDecimalsForMinBid(minBid);
    if (input.includes('.') && input.split('.')[1].length > maxDecimals) {
      return;
    }
    setEthInput(input);
  };

  useEffect(() => {
    if (didPlaceBidFail) toast.error(t`Please try again.`);
  }, [didPlaceBidFail, t]);

  // toast 重複発火防止 + modal auto close 経路 (Issue #3086 / #3090 fix)。
  //
  // wagmi の placeBidSucceeded は write 成功後 true を保持し続ける。
  // useRef で「1 bid あたり toast 1 回のみ」 を強制、 placeBidSucceeded false 復帰時に flag reset。
  //
  // deps は [placeBidSucceeded] のみ (msg / onClose 除外) — 親 re-render で onClose が新 reference
  // になった時に useEffect が re-fire し、 cleanup が clearTimeout で auto close timer を消失させる
  // regression bug (user 実測で「modal 閉じない」) を防ぐ。 onClose は latest ref に格納して stale 回避、
  // msg は effect 外で生成することで Lingui macro (build 時 AST 変換) の対象を維持する
  // (tRef.current`...` 経路は MemberExpression で macro 対象外になり empty string 化する)。
  const bidPlacedMsg = t`Bid placed.`;
  const toastFiredRef = useRef(false);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  useEffect(() => {
    if (placeBidSucceeded && !toastFiredRef.current) {
      toastFiredRef.current = true;
      toast.success(bidPlacedMsg);
      setEthInput('');
      // 3 秒間 modal 内 success 表示を維持 → auto close で UX 完結。
      const closeTimer = setTimeout(() => onCloseRef.current(), 3_000);
      return () => clearTimeout(closeTimer);
    }
    if (!placeBidSucceeded) {
      toastFiredRef.current = false;
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeBidSucceeded]);

  const placeEthBidHandler = () => {
    if (!ethInputRef.current || !ethInputRef.current.value) {
      return;
    }
    const parsed = parseEther(ethInputRef.current.value);
    if (parsed < minBid) {
      toast.error(
        t`Please place a bid higher than or equal to the minimum bid amount of ${minBidEth(minBid, minBidReserve)} ETH`,
      );
      setEthInput(minBidEth(minBid, minBidReserve));
      return;
    }
    // chainId 明示で wagmi が wallet の現 chain 不一致を検出、 switchChain prompt を
    // 自動発火する (v2 の standard behavior)。 未指定だと wallet 現 chain (例 mainnet)
    // に tx broadcast されて eth.merkle.io 等の public RPC に POST → CORS block で
    // 送信失敗する root cause を回避。
    placeBid({
      args: [BigInt(auction.nounId)],
      value: parsed,
      chainId: defaultChain.id,
    });
  };

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        data-testid="bid-modal"
        data-palette={palette}
        className={classes.dialogContent}
      >
        <DialogHeader>
          <DialogTitle className={classes.dialogTitle}>
            <Trans>Niji #{auction.nounId.toString()} に bid</Trans>
          </DialogTitle>
          <DialogDescription className={classes.dialogDescription}>
            <Trans>ETH か クレカ (JPY) を選んで bid してください</Trans>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full" data-testid="bid-modal-tabs">
          <TabsList className={`grid w-full grid-cols-2 ${classes.tabsList}`}>
            <TabsTrigger value="eth" data-testid="bid-tab-eth" className={classes.tabsTrigger}>
              <Trans>ETH で bid</Trans>
            </TabsTrigger>
            <TabsTrigger value="fiat" data-testid="bid-tab-fiat" className={classes.tabsTrigger}>
              <Trans>クレカで払う (JPY)</Trans>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="eth" data-testid="bid-tab-content-eth">
            {placeBidSucceeded ? (
              <div
                className={`${classes.successCard} my-2 flex flex-col items-center gap-3 py-8`}
                data-testid="eth-bid-success"
              >
                <CheckCircle2Icon className={classes.successIcon} strokeWidth={1.75} aria-hidden />
                <h3 className={classes.formLabel} style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                  <Trans>入札を送信しました</Trans>
                </h3>
                <p className={classes.minBidCopy} style={{ margin: 0 }}>
                  <Trans>まもなくこのウィンドウを閉じます</Trans>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="eth-bid-amount" className={`mb-1 block ${classes.formLabel}`}>
                    <Trans>bid 額 (ETH)</Trans>
                  </label>
                  {/* step=any — 下限は minBid (contract reservePrice 連動) の validation が保証するため、
                      任意の小額 (reservePrice 0.0001 等) を入力できるようにする。step を固定値にすると
                      設定値と乖離して環境ごとに漏れるため、 下限判定を SSOT (contract) に一本化する。 */}
                  <Input
                    id="eth-bid-amount"
                    type="number"
                    min="0"
                    step="any"
                    onChange={ethInputHandler}
                    ref={ethInputRef}
                    value={ethInput}
                    placeholder={`Ξ ${minBidEth(minBid, minBidReserve)}`}
                    data-testid="eth-bid-input"
                    className={classes.bidInput}
                  />
                  <p className={classes.minBidCopy}>
                    <Trans>minimum bid — Ξ {minBidEth(minBid, minBidReserve)} or more</Trans>
                  </p>
                </div>

                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    /* 入札 tx broadcast 済で block 反映待ちの間は close させない (state 不整合防止) */
                    disabled={isBidInFlight}
                    data-testid="eth-bid-cancel"
                    className={classes.cancelBtn}
                  >
                    <Trans>キャンセル</Trans>
                  </Button>
                  <Button
                    type="button"
                    onClick={placeEthBidHandler}
                    disabled={isBidInFlight || bidderWallet === ''}
                    data-testid="eth-bid-submit"
                    className={classes.bidBtn}
                  >
                    {isBidInFlight ? (
                      <span className="flex items-center gap-2">
                        <Spinner animation="border" size="sm" />
                        <span>{bidButtonLabel}</span>
                      </span>
                    ) : (
                      <Trans>入札</Trans>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="fiat" data-testid="bid-tab-content-fiat">
            <FiatBidForm
              onClose={onClose}
              auctionId={auction.nounId.toString()}
              bidderWallet={bidderWallet}
              minBidEth={parseFloat(minBidEth(minBid, minBidReserve))}
              palette={palette}
              fetchersOverride={fiatFetchersOverride}
              spotRateOverride={fiatSpotRateOverride}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default BidModal;
