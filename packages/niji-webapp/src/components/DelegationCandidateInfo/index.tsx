import React, { useEffect, useState } from 'react';

import { Trans } from '@lingui/react/macro';
import { blo } from 'blo';

import BrandSpinner from '@/components/BrandSpinner';
import DelegationCandidateVoteCountInfo from '@/components/DelegationCandidateVoteCountInfo';
import ShortAddress from '@/components/ShortAddress';
import { formatShortAddress } from '@/utils/addressAndENSDisplayUtils';
import { usePickByState } from '@/utils/pickByState';
import { Address } from '@/utils/types';
import { useAccountVotes } from '@/wrappers/nijiToken';

import { ChangeDelegateState } from '../ChangeDelegatePanel';

interface DelegationCandidateInfoProps {
  address: Address;
  changeModalState: ChangeDelegateState;
  votesToAdd: number;
}

const DelegationCandidateInfo: React.FC<DelegationCandidateInfoProps> = props => {
  const { address, changeModalState, votesToAdd } = props;

  const [willHaveVoteCount, setWillHaveVoteCount] = useState(0);

  const shortAddress = formatShortAddress(address);

  const votes = useAccountVotes(address);

  const countDelegatedNouns = votes ?? 0;

  // Do this so that in the lag between the delegation happening on chain and the UI updating
  // we don't show that we've added the delegated votes twice
  useEffect(() => {
    if (
      changeModalState === ChangeDelegateState.ENTER_DELEGATE_ADDRESS &&
      willHaveVoteCount !== 0
    ) {
      setWillHaveVoteCount(0);
      return;
    }

    if (willHaveVoteCount > 0) {
      return;
    }
    if (
      changeModalState !== ChangeDelegateState.ENTER_DELEGATE_ADDRESS &&
      willHaveVoteCount !== countDelegatedNouns + votesToAdd
    ) {
      setWillHaveVoteCount(countDelegatedNouns + votesToAdd);
    }
  }, [willHaveVoteCount, countDelegatedNouns, votesToAdd, changeModalState]);

  const changeDelegateInfo = usePickByState(
    changeModalState,
    [
      ChangeDelegateState.ENTER_DELEGATE_ADDRESS,
      ChangeDelegateState.CHANGING,
      ChangeDelegateState.CHANGE_SUCCESS,
    ],
    [
      <DelegationCandidateVoteCountInfo
        key="enter-delegate"
        text={countDelegatedNouns > 0 ? <Trans>Already has</Trans> : <Trans>Has</Trans>}
        voteCount={countDelegatedNouns}
        isLoading={false}
      />,
      <DelegationCandidateVoteCountInfo
        key="changing"
        text={<Trans>Will have</Trans>}
        voteCount={willHaveVoteCount}
        isLoading={true}
      />,
      <DelegationCandidateVoteCountInfo
        key="success"
        text={<Trans>Now has</Trans>}
        voteCount={countDelegatedNouns}
        isLoading={false}
      />,
    ],
  );

  if (votes == null) {
    return (
      <div className="flex justify-center">
        <BrandSpinner />
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-row justify-between px-2">
      <div className="flex">
        <div className="mr-4">
          <img
            alt={address}
            src={blo(address as Address)}
            width={45}
            height={45}
            style={{ borderRadius: '50%' }}
          />
        </div>
        <div>
          <div className="text-[22px] font-bold text-[color:var(--brand-cool-dark-text)]">
            <ShortAddress address={address} />
          </div>
          <div className="text-[13px] font-medium text-[color:var(--brand-cool-light-text)]">
            {shortAddress}
          </div>
        </div>
      </div>

      {changeDelegateInfo}
    </div>
  );
};

export default DelegationCandidateInfo;
