import { Trans } from '@lingui/react/macro';
import { Col } from 'react-bootstrap';

import calendar_noun from '@/assets/calendar_noun.png';
import LegacyNoun from '@/components/LegacyNoun';
import Section from '@/layout/Section';

const Banner = () => {
  return (
    <Section fullWidth={false}>
      <Col lg={6}>
        <div className="[&>h1]:font-londrina max-[992px]:p-8 [&>h1]:text-[5rem] max-[992px]:[&>h1]:text-[3.75rem] min-[992px]:[&>h1]:ml-8 min-[992px]:[&>h1]:text-[6rem]">
          <h1>
            <Trans>ONE NOUN,</Trans>
            <br />
            <Trans>EVERY DAY,</Trans>
            <br />
            <Trans>FOREVER.</Trans>
          </h1>
        </div>
      </Col>
      <Col lg={6}>
        <div style={{ padding: '2rem' }}>
          <LegacyNoun imgPath={calendar_noun} alt="noun" />
        </div>
      </Col>
    </Section>
  );
};

export default Banner;
