import React from 'react';

import { Trans } from '@lingui/react/macro';
import clsx from 'clsx';

import { ProposalState } from '@/wrappers/nijiDao';

const PROPOSAL_STATUS_CLASS =
  "rounded-lg border-2 border-transparent px-[0.65rem] py-[0.36rem] font-['PT_Root_UI'] text-sm font-bold text-white";

const statusVariant = (status: ProposalState | undefined) => {
  switch (status) {
    case ProposalState.PENDING:
    case ProposalState.ACTIVE:
      return 'bg-[color:var(--brand-color-green)]';
    case ProposalState.OBJECTION_PERIOD:
      return '!border-2 !border-[color:var(--brand-color-red)] !bg-white !text-[color:var(--brand-color-red)]';
    case ProposalState.SUCCEEDED:
    case ProposalState.EXECUTED:
      return 'bg-[color:var(--brand-color-blue)]';
    case ProposalState.DEFEATED:
    case ProposalState.VETOED:
      return 'bg-[color:var(--brand-color-red)]';
    case ProposalState.UPDATABLE:
      return '!border-2 !border-[#f0ad4e] !bg-white !text-[#dc9e46]';
    case ProposalState.QUEUED:
    case ProposalState.CANCELLED:
    case ProposalState.EXPIRED:
    default:
      return 'bg-[color:var(--brand-gray-light-text)]';
  }
};

const statusText = (status: ProposalState | undefined) => {
  switch (status) {
    case ProposalState.PENDING:
      return <Trans>Pending</Trans>;
    case ProposalState.ACTIVE:
      return <Trans>Active</Trans>;
    case ProposalState.SUCCEEDED:
      return <Trans>Succeeded</Trans>;
    case ProposalState.EXECUTED:
      return <Trans>Executed</Trans>;
    case ProposalState.DEFEATED:
      return <Trans>Defeated</Trans>;
    case ProposalState.QUEUED:
      return <Trans>Queued</Trans>;
    case ProposalState.CANCELLED:
      return <Trans>Canceled</Trans>;
    case ProposalState.VETOED:
      return <Trans>Vetoed</Trans>;
    case ProposalState.EXPIRED:
      return <Trans>Expired</Trans>;
    case ProposalState.OBJECTION_PERIOD:
      return <Trans>Objection period</Trans>;
    case ProposalState.UPDATABLE:
      return <Trans>Updatable</Trans>;
    default:
      return <Trans>Undetermined</Trans>;
  }
};

interface ProposalStateProps {
  status?: ProposalState;
  className?: string;
}

const ProposalStatus: React.FC<ProposalStateProps> = props => {
  const { status, className } = props;
  return (
    <div className={clsx(statusVariant(status), PROPOSAL_STATUS_CLASS, className)}>
      {statusText(status)}
    </div>
  );
};

export default ProposalStatus;
