import React from 'react';

import { useAtomValue } from 'jotai/react';
import { Image } from 'react-bootstrap';

import { isCoolBackgroundAtom } from '@/state/atoms/applicationAtom';

import classes from './NijiInfoRowButton.module.css';

interface NounInfoRowButtonProps {
  iconImgSource: string;
  btnText: React.ReactNode;
  onClickHandler: () => void;
}

const NijiInfoRowButton: React.FC<NounInfoRowButtonProps> = props => {
  const { iconImgSource, btnText, onClickHandler } = props;
  const isCool = useAtomValue(isCoolBackgroundAtom);
  return (
    <div
      className={isCool ? classes.nounButtonCool : classes.nounButtonWarm}
      onClick={onClickHandler}
    >
      <div className={classes.nounButtonContents}>
        <Image src={iconImgSource} className="my-auto mr-1.5 size-5" />
        {btnText}
      </div>
    </div>
  );
};

export default NijiInfoRowButton;
