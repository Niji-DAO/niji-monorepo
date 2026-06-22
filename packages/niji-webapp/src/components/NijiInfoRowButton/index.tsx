import React from 'react';

import { Image } from 'react-bootstrap';

import { useAppSelector } from '@/hooks';

interface NounInfoRowButtonProps {
  iconImgSource: string;
  btnText: React.ReactNode;
  onClickHandler: () => void;
}

const BUTTON_BASE_CLASS =
  "my-[5px] mr-[10px] flex h-10 cursor-pointer flex-row items-center justify-center rounded-[10px] px-[10px] py-0 text-center align-middle font-['PT_Root_UI'] font-bold transition-all duration-150 ease-in-out hover:bg-[color:var(--brand-gray-hover)] hover:no-underline active:text-black";
const COOL_CLASS = 'bg-[color:var(--brand-cool-accent)] text-[color:var(--brand-cool-dark-text)]';
const WARM_CLASS = 'bg-[color:var(--brand-warm-accent)] text-[color:var(--brand-warm-dark-text)]';

const NijiInfoRowButton: React.FC<NounInfoRowButtonProps> = props => {
  const { iconImgSource, btnText, onClickHandler } = props;
  const isCool = useAppSelector(state => state.application.isCoolBackground);
  return (
    <div
      className={`${BUTTON_BASE_CLASS} ${isCool ? COOL_CLASS : WARM_CLASS}`}
      onClick={onClickHandler}
    >
      <div className="flex flex-row justify-between">
        <Image src={iconImgSource} className="my-auto mr-1.5 size-5" />
        {btnText}
      </div>
    </div>
  );
};

export default NijiInfoRowButton;
