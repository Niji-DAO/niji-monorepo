import React from 'react';

import { NijiCircular } from '@/components/Niji';

interface HorizontalStackedNounsProps {
  nounIds: string[];
}

const HorizontalStackedNijis: React.FC<HorizontalStackedNounsProps> = ({ nounIds }) => {
  return (
    <div className="!relative mx-auto mb-[50px] mt-[10px] w-full">
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
              className="absolute"
            >
              <NijiCircular nounId={BigInt(nounId)} border={true} />
            </div>
          );
        })
        .reverse()}
    </div>
  );
};

export default HorizontalStackedNijis;
