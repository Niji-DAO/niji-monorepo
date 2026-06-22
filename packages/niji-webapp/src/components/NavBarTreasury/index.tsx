import React from 'react';

import { i18n } from '@lingui/core';
import { Trans } from '@lingui/react/macro';

import { NavBarButtonStyle } from '../NavBarButton';

interface NavBarTreasuryProps {
  treasuryBalance: string;
  treasuryStyle: NavBarButtonStyle;
}

const WRAPPER_CLASS =
  "h-10 rounded-[10px] border border-black/10 px-[10px] py-0 font-['PT_Root_UI'] text-[16px] font-bold shadow-none transition-all duration-[125ms] ease-in-out max-[400px]:-ml-2 max-[400px]:pl-[6px] max-[400px]:pr-[7px]";
const BUTTON_CLASS = 'flex h-full w-full flex-row items-center justify-center hover:cursor-pointer';
const TREASURY_HEADER_CLASS = 'ml-1 mr-[0.4rem] mt-[1px] text-[16px] opacity-50 max-[400px]:hidden';
const TREASURY_BALANCE_CLASS = 'ml-[0.4rem] mr-1 text-[16.5px] tracking-[0.3px]';
const WARM_INFO_CLASS =
  'border-[color:var(--brand-warm-border)] text-[color:var(--brand-warm-light-text)] hover:bg-[color:var(--brand-warm-accent)] hover:!text-black';
const COOL_INFO_CLASS =
  'border-[color:var(--brand-cool-border)] text-[color:var(--brand-cool-dark-text)] hover:bg-[color:var(--brand-cool-accent)] hover:text-black';
const WHITE_INFO_CLASS = 'bg-white hover:bg-[#e2e3e8]';

const NavBarTreasury: React.FC<NavBarTreasuryProps> = ({ treasuryBalance, treasuryStyle }) => {
  let treasuryStyleClass;
  switch (treasuryStyle) {
    case NavBarButtonStyle.WARM_INFO:
      treasuryStyleClass = WARM_INFO_CLASS;
      break;
    case NavBarButtonStyle.COOL_INFO:
      treasuryStyleClass = COOL_INFO_CLASS;
      break;
    case NavBarButtonStyle.WHITE_INFO:
    default:
      treasuryStyleClass = WHITE_INFO_CLASS;
      break;
  }

  return (
    <div className={`${WRAPPER_CLASS} ${treasuryStyleClass}`}>
      <div className={BUTTON_CLASS}>
        <div
          className="d-flex justify-content-around flex-row"
          style={{
            paddingTop: '1px',
          }}
        >
          <div className={TREASURY_HEADER_CLASS}>
            <Trans>Treasury</Trans>
          </div>
          <div className={TREASURY_BALANCE_CLASS}>Ξ {i18n.number(Number(treasuryBalance))}</div>
        </div>
      </div>
    </div>
  );
};

export default NavBarTreasury;
