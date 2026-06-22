import React from 'react';

import { Trans } from '@lingui/react/macro';
import { useReadNijiTokenDelegates } from '@niji/sdk/react';
import { useAccount } from 'wagmi';

import NavBarButton, { NavBarButtonStyle } from '@/components/NavBarButton';
import ShortAddress from '@/components/ShortAddress';
import { formatShortAddress } from '@/utils/addressAndENSDisplayUtils';

const WRAPPER_CLASS =
  'max-[992px]:flex max-[992px]:h-full max-[992px]:flex-col max-[992px]:justify-between';
const HEADER_CLASS = 'pt-4 px-3';
export const TITLE_CLASS =
  'flex flex-col font-londrina text-[42px] h-8 leading-[42px] text-[color:var(--brand-cool-dark-text)]';
export const COPY_CLASS =
  "font-['PT_Root_UI'] font-medium text-[color:var(--brand-cool-dark-text)] [&_.emph]:font-bold";
const CONTENT_WRAPPER_CLASS = 'flex justify-between rounded-[14px] bg-white p-4';
const CURRENT_CLASS = 'mt-4 text-[18px] font-medium text-[color:var(--brand-cool-light-text)]';
const DELEGATE_INFO_WRAPPER_CLASS = 'flex flex-col';
const ENS_CLASS = 'flex flex-row text-[26px] text-[color:var(--brand-cool-dark-text)]';
const SHORT_ADDRESS_CLASS =
  'text-right text-[16px] font-medium text-[color:var(--brand-cool-light-text)]';
const BUTTON_WRAPPER_CLASS = 'mt-2 flex justify-between max-[992px]:mb-4';

interface CurrentDelegatePannelProps {
  onPrimaryBtnClick: (e: React.MouseEvent<HTMLElement>) => void;
  onSecondaryBtnClick: (e: React.MouseEvent<HTMLElement>) => void;
}

const CurrentDelegatePannel: React.FC<CurrentDelegatePannelProps> = ({
  onPrimaryBtnClick,
  onSecondaryBtnClick,
}) => {
  const { address: maybeAccount } = useAccount();
  const { data: delegate } = useReadNijiTokenDelegates();
  const account = delegate ?? maybeAccount ?? '0x';
  const shortAccount = formatShortAddress(account);

  return (
    <div className={WRAPPER_CLASS}>
      <div>
        <div className={HEADER_CLASS}>
          <h1 className={TITLE_CLASS}>
            <Trans>Delegation</Trans>
          </h1>

          <p className={COPY_CLASS}>
            <Trans>
              Noun votes are not transferable, but are <span className="emph">delegatable</span>,
              which means you can assign your vote to someone else as long as you own your Noun.
            </Trans>
          </p>
        </div>

        <div className={CONTENT_WRAPPER_CLASS}>
          <div className={CURRENT_CLASS}>
            <Trans>Current Delegate</Trans>
          </div>
          <div className={DELEGATE_INFO_WRAPPER_CLASS}>
            <div className={ENS_CLASS}>
              <ShortAddress address={account} avatar={true} size={39} />
            </div>
            <div className={SHORT_ADDRESS_CLASS}>{shortAccount}</div>
          </div>
        </div>
      </div>

      <div className={BUTTON_WRAPPER_CLASS}>
        <NavBarButton
          buttonText={<Trans>Close</Trans>}
          buttonStyle={NavBarButtonStyle.DELEGATE_BACK}
          onClick={onSecondaryBtnClick}
        />
        <NavBarButton
          buttonText={<Trans>Update Delegate</Trans>}
          buttonStyle={NavBarButtonStyle.DELEGATE_PRIMARY}
          onClick={onPrimaryBtnClick}
        />
      </div>
    </div>
  );
};

export default CurrentDelegatePannel;
