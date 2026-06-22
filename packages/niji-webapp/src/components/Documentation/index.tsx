import { Trans } from '@lingui/react/macro';
import { Col } from 'react-bootstrap';
import Accordion from 'react-bootstrap/Accordion';

import Link from '@/components/Link';
import Section from '@/layout/Section';
import { cn } from '@/lib/utils';

import { AboutHeader, AboutSection } from './AboutSection';
import { ArtAndTraitsSection } from './ArtAndTraitsSection';
import classes from './Documentation.module.css';
import { GovernanceSection } from './GovernanceSection';
import { NijidersRewardSection } from './NijidersRewardSection';

interface DocumentationProps {
  backgroundColor?: string;
}

const Documentation = (props: DocumentationProps = { backgroundColor: '#FFF' }) => {
  const cryptopunksLink = (
    <Link text={<Trans>CryptoPunks</Trans>} url="https://cryptopunks.app/" leavesPage={true} />
  );
  const playgroundLink = (
    <Link text={<Trans>Playground</Trans>} url="/playground" leavesPage={false} />
  );
  const publicDomainLink = (
    <Link
      text={<Trans>public domain</Trans>}
      url="https://creativecommons.org/publicdomain/zero/1.0/"
      leavesPage={true}
    />
  );
  const compoundGovLink = (
    <Link
      text={<Trans>Compound Governance</Trans>}
      url="https://compound.finance/governance"
      leavesPage={true}
    />
  );

  return (
    <Section
      fullWidth={false}
      className={cn(classes.documentationSection, '-mb-10 sm:-mb-20')}
      style={{ background: props.backgroundColor }}
    >
      <Col lg={{ span: 10, offset: 1 }}>
        <AboutHeader cryptopunksLink={cryptopunksLink} playgroundLink={playgroundLink} />
        <Accordion flush>
          <AboutSection publicDomainLink={publicDomainLink} compoundGovLink={compoundGovLink} />
          <GovernanceSection />
          <ArtAndTraitsSection playgroundLink={playgroundLink} />
          <NijidersRewardSection />
        </Accordion>
      </Col>
    </Section>
  );
};

export default Documentation;
