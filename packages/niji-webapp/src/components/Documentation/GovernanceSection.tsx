import { Trans } from '@lingui/react/macro';
import Accordion from 'react-bootstrap/Accordion';

import classes from './Documentation.module.css';

export function GovernanceSection() {
  return (
    <Accordion.Item eventKey="4" className={classes.accordionItem}>
      <Accordion.Header className={classes.accordionHeader}>
        <Trans>Governance ‘Slow Start’</Trans>
      </Accordion.Header>
      <Accordion.Body>
        <p>
          <Trans>
            The proposal veto right was initially envisioned as a temporary solution to the problem
            of ‘51% attacks’ on the Niji DAO treasury. While Nijiders initially believed that a
            healthy distribution of Nijis would be sufficient protection for the DAO, a more
            complete understanding of the incentives and risks has led to general consensus within
            the Nijiders, the Niji Foundation, and the wider community that a more robust
            game-theoretic solution should be implemented before the right is removed.
          </Trans>
        </p>
        <p>
          <Trans>
            The Niji community has undertaken a preliminary exploration of proposal veto
            alternatives (‘rage quit’ etc.), but it is now clear that this is a difficult problem
            that will require significantly more research, development and testing before a
            satisfactory solution can be implemented.
          </Trans>
        </p>
        <p>
          <Trans>
            Consequently, the Niji Foundation anticipates being the steward of the veto power until
            Niji DAO is ready to implement an alternative, and therefore wishes to clarify the
            conditions under which it would exercise this power.
          </Trans>
        </p>
        <p>
          <Trans>
            The Niji Foundation considers the veto an emergency power that should not be exercised
            in the normal course of business. The Niji Foundation will veto proposals that introduce
            non-trivial legal or existential risks to the Niji DAO or the Niji Foundation, including
            (but not necessarily limited to) proposals that:
          </Trans>
        </p>
        <ul>
          <li>
            <Trans>unequally withdraw the treasury for personal gain</Trans>
          </li>
          <li>
            <Trans>bribe voters to facilitate withdraws of the treasury for personal gain</Trans>
          </li>
          <li>
            <Trans>
              attempt to alter Niji auction cadence for the purpose of maintaining or acquiring a
              voting majority
            </Trans>
          </li>
          <li>
            <Trans>make upgrades to critical smart contracts without undergoing an audit</Trans>
          </li>
        </ul>
        <p>
          <Trans>
            There are unfortunately no algorithmic solutions for making these determinations in
            advance (if there were, the veto would not be required), and proposals must be
            considered on a case by case basis.
          </Trans>
        </p>
      </Accordion.Body>
    </Accordion.Item>
  );
}
