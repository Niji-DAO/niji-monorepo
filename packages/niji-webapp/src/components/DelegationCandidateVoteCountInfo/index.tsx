import React from 'react';

import BrandSpinner from '../BrandSpinner';

interface DelegationCandidateVoteCountInfoProps {
  text: React.ReactNode;
  voteCount: number;
  isLoading: boolean;
}

const DelegationCandidateVoteCountInfo: React.FC<DelegationCandidateVoteCountInfoProps> = props => {
  const { text, voteCount, isLoading } = props;

  return (
    <div className="flex">
      {isLoading && (
        <div className="mr-2 mt-2">
          <BrandSpinner />
        </div>
      )}
      <div className="flex flex-col text-right font-normal text-[color:var(--brand-gray-light-text)]">
        <div>{text}</div>
        <div className="font-bold text-black">
          {voteCount === 1 ? <>{voteCount} Vote</> : <>{voteCount} Votes</>}
        </div>
      </div>
    </div>
  );
};

export default DelegationCandidateVoteCountInfo;
