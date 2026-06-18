import React from 'react';

import { Trans } from '@lingui/react/macro';

import _AddressIcon from '@/assets/icons/Address.svg';
import _BidsIcon from '@/assets/icons/Bids.svg';
import NijiInfoRowButton from '@/components/NijiInfoRowButton';
import NijiInfoRowHolder from '@/components/NijiInfoRowHolder';
import { nijiTokenAddress } from '@/contracts';
import { useAppSelector } from '@/hooks';
import { buildEtherscanTokenLink } from '@/utils/etherscan';
import { defaultChain } from '@/wagmi';

interface NijiInfoCardProps {
  nounId: bigint;
  bidHistoryOnClickHandler: () => void;
}

const NijiInfoCard: React.FC<NijiInfoCardProps> = props => {
  const { nounId, bidHistoryOnClickHandler } = props;
  const chainId = defaultChain.id;

  const etherscanButtonClickHandler = () =>
    window.open(buildEtherscanTokenLink(nijiTokenAddress[chainId], Number(nounId)));

  const lastAuctionNounId = useAppSelector(state => state.onDisplayAuction.lastAuctionNounId);

  return (
    <>
      <NijiInfoRowHolder nounId={nounId} className="mb-3" />

      <NijiInfoRowButton
        iconImgSource={_BidsIcon}
        btnText={
          lastAuctionNounId !== undefined && BigInt(lastAuctionNounId) === nounId ? (
            <Trans>Bids</Trans>
          ) : (
            <Trans>Bid history</Trans>
          )
        }
        onClickHandler={bidHistoryOnClickHandler}
      />
      <NijiInfoRowButton
        iconImgSource={_AddressIcon}
        btnText={<Trans>Etherscan</Trans>}
        onClickHandler={etherscanButtonClickHandler}
      />
    </>
  );
};

export default NijiInfoCard;
