import React from 'react';

import ReactDOM from 'react-dom';

import xIcon from '@/assets/x-icon.png';

const BACKDROP_CLASS = 'fixed left-0 top-0 z-10 h-full w-full bg-black/60 backdrop-blur-[10px]';
const MODAL_CLASS =
  "fixed top-[30vh] left-[calc(50%-17.5rem)] z-[100] w-[35rem] rounded-[15px] bg-white/60 p-8 text-center font-['PT_Root_UI'] font-bold backdrop-blur-[10px] [&_h3]:text-[xx-large] [&_h3]:font-bold [&_button]:min-h-[44px] [&_button]:rounded-[10px] [&_button]:bg-white/70 [&_button]:pt-[7px] hover:[&_button]:bg-white hover:[&_button]:text-black [&_button>img]:-mt-[2px] [&_button>img]:h-auto [&_button>img]:w-6 max-[992px]:top-auto max-[992px]:bottom-0 max-[992px]:left-0 max-[992px]:max-h-full max-[992px]:w-full max-[992px]:rounded-b-none";
const CLOSE_BUTTON_CLASS =
  '!absolute right-8 top-8 h-10 w-10 border-0 !bg-transparent pt-[2px] [&>img]:-mt-1 [&>img]:h-4 [&>img]:w-4 [&>img]:opacity-50 [&>img]:transition-all [&>img]:duration-[125ms] [&>img]:ease-in-out hover:[&>img]:opacity-100';
const CONTENT_CLASS = 'max-h-[50vh] overflow-y-auto p-4';

export const Backdrop: React.FC<{ onDismiss: () => void }> = props => {
  return <div className={BACKDROP_CLASS} onClick={props.onDismiss} />;
};

interface ModalOverlayProps {
  title?: React.ReactNode;
  content?: React.ReactNode;
  onDismiss: () => void;
}

const ModalOverlay: React.FC<ModalOverlayProps> = ({ content, onDismiss, title }) => {
  return (
    <div className={MODAL_CLASS}>
      <button className={CLOSE_BUTTON_CLASS} onClick={onDismiss}>
        <img src={xIcon} alt="Button to close modal" />
      </button>
      <h3>{title}</h3>
      <div className={CONTENT_CLASS}>{content}</div>
    </div>
  );
};

const Modal: React.FC<ModalOverlayProps> = ({ content, onDismiss, title }) => {
  return (
    <>
      {ReactDOM.createPortal(
        <Backdrop onDismiss={onDismiss} />,
        document.getElementById('backdrop-root')!,
      )}
      {ReactDOM.createPortal(
        <ModalOverlay title={title} content={content} onDismiss={onDismiss} />,
        document.getElementById('overlay-root')!,
      )}
    </>
  );
};

export default Modal;
