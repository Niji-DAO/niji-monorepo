/**
 * Bid — auction ページの bid button + settle button (Issue #3033 で UI 統合)
 *
 * Issue #3033 以降 —
 * (1) 従来の「Bid」 (ETH inline) + 「クレカで bid (JPY)」 の 2 button を単一「bid」 button に統合
 * (2) 「bid」 button click で BidModal を open、 modal 内 Tabs で ETH / クレカ 切替
 * (3) wallet 未接続時は button disable + tooltip「wallet 接続が必要です」 (Phase 1 stance 維持)
 * (4) auction 終了時は「Pick the next Niji」 + SettleManuallyBtn の従来 UI 維持 (bid button なし)
 *
 * SSOT — GH Issue #3033、 Linear CAR-324。
 */
import React from 'react';

import { Trans } from '@lingui/react/macro';
import { useWriteNijiAuctionHouseSettleCurrentAndCreateNewAuction } from '@niji/sdk/react';
import { useAtomValue } from 'jotai/react';
import { Button, Col, InputGroup } from 'react-bootstrap';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';

import BidModal from '@/components/BidModal';
import SettleManuallyBtn from '@/components/SettleManuallyBtn';
import { Button as ShadcnButton } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { isCoolBackgroundAtom } from '@/state/atoms/applicationAtom';
import { Auction } from '@/wrappers/nijiAuction';

import classes from './Bid.module.css';

interface BidProps {
  auction: Auction;
  auctionEnded: boolean;
}

const Bid: React.FC<BidProps> = props => {
  const { address: activeAccount } = useAccount();
  const { auction, auctionEnded } = props;

  // auction 全体の cool/warm background 判定 (Winner / NijiContent 等と同 atom 経路、 Issue #3037)
  const isCoolAuction = useAtomValue(isCoolBackgroundAtom);
  const palette = isCoolAuction ? 'cool' : 'warm';

  const [isBidModalOpen, setIsBidModalOpen] = React.useState(false);

  const {
    writeContract: settleAuction,
    isPending: isSettlingAuction,
    isSuccess: didSettleAuction,
    isError: didSettleFail,
    isIdle: isSettleIdle,
    error: settleAuctionError,
  } = useWriteNijiAuctionHouseSettleCurrentAndCreateNewAuction();

  const settleAuctionHandler = () => {
    settleAuction({});
  };

  // settle auction transaction state hook
  React.useEffect(() => {
    if (auctionEnded && didSettleAuction) {
      toast.success('Settled auction successfully!');
    }
    if (auctionEnded && didSettleFail) {
      toast.error(settleAuctionError?.message || 'Please try again.');
    }
  }, [
    auctionEnded,
    isSettleIdle,
    isSettlingAuction,
    didSettleAuction,
    didSettleFail,
    settleAuctionError?.message,
  ]);

  if (auction == undefined) return null;

  const isWalletConnected = activeAccount !== undefined;
  const isBidButtonDisabled = isSettlingAuction || !isWalletConnected;

  const crytalBallBtnOnClickHandler = () => {
    // Niji 自前の Crystal Ball page (/crystal-ball) を新タブで開く
    window.open('/crystal-ball', '_blank', 'noopener,noreferrer')?.focus();
  };

  return (
    <>
      <InputGroup>
        {!auctionEnded ? (
          <Col lg={12} className="mt-2">
            {isWalletConnected ? (
              <ShadcnButton
                type="button"
                onClick={() => setIsBidModalOpen(true)}
                disabled={isBidButtonDisabled}
                className={classes.bidBtn}
                data-palette={palette}
                data-testid="bid-open-button"
              >
                <Trans>Bid</Trans>
              </ShadcnButton>
            ) : (
              // Bid 単体で TooltipProvider を wrap (root 側 Provider が無い test 環境でも動作)。
              // radix は nested Provider を許容するため、 App root Provider と共存しても副作用なし。
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span data-testid="bid-open-button-wrapper">
                      <ShadcnButton
                        type="button"
                        disabled
                        className={classes.bidBtn}
                        data-palette={palette}
                        data-testid="bid-open-button"
                      >
                        <Trans>Bid</Trans>
                      </ShadcnButton>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>wallet 接続が必要です</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </Col>
        ) : (
          <>
            <Col lg={12} className={classes.voteForNextNounBtnWrapper}>
              <Button className={classes.bidBtnAuctionEnded} onClick={crytalBallBtnOnClickHandler}>
                <Trans>Pick the next Niji</Trans> ⌐◧-◧
              </Button>
            </Col>
            {/* Only show the force settles button if the wallet connected */}
            {isWalletConnected && (
              <Col lg={12}>
                <SettleManuallyBtn settleAuctionHandler={settleAuctionHandler} auction={auction} />
              </Col>
            )}
          </>
        )}
      </InputGroup>
      {isWalletConnected && (
        <BidModal
          open={isBidModalOpen}
          onClose={() => setIsBidModalOpen(false)}
          auction={auction}
          bidderWallet={activeAccount ?? ''}
          palette={palette}
        />
      )}
    </>
  );
};
export default Bid;
