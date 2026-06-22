import type { Address } from '@/utils/types';

import React from 'react';

import { Trans } from '@lingui/react/macro';
import clsx from 'clsx';
import { Col, Row } from 'react-bootstrap';

import ShortAddress from '@/components/ShortAddress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppSelector } from '@/hooks';
import { useActiveLocale } from '@/hooks/useActivateLocale';
import { buildEtherscanAddressLink } from '@/utils/etherscan';

const WRAPPER_CLASS =
  'ml-2 mt-[2px] pl-6 max-[992px]:mt-0 max-[992px]:mx-0 max-[992px]:w-full max-[992px]:p-0';
const SECTION_CLASS =
  "[&_h4]:font-['PT_Root_UI'] [&_h4]:text-lg [&_h4]:leading-[27px] [&_h2]:font-['PT_Root_UI'] [&_h2]:text-[32px] [&_h2]:font-bold max-[992px]:justify-between max-[992px]:[&_h2]:text-[23px]";
const LEFT_COL_CLASS = "font-['PT_Root_UI'] [&_h4]:font-bold max-[992px]:pl-2";
const LINK_CLASS =
  'flex cursor-pointer text-black no-underline hover:text-black hover:no-underline active:text-black';
const YOU_COPY_CLASS = 'mt-1 max-[992px]:pr-1';

interface WinnerProps {
  winner: Address;
  isNounders?: boolean;
}

const Winner: React.FC<WinnerProps> = props => {
  const { winner, isNounders } = props;
  const activeAccount = useAppSelector(state => state.account.activeAccount);

  const isCool = useAppSelector(state => state.application.isCoolBackground);

  const isWinnerYou =
    activeAccount !== undefined && activeAccount.toLocaleLowerCase() === winner.toLocaleLowerCase();

  const activeLocale = useActiveLocale();

  const nonNounderNounContent = isWinnerYou ? (
    <Row>
      <Col lg={activeLocale === 'ja-JP' ? 8 : 4} className={YOU_COPY_CLASS}>
        <h2
          className="max-[992px]:mr-2"
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
      href={buildEtherscanAddressLink('nounders.eth')}
      target={'_blank'}
      rel="noreferrer"
      className={LINK_CLASS}
    >
      <Tooltip>
        <TooltipContent id="holder-etherscan-tooltip">
          <Trans>View on Etherscan</Trans>
        </TooltipContent>
        <TooltipTrigger>nounders.eth</TooltipTrigger>
      </Tooltip>
    </a>
  );

  return (
    <>
      <Row className={clsx(WRAPPER_CLASS, SECTION_CLASS)}>
        <Col xs={1} lg={12} className={LEFT_COL_CLASS}>
          <h4
            style={{
              color: isCool ? 'var(--brand-cool-light-text)' : 'var(--brand-warm-light-text)',
            }}
            className="min-w-[250px]"
          >
            <Trans>Winner</Trans>
          </h4>
        </Col>
        <Col xs="auto" lg={12}>
          <h2
            className="max-[992px]:mr-2"
            style={{
              color: isCool ? 'var(--brand-cool-dark-text)' : 'var(--brand-warm-dark-text)',
            }}
          >
            {isNounders ? nounderNounContent : nonNounderNounContent}
          </h2>
        </Col>
      </Row>
    </>
  );
};

export default Winner;
