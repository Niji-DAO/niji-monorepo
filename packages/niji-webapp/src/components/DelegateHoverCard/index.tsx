import React from 'react';

import { Trans } from '@lingui/react/macro';
import { Scale as ScaleIcon } from 'lucide-react';
import { Spinner } from 'react-bootstrap';

import HorizontalStackedNijis from '@/components/HorizontalStackedNijis';
import ShortAddress from '@/components/ShortAddress';
import { useDelegateNounsAtBlockQuery } from '@/wrappers/nijiToken';

import classes from './DelegateHoverCard.module.css';

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
      <div className={classes.spinnerWrapper}>
        <div className={classes.spinner}>
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
    <div className={classes.wrapper}>
      <div className={classes.stackedNounWrapper}>
        <HorizontalStackedNijis
          nounIds={data.delegates[0].nijiRepresented.map((noun: { id: string }) => noun.id)}
        />
      </div>

      <div className={classes.address}>
        <ShortAddress address={(data?.delegates[0]?.id ?? '') as `0x${string}`} />
      </div>

      <div className={classes.nounInfoWrapper}>
        <ScaleIcon height={20} width={20} className={classes.icon} />
        {numVotesForProp === 1 ? (
          <Trans>
            Voted with<span className={classes.bold}>{numVotesForProp}</span>Niji
          </Trans>
        ) : (
          <Trans>
            Voted with<span className={classes.bold}>{numVotesForProp}</span>Nijis
          </Trans>
        )}
      </div>
    </div>
  );
};

export default DelegateHoverCard;
