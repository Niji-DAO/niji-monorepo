import clsx from 'clsx';

import { VoteCardVariant } from '../VoteCard';

const VoteProgressBar: React.FC<{
  variant: VoteCardVariant;
  percentage: number;
}> = props => {
  const { variant, percentage } = props;

  let progressBarClass;
  let wrapperClass;
  switch (variant) {
    case VoteCardVariant.FOR:
      progressBarClass = 'bg-[color:var(--brand-color-green)]';
      wrapperClass = 'bg-[color:var(--brand-color-green-translucent)]';
      break;
    case VoteCardVariant.AGAINST:
      progressBarClass = 'bg-[color:var(--brand-color-red)]';
      wrapperClass = 'bg-[color:var(--brand-color-red-translucent)]';
      break;
    default:
      progressBarClass = 'bg-[color:var(--brand-gray-light-text)]';
      wrapperClass = 'bg-[color:var(--brand-gray-light-text-translucent)]';
      break;
  }

  return (
    <div className={clsx('h-4 rounded-md', wrapperClass)}>
      <div
        style={{
          width: `${percentage}%`,
        }}
        className={clsx('h-full rounded-md', progressBarClass)}
      ></div>
    </div>
  );
};

export default VoteProgressBar;
