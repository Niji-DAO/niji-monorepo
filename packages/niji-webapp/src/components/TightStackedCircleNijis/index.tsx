import React from 'react';

import TightStackedCircleNiji from '../TightStackedCircleNiji';

interface StackedCircleNounsProps {
  nounIds: Array<number>;
}

const MAX_NOUNS_PER_STACK = 3;

const TightStackedCircleNijis: React.FC<StackedCircleNounsProps> = props => {
  const { nounIds } = props;

  const shift = 3;

  const square = 55;

  return (
    <svg width={square} height={square}>
      {nounIds
        .slice(0, MAX_NOUNS_PER_STACK)
        .map((nounId: number, i: number) => {
          return <TightStackedCircleNiji nounId={nounId} index={i} square={square} shift={shift} />;
        })
        .reverse()}
    </svg>
  );
};

export default TightStackedCircleNijis;
