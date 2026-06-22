import React from 'react';

import nounPointerImg from '@/assets/noun-pointer.png';
import TruncatedAmount from '@/components/TruncatedAmount';

interface MinBidProps {
  minBid: bigint;
  onClick: () => void;
}

const MinBid: React.FC<MinBidProps> = ({ minBid, onClick }) => {
  return (
    <div className="mt-4 flex" onClick={onClick}>
      <img src={nounPointerImg} alt="Pointer noun" />
      <h3 className="font-londrina ml-4 cursor-pointer text-xl font-normal text-[color:var(--brand-black)]">
        You must bid at least {!!minBid && <TruncatedAmount amount={minBid} />}
      </h3>
    </div>
  );
};
export default MinBid;
