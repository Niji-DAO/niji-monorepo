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

const minBidEth = (minBid: bigint): string => {
  if (minBid === 0n) {
    return '0';
  }
  const ethNum = parseFloat(formatEther(minBid));
  // 最低額を必ず満たすよう有効数字 3 桁で切り上げる。
  // 0.012967 → 0.013、 0.0001 → 0.0001、 1.05 → 1.05。
  // 一律第 2 位切り上げ (旧実装) だと 0.012967 が 0.02 に飛び、 0.0001 が 0.01 に潰れる問題を回避。
  const exponent = Math.ceil(Math.log10(ethNum));
  const decimals = Math.max(0, 3 - exponent);
  const factor = 10 ** decimals;
  return String(Math.ceil(ethNum * factor) / factor);
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
  const minBid = computeMinimumNextBid(
    auction.amount !== undefined ? BigInt(auction.amount.toString()) : 0n,
    minBidIncPercentage !== undefined ? BigInt(minBidIncPercentage.toString()) : undefined,
    reservePrice !== undefined ? BigInt(reservePrice.toString()) : undefined,
  );

  const {
    writeContract: placeBid,
    isPending: isPlacingBid,
    isError: didPlaceBidFail,
    isSuccess: placeBidSucceeded,
  } = useWriteNijiAuctionHouseCreateBid();

  const ethInputHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    // disable more than 2 digits after the decimal point
    if (input.includes('.') && input.split('.')[1].length > 2) {
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
        t`Please place a bid higher than or equal to the minimum bid amount of ${minBidEth(minBid)} ETH`,
      );
      setEthInput(minBidEth(minBid));
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
                    placeholder={`Ξ ${minBidEth(minBid)}`}
                    data-testid="eth-bid-input"
                    className={classes.bidInput}
                  />
                  <p className={classes.minBidCopy}>
                    <Trans>minimum bid — Ξ {minBidEth(minBid)} or more</Trans>
                  </p>
                </div>

                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    data-testid="eth-bid-cancel"
                    className={classes.cancelBtn}
                  >
                    <Trans>キャンセル</Trans>
                  </Button>
                  <Button
                    type="button"
                    onClick={placeEthBidHandler}
                    disabled={isPlacingBid || bidderWallet === ''}
                    data-testid="eth-bid-submit"
                    className={classes.bidBtn}
                  >
                    {isPlacingBid ? <Spinner animation="border" size="sm" /> : <Trans>bid</Trans>}
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
              minBidEth={parseFloat(minBidEth(minBid))}
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
