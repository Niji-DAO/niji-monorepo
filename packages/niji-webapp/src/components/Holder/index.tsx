import React from 'react';

import { Trans } from '@lingui/react/macro';
import { useReadNijiTokenOwnerOf } from '@niji/sdk/react';
import clsx from 'clsx';
import { useAtomValue } from 'jotai/react';
import { Col, Row } from 'react-bootstrap';

import ShortAddress from '@/components/ShortAddress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSubgraphQuery } from '@/hooks/useSubgraphQuery';
import { isCoolBackgroundAtom } from '@/state/atoms/applicationAtom';
import { buildEtherscanAddressLink } from '@/utils/etherscan';
import { isNounderNiji } from '@/utils/nounderNiji';
import { defaultChain } from '@/wagmi';
import { nounDocument } from '@/wrappers/subgraph';

import classes from './Holder.module.css';

interface HolderProps {
  nounId: bigint;
  /**
   * Nijider 枠 (10 番目ごと、 nounId <= 1820) の場合 true で「niji.eth」 placeholder 表示。
   * 未指定時は本 component 内で `isNounderNiji(nounId)` を用いて自動判定する。
   */
  isNounders?: boolean;
}

const Holder: React.FC<HolderProps> = props => {
  const { nounId, isNounders } = props;

  const isCool = useAtomValue(isCoolBackgroundAtom);

  // Nijider 枠は自動判定 (Nouns 慣例 = 10 番目ごとに DAO Nijider 配布、 utils/nounderNiji.ts SSOT)。
  // 呼出側が isNounders を渡さない case でも「niji.eth」 表示になる。
  const nounderResolved = isNounders ?? isNounderNiji(nounId);

  const id = nounId.toString();
  const { loading, error, data } = useSubgraphQuery({
    document: nounDocument,
    variables: { id },
    queryKey: ['noun', id],
  });

  // subgraph fail (Ponder 未起動 / 通信 error) 時は on-chain owner を RPC 直接読みで fallback する。
  // local anvil dev (Ponder 起動なし) や subgraph 一時 down でも保有者 address を表示できる。
  // Nijider 枠は placeholder 表示のみで RPC 呼出不要 (query disable)。
  //
  // hook 参照側 cast pattern (PR #3075 SSOT) で TS2589 inference depth 超過を回避。
  const ownerOfHook = useReadNijiTokenOwnerOf as unknown as (opts: {
    chainId: number;
    args: readonly [bigint];
    query: { enabled: boolean };
  }) => { data: `0x${string}` | undefined };
  const { data: onchainOwner } = ownerOfHook({
    chainId: defaultChain.id,
    args: [nounId] as const,
    query: { enabled: !nounderResolved },
  });

  if (loading) {
    return <></>;
  }
  if (error !== undefined) {
    return (
      <div>
        <Trans>Failed to fetch Niji info</Trans>
      </div>
    );
  }

  const subgraphHolder = data?.noun?.owner.id as `0x${string}` | undefined;
  const holder = subgraphHolder ?? (onchainOwner as `0x${string}` | undefined);

  const nonNounderNounContent =
    holder !== undefined && holder.length > 0 ? (
      <a
        href={buildEtherscanAddressLink(holder)}
        target={'_blank'}
        rel="noreferrer"
        className={classes.link}
      >
        <Tooltip>
          <TooltipContent id="holder-etherscan-tooltip">
            <Trans>View on Etherscan</Trans>
          </TooltipContent>
          <TooltipTrigger>
            <ShortAddress size={40} address={holder} avatar={true} />
          </TooltipTrigger>
        </Tooltip>
      </a>
    ) : (
      // subgraph も RPC も holder 未取得 (Nijider 枠でない通常 auction で on-chain owner 未返却)、
      // 空 avatar 描画を回避して明示テキスト表示。 anvil 起動直後の一瞬 window でのみ発生する想定。
      <span className={classes.link}>—</span>
    );

  const nounderNounContent = 'niji.eth';

  return (
    <>
      <Row className={clsx(classes.wrapper, classes.section)}>
        <Col xs={1} lg={12} className={classes.leftCol}>
          <h4
            style={{
              color: isCool ? 'var(--brand-cool-light-text)' : 'var(--brand-warm-light-text)',
            }}
            className={classes.holderCopy}
          >
            <Trans>Held by</Trans>
          </h4>
        </Col>
        <Col xs="auto" lg={12}>
          <h2
            className={classes.holderContent}
            style={{
              color: isCool ? 'var(--brand-cool-dark-text)' : 'var(--brand-warm-dark-text)',
            }}
          >
            {nounderResolved ? nounderNounContent : nonNounderNounContent}
          </h2>
        </Col>
      </Row>
    </>
  );
};

export default Holder;
