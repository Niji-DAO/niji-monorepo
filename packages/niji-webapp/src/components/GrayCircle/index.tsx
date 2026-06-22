import React from 'react';

import LegacyNoun from '@/components/LegacyNoun';
import { getGrayBackgroundSVG } from '@/utils/grayBackgroundSVG';

import nounClasses from '@/components/LegacyNoun/Noun.module.css';

interface GrayCircleProps {
  isDelegateView?: boolean;
}

export const GrayCircle: React.FC<GrayCircleProps> = ({ isDelegateView }) => {
  return (
    <div className={isDelegateView ? 'h-[55px] w-[55px]' : ''}>
      <LegacyNoun
        imgPath={getGrayBackgroundSVG()}
        alt={''}
        wrapperClassName={
          isDelegateView
            ? nounClasses.delegateViewCircularNounWrapper
            : nounClasses.circularNounWrapper
        }
        className={isDelegateView ? nounClasses.delegateViewCircular : nounClasses.circular}
      />
    </div>
  );
};
