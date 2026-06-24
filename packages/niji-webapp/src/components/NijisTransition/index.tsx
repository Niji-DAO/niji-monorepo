import React from 'react';

import { AnimatePresence, motion, type Transition } from 'motion/react';

export interface TransitionStyles {
  enteringStyle: React.CSSProperties;
  enteredStyle: React.CSSProperties;
  exitingStyle: React.CSSProperties;
  exitedStyle: React.CSSProperties;
}

export interface NounsTransitionProps {
  children?: React.ReactNode;
  nodeRef?: React.MutableRefObject<null>;
  show: boolean;
  transitionStyes: TransitionStyles;
  timeout?: number;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
}

const buildMotionTransition = (timeout: number): Transition => ({
  duration: timeout / 1000,
});

/**
 * Higher-order util component wrapping motion (Framer Motion) to keep the same
 * 4-phase CSS style API while moving off react-transition-group.
 *
 * The 4 phases map to motion states as:
 *   - exitedStyle  → initial / exit
 *   - enteredStyle → animate
 *   - enteringStyle / exitingStyle → represented by the transition window
 *     between the initial / exit and animate states (handled by motion).
 */
const NijisTransition: React.FC<NounsTransitionProps> = props => {
  const {
    children = <></>,
    show,
    timeout = 200,
    transitionStyes,
    onClick = () => {},
    className = '',
  } = props;

  const motionTransition = buildMotionTransition(timeout);

  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          onClick={onClick}
          className={className}
          initial={transitionStyes.exitedStyle as Record<string, unknown>}
          animate={transitionStyes.enteredStyle as Record<string, unknown>}
          exit={transitionStyes.exitedStyle as Record<string, unknown>}
          transition={motionTransition}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NijisTransition;
