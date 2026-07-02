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
 * SSOT — GH Issue #3033、 Linear CAR-324。
 */

import type { Auction } from '@/wrappers/nijiAuction';

import * as React from 'react';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
import {
  useReadNijiAuctionHouseMinBidIncrementPercentage,
  useWriteNijiAuctionHouseCreateBid,
} from '@niji/sdk/react';
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

const computeMinimumNextBid = (
  currentBid: bigint,
  minBidIncPercentage: bigint | undefined,
): bigint => {
  if (minBidIncPercentage === undefined) {
    return 0n;
  }
  return (currentBid * (minBidIncPercentage + 100n)) / 100n;
};

const minBidEth = (minBid: bigint): string => {
  if (minBid === 0n) {
    return '0.01';
  }
  const eth = formatEther(minBid);
  const ethNum = parseFloat(eth);
  return (Math.ceil(ethNum * 100) / 100).toFixed(2);
};

export type BidModalProps = {
  /** modal open state (親から制御) */
  open: boolean;
  /** modal close callback */
  onClose: () => void;
  /** auction (bid 対象) */
  auction: Auction;
  /** bidder wallet address (親から wagmi useAccount 経由で渡す、 空文字は wallet 未接続) */
  bidderWallet: string;
  /**
   * test 用 injectable (fiat 側) — useFiatBid の fetchers 差替経路
   * 型は FiatBidForm props と一致 (import 循環を避けるため any 経路)。
   */
  fiatFetchersOverride?: React.ComponentProps<typeof FiatBidForm>['fetchersOverride'];
  fiatSpotRateOverride?: React.ComponentProps<typeof FiatBidForm>['spotRateOverride'];
  fiatGenerateCardToken?: React.ComponentProps<typeof FiatBidForm>['generateCardToken'];
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
  fiatFetchersOverride,
  fiatSpotRateOverride,
  fiatGenerateCardToken,
  defaultTab = 'eth',
}: BidModalProps): React.JSX.Element => {
  const { t } = useLingui();
  const [ethInput, setEthInput] = useState<string>('');
  const ethInputRef = useRef<HTMLInputElement>(null);

  const { data: minBidIncPercentage } = useReadNijiAuctionHouseMinBidIncrementPercentage();
  const minBid = computeMinimumNextBid(
    auction.amount !== undefined ? BigInt(auction.amount.toString()) : 0n,
    minBidIncPercentage !== undefined ? BigInt(minBidIncPercentage.toString()) : undefined,
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

  useEffect(() => {
    if (placeBidSucceeded) {
      toast.success(t`Bid placed.`);
      setEthInput('');
    }
  }, [placeBidSucceeded, t]);

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
    placeBid({
      args: [BigInt(auction.nounId)],
      value: parsed,
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
      <DialogContent data-testid="bid-modal">
        <DialogHeader>
          <DialogTitle>
            <Trans>Niji #{auction.nounId.toString()} に bid</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>ETH か クレカ (JPY) を選んで bid してください</Trans>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full" data-testid="bid-modal-tabs">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="eth" data-testid="bid-tab-eth">
              <Trans>ETH で bid</Trans>
            </TabsTrigger>
            <TabsTrigger value="fiat" data-testid="bid-tab-fiat">
              <Trans>クレカで払う (JPY)</Trans>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="eth" data-testid="bid-tab-content-eth">
            <div className="space-y-4">
              <div>
                <label htmlFor="eth-bid-amount" className="mb-1 block text-sm font-medium">
                  <Trans>bid 額 (ETH)</Trans>
                </label>
                <Input
                  id="eth-bid-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  onChange={ethInputHandler}
                  ref={ethInputRef}
                  value={ethInput}
                  placeholder={`Ξ ${minBidEth(minBid)}`}
                  data-testid="eth-bid-input"
                />
                <p className="mt-1 text-xs text-gray-500">
                  <Trans>minimum bid — Ξ {minBidEth(minBid)} or more</Trans>
                </p>
              </div>

              <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  data-testid="eth-bid-cancel"
                >
                  <Trans>キャンセル</Trans>
                </Button>
                <Button
                  type="button"
                  onClick={placeEthBidHandler}
                  disabled={isPlacingBid || bidderWallet === ''}
                  data-testid="eth-bid-submit"
                >
                  {isPlacingBid ? <Spinner animation="border" size="sm" /> : <Trans>bid</Trans>}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fiat" data-testid="bid-tab-content-fiat">
            <FiatBidForm
              onClose={onClose}
              auctionId={auction.nounId.toString()}
              bidderWallet={bidderWallet}
              fetchersOverride={fiatFetchersOverride}
              spotRateOverride={fiatSpotRateOverride}
              generateCardToken={fiatGenerateCardToken}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default BidModal;
