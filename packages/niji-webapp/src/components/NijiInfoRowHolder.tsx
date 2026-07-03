import React from 'react';

import { Trans } from '@lingui/react/macro';
import { nijiAuctionHouseAddress } from '@niji/sdk/react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLinkIcon } from 'lucide-react';

import ShortAddress from '@/components/ShortAddress';
import { cn } from '@/lib/utils';
import { execute } from '@/subgraphs/execute';
import { buildEtherscanAddressLink } from '@/utils/etherscan';
import { Address } from '@/utils/types';
import { defaultChain } from '@/wagmi';
import { auctionQuery } from '@/wrappers/subgraph';

interface NounInfoRowHolderProps {
  nounId: bigint;
  className?: string;
}

const NijiInfoRowHolder: React.FC<NounInfoRowHolderProps> = props => {
  const { nounId, className } = props;

  const { isLoading, error, data } = useQuery({
    queryKey: ['auction', nounId.toString()],
    queryFn: () => execute(auctionQuery, { id: nounId.toString() }),
  });

  const winner = data && data.auction?.bidder?.id;

  if (isLoading) {
    return (
      <span className={cn('text-muted-foreground block', className)}>
        <Trans>Loading...</Trans>
      </span>
    );
  }

  if (error || !winner) {
    return <></>;
  }

  const etherscanURL = buildEtherscanAddressLink(winner);
  const shortAddressComponent = <ShortAddress address={winner as Address} />;
  const chainId = defaultChain.id;

  return (
    <span className={cn('text-muted-foreground block', className)}>
      <Trans>Winner</Trans>{' '}
      <a className="text-muted-foreground" href={etherscanURL} target={'_blank'} rel="noreferrer">
        {winner.toLowerCase() === nijiAuctionHouseAddress[chainId].toLowerCase() ? (
          // Issue #3049: auction 開始直後 or settle 済で NFT が Auction House 保有中の状態は
          // user 視点で「入札待ち」 が意図 (「Niji Auction House = 主催者」 訳出で「落札者 = 主催者」
          // の misleading 表示を回避)。
          <Trans>Waiting for bid</Trans>
        ) : (
          shortAddressComponent
        )}
        <ExternalLinkIcon className="text-muted-foreground ml-0.5 inline-block size-3" />
      </a>
    </span>
  );
};

export default NijiInfoRowHolder;
