import React from 'react';

import { ScaleIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/react/macro';
import { Spinner } from 'react-bootstrap';

import HorizontalStackedNijis from '@/components/HorizontalStackedNijis';
import ShortAddress from '@/components/ShortAddress';
import { useDelegateNounsAtBlockQuery } from '@/wrappers/nijiToken';

interface DelegateHoverCardProps {
  delegateId: string;
  proposalCreationBlock: bigint;
}

const DelegateHoverCard: React.FC<DelegateHoverCardProps> = props => {
  const { delegateId, proposalCreationBlock } = props;

  const unwrappedDelegateId = delegateId ? delegateId.replace('delegate-', '') : '';

  const { data, loading, error } = useDelegateNounsAtBlockQuery(
    [unwrappedDelegateId],
    proposalCreationBlock,
  );

  if (loading || !data || data === undefined || data.delegates.length === 0) {
    return (
      <div className="flex h-[185px] w-full flex-col justify-center text-[color:var(--brand-gray-light-text)]">
        <div className="flex w-full justify-center">
          <Spinner animation="border" />
        </div>
      </div>
    );
  }

  if (error) {
    return <>Error fetching Vote info</>;
  }

  const numVotesForProp = data.delegates[0].nijiRepresented.length;

  return (
    <div className="flex max-w-[11rem] flex-col">
      <div className="flex">
        <HorizontalStackedNijis
          nounIds={data.delegates[0].nijiRepresented.map((noun: { id: string }) => noun.id)}
        />
      </div>

      <div className="font-londrina w-full text-left text-2xl">
        <ShortAddress address={(data?.delegates[0]?.id ?? '') as `0x${string}`} />
      </div>

      <div className="mb-3 mt-1 flex items-center text-[15px] font-medium not-italic leading-[140%] text-[color:var(--brand-gray-dark-text)]">
        <ScaleIcon height={20} width={20} className="mb-[5px] mr-[6px]" />
        {numVotesForProp === 1 ? (
          <Trans>
            Voted with<span className="mx-1 font-bold">{numVotesForProp}</span>Niji
          </Trans>
        ) : (
          <Trans>
            Voted with<span className="mx-1 font-bold">{numVotesForProp}</span>Niji
          </Trans>
        )}
      </div>
    </div>
  );
};

export default DelegateHoverCard;
