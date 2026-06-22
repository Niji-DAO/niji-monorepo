import React, { useState } from 'react';

import { XIcon } from '@heroicons/react/solid';
import ReactDOM from 'react-dom';

import { cn } from '@/lib/utils';

import ChangeDelegatePanel from '../ChangeDelegatePanel';
import CurrentDelegatePannel from '../CurrentDelegatePannel';

const BACKDROP_CLASS =
  'fixed left-0 top-0 z-[60] h-full w-full bg-[rgba(75,75,75,0.5)] backdrop-blur-[24px] max-[992px]:bg-black/[0.74]';
const MODAL_CLASS =
  "fixed top-[15vh] left-[calc(50%-236px)] z-[100] w-[472px] max-h-[347px] rounded-3xl bg-[rgba(244,244,248,1)] p-6 font-['PT_Root_UI'] font-bold shadow-[0px_0px_24px_rgba(0,0,0,0.05)] max-[992px]:top-auto max-[992px]:bottom-0 max-[992px]:left-0 max-[992px]:max-h-full max-[992px]:w-full max-[992px]:rounded-b-none max-[992px]:shadow-none";
const CLOSE_BTN_WRAPPER_CLASS = 'flex justify-end px-8 py-4';
const CLOSE_BTN_CLASS =
  '!fixed z-[100] h-10 w-10 rounded-full border-0 transition-all duration-[125ms] ease-in-out hover:cursor-pointer hover:bg-white/50';
const CLOSE_ICON_CLASS = 'h-6 w-6';

export const Backdrop: React.FC<{ onDismiss: () => void }> = props => {
  return <div className={BACKDROP_CLASS} onClick={props.onDismiss} />;
};

interface DelegationModalOverlayProps {
  onDismiss: () => void;
  delegateTo?: string;
}

const DelegationModalOverlay: React.FC<DelegationModalOverlayProps> = props => {
  const { onDismiss, delegateTo } = props;

  const [isChangingDelegation, setIsChangingDelegation] = useState(delegateTo !== undefined);

  return (
    <>
      <div className={CLOSE_BTN_WRAPPER_CLASS}>
        <button onClick={onDismiss} className={CLOSE_BTN_CLASS}>
          <XIcon className={CLOSE_ICON_CLASS} />
        </button>
      </div>

      <div className={cn(MODAL_CLASS, 'flex h-auto !max-h-fit flex-col gap-2')}>
        {isChangingDelegation ? (
          <ChangeDelegatePanel onDismiss={onDismiss} delegateTo={delegateTo} />
        ) : (
          <CurrentDelegatePannel
            onPrimaryBtnClick={() => setIsChangingDelegation(true)}
            onSecondaryBtnClick={onDismiss}
          />
        )}
      </div>
    </>
  );
};

const DelegationModal: React.FC<{
  onDismiss: () => void;
  delegateTo?: string;
}> = props => {
  const { onDismiss, delegateTo } = props;
  return (
    <>
      {ReactDOM.createPortal(
        <Backdrop onDismiss={onDismiss} />,
        document.getElementById('backdrop-root')!,
      )}
      {ReactDOM.createPortal(
        <DelegationModalOverlay onDismiss={onDismiss} delegateTo={delegateTo} />,
        document.getElementById('overlay-root')!,
      )}
    </>
  );
};

export default DelegationModal;
