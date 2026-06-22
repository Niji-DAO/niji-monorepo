import React from 'react';

import { Trans } from '@lingui/react/macro';
import clsx from 'clsx';

import { ForkState } from '@/wrappers/nijiDao';

const PROPOSAL_STATUS_CLASS =
  "rounded-lg border-2 border-transparent px-[0.65rem] py-[0.36rem] font-['PT_Root_UI'] text-sm font-bold text-white";

const statusVariant = (status: ForkState | undefined) => {
  switch (status) {
    case ForkState.ESCROW:
      return '!border-2 !border-[#f0ad4e] !bg-white !text-[#dc9e46]';
    case ForkState.ACTIVE:
      return 'bg-[color:var(--brand-color-green)]';
    case ForkState.EXECUTED:
      return 'bg-[color:var(--brand-color-blue)]';
    default:
      return 'bg-[color:var(--brand-gray-light-text)]';
  }
};

const statusText = (status: ForkState | undefined) => {
  switch (status) {
    case ForkState.ESCROW:
      return <Trans>In Escrow</Trans>;
    case ForkState.ACTIVE:
      return <Trans>Forking</Trans>;
    case ForkState.EXECUTED:
      return <Trans>Executed</Trans>;
    default:
      return <Trans>Undetermined</Trans>;
  }
};

interface ForkStateProps {
  status?: ForkState;
  className?: string;
}

const ForkStatus: React.FC<ForkStateProps> = props => {
  const { status, className } = props;
  return (
    <div className={clsx(statusVariant(status), PROPOSAL_STATUS_CLASS, className)}>
      {statusText(status)}
    </div>
  );
};

export default ForkStatus;
