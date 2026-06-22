import { Trans } from '@lingui/react/macro';
import Accordion from 'react-bootstrap/Accordion';

import Link from '@/components/Link';

import classes from './Documentation.module.css';

const NIJIDERS: ReadonlyArray<{ handle: string; url: string }> = [
  { handle: '@cryptoseneca', url: 'https://twitter.com/cryptoseneca' },
  { handle: '@gremplin', url: 'https://twitter.com/gremplin' },
  { handle: '@punk4156', url: 'https://twitter.com/punk4156' },
  { handle: '@eboyarts', url: 'https://twitter.com/eBoyArts' },
  { handle: '@punk4464', url: 'https://twitter.com/punk4464' },
  { handle: '@_solimander_', url: 'https://twitter.com/_solimander_' },
  { handle: '@dhof', url: 'https://twitter.com/dhof' },
  { handle: '@devcarrot', url: 'https://twitter.com/carrot_init' },
  { handle: '@TimpersHD', url: 'https://twitter.com/TimpersHD' },
  { handle: '@lastpunk9999', url: 'https://twitter.com/lastpunk9999' },
];

export function NijidersRewardSection() {
  return (
    <Accordion.Item eventKey="8" className={classes.accordionItem}>
      <Accordion.Header className={classes.accordionHeader}>
        <Trans>Nijider&apos;s Reward</Trans>
      </Accordion.Header>
      <Accordion.Body>
        <p>
          <Trans>
            &apos;Nijiders&apos; are the group of ten builders that initiated Niji. Here are the
            Nijiders:
          </Trans>
        </p>
        <ul>
          {NIJIDERS.map(({ handle, url }) => (
            <li key={handle}>
              <Link text={handle} url={url} leavesPage={true} />
            </li>
          ))}
        </ul>
        <p>
          <Trans>
            Because 100% of Niji auction proceeds are sent to Niji DAO, Nijiders have chosen to
            compensate themselves with Nijis. Every 10th Niji for the first 5 years of the project
            (Niji ids #0, #10, #20, #30 and so on) will be automatically sent to the Nijider&apos;s
            multisig to be vested and shared among the founding members of the project.
          </Trans>
        </p>
        <p>
          <Trans>
            Nijider distributions don&apos;t interfere with the cadence of 24 hour auctions. Nijis
            are sent directly to the Nijider&apos;s Multisig, and auctions continue on schedule with
            the next available Niji ID.
          </Trans>
        </p>
      </Accordion.Body>
    </Accordion.Item>
  );
}
