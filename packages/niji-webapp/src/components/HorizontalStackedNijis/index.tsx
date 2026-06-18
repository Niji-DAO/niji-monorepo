import React from 'react';

import { StandaloneNijiCircular } from '@/components/StandaloneNiji';

import classes from './HorizontalStackedNijis.module.css';

interface HorizontalStackedNounsProps {
  nounIds: string[];
}

const HorizontalStackedNijis: React.FC<HorizontalStackedNounsProps> = ({ nounIds }) => {
  return (
    <div className={classes.wrapper}>
      {nounIds
        .slice(0, 6)
        .map((nounId: string, i: number) => {
          return (
            <div
              key={nounId.toString()}
              style={{
                top: '0px',
                left: `${25 * i}px`,
              }}
              className={classes.nounWrapper}
            >
              <StandaloneNijiCircular nounId={BigInt(nounId)} border={true} />
            </div>
          );
        })
        .reverse()}
    </div>
  );
};

export default HorizontalStackedNijis;
