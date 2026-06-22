import React from 'react';

import { Col } from 'react-bootstrap';

interface AuctionTitleAndNavWrapperProps {
  children: React.ReactNode;
}

const AuctionTitleAndNavWrapper: React.FC<AuctionTitleAndNavWrapperProps> = props => {
  return (
    <Col lg={12} className="flex max-[992px]:[&_h1]:text-[2.75rem]">
      {props.children}
    </Col>
  );
};
export default AuctionTitleAndNavWrapper;
