import React from 'react';

import { Trans } from '@lingui/react/macro';
import clsx from 'clsx';
import { Col, Row } from 'react-bootstrap';

import ShortAddress from '@/components/ShortAddress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppSelector } from '@/hooks';
import { useSubgraphQuery } from '@/hooks/useSubgraphQuery';
import { buildEtherscanAddressLink } from '@/utils/etherscan';
import { nounDocument } from '@/wrappers/subgraph';

const WRAPPER_CLASS =
  'ml-2 mt-[2px] pl-6 max-[992px]:mt-0 max-[992px]:mx-0 max-[992px]:w-full max-[992px]:p-0';
const SECTION_CLASS =
  "[&_h4]:font-['PT_Root_UI'] [&_h4]:text-lg [&_h4]:leading-[27px] [&_h2]:font-['PT_Root_UI'] [&_h2]:text-[32px] [&_h2]:font-bold max-[992px]:justify-between max-[992px]:[&_h2]:text-[23px]";
const LEFT_COL_CLASS = "font-['PT_Root_UI'] [&_h4]:font-bold max-[992px]:pl-2";
const HOLDER_CONTENT_CLASS = 'whitespace-nowrap max-[992px]:mr-2';
const LINK_CLASS =
  'flex cursor-pointer text-black no-underline hover:text-black hover:no-underline active:text-black';

interface HolderProps {
  nounId: bigint;
  isNounders?: boolean;
}

const Holder: React.FC<HolderProps> = props => {
  const { nounId, isNounders } = props;

  const isCool = useAppSelector(state => state.application.isCoolBackground);

  const id = nounId.toString();
  const { loading, error, data } = useSubgraphQuery({
    document: nounDocument,
    variables: { id },
    queryKey: ['noun', id],
  });

  if (loading) {
    return <></>;
  } else if (error) {
    return (
      <div>
        <Trans>Failed to fetch Niji info</Trans>
      </div>
    );
  }

  const holder = data?.noun?.owner.id;

  const nonNounderNounContent = (
    <a
      href={buildEtherscanAddressLink(holder ?? '')}
      target={'_blank'}
      rel="noreferrer"
      className={LINK_CLASS}
    >
      <Tooltip>
        <TooltipContent id="holder-etherscan-tooltip">
          <Trans>View on Etherscan</Trans>
        </TooltipContent>
        <TooltipTrigger>
          <ShortAddress size={40} address={(holder ?? '') as `0x${string}`} avatar={true} />
        </TooltipTrigger>
      </Tooltip>
    </a>
  );

  const nounderNounContent = 'nounders.eth';

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
            <Trans>Held by</Trans>
          </h4>
        </Col>
        <Col xs="auto" lg={12}>
          <h2
            className={HOLDER_CONTENT_CLASS}
            style={{
              color: isCool ? 'var(--brand-cool-dark-text)' : 'var(--brand-warm-dark-text)',
            }}
          >
            {isNounders === true ? nounderNounContent : nonNounderNounContent}
          </h2>
        </Col>
      </Row>
    </>
  );
};

export default Holder;
