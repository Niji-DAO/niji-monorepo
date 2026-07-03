import type { Address } from '@/utils/types';

import React from 'react';

import { Trans } from '@lingui/react/macro';
import { nijiAuctionHouseAddress } from '@niji/sdk/react';
import clsx from 'clsx';
import { useAtomValue } from 'jotai/react';
import { Col, Row } from 'react-bootstrap';
import { useAccount } from 'wagmi';

import ShortAddress from '@/components/ShortAddress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useActiveLocale } from '@/hooks/useActivateLocale';
import { isCoolBackgroundAtom } from '@/state/atoms/applicationAtom';
import { buildEtherscanAddressLink } from '@/utils/etherscan';
import { defaultChain } from '@/wagmi';

import classes from './Winner.module.css';

interface WinnerProps {
  winner: Address;
  isNounders?: boolean;
}

const Winner: React.FC<WinnerProps> = props => {
  const { winner, isNounders } = props;
  const { address: activeAccount } = useAccount();

  const isCool = useAtomValue(isCoolBackgroundAtom);

  const isWinnerYou =
    activeAccount !== undefined && activeAccount.toLocaleLowerCase() === winner.toLocaleLowerCase();

  // Issue #3055: auction 開始直後 or settle 済で winner が Niji Auction House contract
  // address のまま流入すると avatar 表示が misleading になる (同 Issue #3049 と同 pattern)。
  // 空 avatar でなく「入札待ち」 テキスト表示に切替える。
  const auctionHouseAddressForChain = nijiAuctionHouseAddress[defaultChain.id];
  const isAuctionHouse =
    auctionHouseAddressForChain !== undefined &&
    winner.toLocaleLowerCase() === auctionHouseAddressForChain.toLocaleLowerCase();

  const activeLocale = useActiveLocale();

  const nonNounderNounContent = isWinnerYou ? (
    <Row className={classes.youSection}>
      <Col lg={activeLocale === 'ja-JP' ? 8 : 4} className={classes.youCopy}>
        <h2
          className={classes.winnerContent}
          style={{
            color: isCool ? 'var(--brand-cool-dark-text)' : 'var(--brand-warm-dark-text)',
          }}
        >
          <Trans>You</Trans>
        </h2>
      </Col>
    </Row>
  ) : (
    <ShortAddress size={40} address={winner} avatar={true} />
  );

  const nounderNounContent = (
    <a
      href={buildEtherscanAddressLink('niji.eth')}
      target={'_blank'}
      rel="noreferrer"
      className={classes.link}
    >
      <Tooltip>
        <TooltipContent id="holder-etherscan-tooltip">
          <Trans>View on Etherscan</Trans>
        </TooltipContent>
        <TooltipTrigger>niji.eth</TooltipTrigger>
      </Tooltip>
    </a>
  );

  const auctionHouseContent = (
    <span className={classes.emptyState}>
      <Trans>Waiting for bid</Trans>
    </span>
  );

  const winnerContent =
    isNounders === true
      ? nounderNounContent
      : isAuctionHouse
        ? auctionHouseContent
        : nonNounderNounContent;

  return (
    <>
      <Row className={clsx(classes.wrapper, classes.section)}>
        <Col xs={1} lg={12} className={classes.leftCol}>
          <h4
            style={{
              color: isCool ? 'var(--brand-cool-light-text)' : 'var(--brand-warm-light-text)',
            }}
            className={classes.winnerCopy}
          >
            <Trans>Winner</Trans>
          </h4>
        </Col>
        <Col xs="auto" lg={12}>
          <h2
            className={classes.winnerContent}
            style={{
              color: isCool ? 'var(--brand-cool-dark-text)' : 'var(--brand-warm-dark-text)',
            }}
          >
            {winnerContent}
          </h2>
        </Col>
      </Row>
    </>
  );
};

export default Winner;
