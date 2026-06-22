import { useState } from 'react';

import clsx from 'clsx';

import { CandidateSignature } from '@/wrappers/nijiData';
import { useDelegateNounsAtBlockQuery } from '@/wrappers/nijiToken';

import CandidateSponsorImage from './CandidateSponsorImage';

type CandidateSponsorsProps = {
  signers: CandidateSignature[];
  nounsRequired: number;
  currentBlock?: bigint;
  isThresholdMetByProposer?: boolean;
};

const CandidateSponsors = ({
  signers,
  nounsRequired,
  currentBlock,
  isThresholdMetByProposer,
}: CandidateSponsorsProps) => {
  const maxVisibleSpots = 5;
  const [signerCountOverflow, setSignerCountOverflow] = useState(0);
  const activeSigners = signers?.filter(s => s.signer.activeOrPendingProposal === false) ?? [];
  const signerIds = activeSigners?.map(s => s.signer.id) ?? [];
  const { data: delegateSnapshot } = useDelegateNounsAtBlockQuery(signerIds, currentBlock ?? 0n);
  const delegates = delegateSnapshot?.delegates;
  const delegateToNounIds = delegates?.reduce<Record<string, string[]>>((acc, curr) => {
    acc[curr.id] = curr?.nijiRepresented?.map(nr => nr.id) ?? [];
    return acc;
  }, {});
  const nounIds = Object.values(delegateToNounIds ?? {}).flat();
  if (signers.length > maxVisibleSpots) {
    setSignerCountOverflow(signers.length - maxVisibleSpots);
  }
  const placeholderCount =
    isThresholdMetByProposer === true && nounIds.length === 0 ? 1 : nounsRequired - nounIds.length;
  const placeholderArray = Array(placeholderCount >= 1 ? placeholderCount : 0).fill(0);

  return (
    <div
      className={clsx(
        'flex flex-row gap-2',
        signerCountOverflow > 0 && 'min-[992px]:max-w-[200px] min-[992px]:overflow-visible',
      )}
    >
      {nounIds.length > 0 && (
        <div className="flex flex-row flex-wrap content-center items-center justify-center gap-[5px] min-[992px]:justify-start">
          {nounIds.map((nounId, i) => {
            if (i >= maxVisibleSpots) return null;
            return <CandidateSponsorImage nounId={BigInt(+nounId)} key={i * +nounId} />;
          })}
        </div>
      )}
      {placeholderArray.map((_, i) => (
        <div
          className="h-8 w-8 rounded-full border border-dashed border-[#a7a7aa] bg-[#e8e8ec]"
          key={i}
        />
      ))}
    </div>
  );
};

export default CandidateSponsors;
