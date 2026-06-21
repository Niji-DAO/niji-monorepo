import React from 'react';

import { AnimatePresence, motion, type TargetAndTransition } from 'motion/react';

export interface TransitionStyles {
  enteringStyle: React.CSSProperties;
  enteredStyle: React.CSSProperties;
  exitingStyle: React.CSSProperties;
  exitedStyle: React.CSSProperties;
}

export interface NounsTransitionProps {
  children?: React.ReactNode;
  /**
   * react-transition-group との API 互換のため受け取るが motion 経路では未使用。
   * 既存 consumer 8 件の prop 削除を避けるため optional 形式で残す。
   */
  nodeRef?: React.MutableRefObject<HTMLDivElement | null> | React.RefObject<HTMLDivElement | null>;
  show: boolean;
  transitionStyes: TransitionStyles;
  timeout?: number;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
}

/**
 * motion (Framer Motion) で実装した modal / overlay 用の fade / slide transition。
 *
 * 旧 react-transition-group の `<Transition>` API と互換のため、 transitionStyes の 4 state
 * (entering / entered / exiting / exited) を motion の initial / animate / exit に写像する。
 *
 * - enteredStyle → animate (目標 state)
 * - exitingStyle → exit (unmount 直前の visual)
 * - exitedStyle → initial (mount 直後の visual)
 * - enteringStyle は entered と同義の動的 state で motion では中間 frame に当たるため未使用
 *   (旧実装でも entering と entered で同じ style を返すケースが多く、 視覚差は無視可能)
 */
const NijisTransition: React.FC<NounsTransitionProps> = props => {
  const { children = <></>, show, timeout = 200, transitionStyes, onClick, className = '' } = props;

  const durationSec = timeout / 1000;

  // CSSProperties の static shape を motion の TargetAndTransition 型に寄せる
  // (旧 transitionStyes は値が plain CSS なので runtime には互換、 型のみ unsafe cast)
  const initial = transitionStyes.exitedStyle as TargetAndTransition;
  const animate = transitionStyes.enteredStyle as TargetAndTransition;
  const exit = transitionStyes.exitingStyle as TargetAndTransition;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={className}
          onClick={onClick}
          initial={initial}
          animate={animate}
          exit={exit}
          transition={{ duration: durationSec }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NijisTransition;
