import { i18n } from '@lingui/core';
import { Trans } from '@lingui/react/macro';
import {
  useReadNijiTreasuryBalancesInEth,
  useReadNijiTreasuryBalancesInUsd,
} from '@niji/sdk/react';
import clsx from 'clsx';
import { Col, Row } from 'react-bootstrap';
import { formatEther, formatUnits } from 'viem';

import Proposals from '@/components/Proposals';
import Section from '@/layout/Section';
import { useAllProposals, useProposalThreshold } from '@/wrappers/nijiDao';

const SECTION_CLASS = 'max-[992px]:mx-2';
const WRAPPER_CLASS = 'mx-auto [&_p]:pt-4';
const HEADER_ROW_CLASS =
  '[&_span]:font-londrina [&_span]:text-2xl [&_span]:text-[#8c8d92] [&_h1]:font-londrina [&_h1]:text-[56px] [&_h1]:text-[#14161b]';
const SUBHEADING_CLASS =
  "font-['PT_Root_UI'] text-[1.2rem] font-medium text-[color:var(--brand-dark-green)]";
const BOLD_TEXT_CLASS = "font-['PT_Root_UI'] font-bold";
const TREASURY_INFO_CARD_CLASS = 'mb-12 rounded-[20px] border border-[#e2e3e8]';
const TREASURY_AMT_WRAPPER_CLASS =
  'py-4 px-8 min-[992px]:border-r-2 min-[992px]:border-r-[#e2e3e8]';
const USD_TREASURY_AMT_CLASS = 'pt-[0.2rem]';
const ETH_TREASURY_AMT_CLASS =
  'flex h-12 min-w-[9rem] pt-[0.2rem] [&_h1]:font-londrina [&_h1]:text-4xl min-[992px]:border-r-2 min-[992px]:border-r-[#e2e3e8]';
const ETH_SYMBOL_CLASS = "!font-['PT_Root_UI'] mr-2";
const USD_BALANCE_CLASS = 'font-londrina text-4xl text-[color:var(--brand-gray-light-text)]';
const TREASURY_INFO_TEXT_CLASS = "py-4 px-8 font-['PT_Root_UI'] font-medium";

const GovernancePage = () => {
  const { data: proposals } = useAllProposals();
  const threshold = useProposalThreshold();
  const nijisRequired = threshold == null ? undefined : threshold + 1;

  const treasuryBalance = useReadNijiTreasuryBalancesInEth({
    query: {
      select: (balances: { total: bigint }) => {
        console.log('eth', balances);
        return balances.total;
      },
    },
  }).data;
  const treasuryBalanceUSD = useReadNijiTreasuryBalancesInUsd({
    query: {
      select: (balances: Record<string, bigint> & { total: bigint }) => {
        console.log(
          'usd',
          Object.entries(balances).map(([token, value]) => [token, formatUnits(value, 6)]),
        );
        return balances.total;
      },
    },
  }).data;

  // Note: We have to extract this copy out of the <span> otherwise the Lingui macro gets confused
  const nijiSingular = <Trans>Niji</Trans>;
  const nijiPlural = <Trans>Nijis</Trans>;
  const subHeading = (
    <Trans>
      Nijis govern <span className={BOLD_TEXT_CLASS}>Niji DAO</span>. Nijis can vote on proposals or
      delegate their vote to a third party. A minimum of{' '}
      <span className={BOLD_TEXT_CLASS}>
        {nijisRequired !== undefined ? (
          <>
            {nijisRequired} {threshold === 0 ? nijiSingular : nijiPlural}
          </>
        ) : (
          '...'
        )}
      </span>{' '}
      is required to submit proposals.
    </Trans>
  );

  return (
    <>
      <Section fullWidth={false} className={SECTION_CLASS}>
        <Col lg={10} className={WRAPPER_CLASS}>
          <Row className={HEADER_ROW_CLASS}>
            <span>
              <Trans>Governance</Trans>
            </span>
            <h1>
              <Trans>Niji DAO</Trans>
            </h1>
          </Row>
          <p className={SUBHEADING_CLASS}>{subHeading}</p>

          <Row className={TREASURY_INFO_CARD_CLASS}>
            <Col lg={8} className={TREASURY_AMT_WRAPPER_CLASS}>
              <Row className={HEADER_ROW_CLASS}>
                <span>
                  <Trans>Treasury</Trans>
                </span>
              </Row>
              <Row>
                <Col className={clsx(ETH_TREASURY_AMT_CLASS)} lg={3}>
                  <h1 className={ETH_SYMBOL_CLASS}>Ξ</h1>
                  <h1>
                    {treasuryBalance != undefined &&
                      i18n.number(Number(Number(formatEther(treasuryBalance)).toFixed(0)))}
                  </h1>
                </Col>
                <Col className={USD_TREASURY_AMT_CLASS}>
                  <h1 className={USD_BALANCE_CLASS}>
                    {treasuryBalanceUSD !== undefined &&
                      i18n.number(Number(formatUnits(treasuryBalanceUSD, 6)), {
                        style: 'currency',
                        currency: 'USD',
                      })}
                  </h1>
                </Col>
              </Row>
            </Col>
            <Col className={TREASURY_INFO_TEXT_CLASS}>
              <Trans>
                This treasury exists for <span className={BOLD_TEXT_CLASS}>Niji DAO</span>{' '}
                participants to allocate resources for the long-term growth and prosperity of the
                Niji project.
              </Trans>
            </Col>
          </Row>
        </Col>
      </Section>

      <Proposals proposals={proposals ?? []} nounsRequired={nijisRequired} />
    </>
  );
};
export default GovernancePage;
