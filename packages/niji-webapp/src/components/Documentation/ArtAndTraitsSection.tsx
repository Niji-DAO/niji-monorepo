import { ReactNode } from 'react';

import { Trans } from '@lingui/react/macro';
import Accordion from 'react-bootstrap/Accordion';

import { humanizeTraitKey, NijiImageData, nijiTraitKeys } from '@/lib/nijiAssets';

import classes from './Documentation.module.css';

function NounTraits() {
  return (
    <ul>
      {nijiTraitKeys.map(traitKey => (
        <li key={traitKey}>
          <Trans>
            {humanizeTraitKey(traitKey)} ({NijiImageData.images[traitKey].length})
          </Trans>
        </li>
      ))}
    </ul>
  );
}

interface ArtAndTraitsSectionProps {
  playgroundLink: ReactNode;
}

export function ArtAndTraitsSection({ playgroundLink }: ArtAndTraitsSectionProps) {
  return (
    <>
      <Accordion.Item eventKey="5" className={classes.accordionItem}>
        <Accordion.Header className={classes.accordionHeader}>
          <Trans>Niji Traits</Trans>
        </Accordion.Header>
        <Accordion.Body>
          <p>
            <Trans>
              Nijis are generated randomly based Ethereum block hashes. There are no &apos;if&apos;
              statements or other rules governing Niji trait scarcity, which makes all Nijis equally
              rare. As of this writing, Nijis are made up of:
            </Trans>
          </p>
          <NounTraits />
          <Trans>You can experiment with off-chain Niji generation at the {playgroundLink}.</Trans>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="6" className={classes.accordionItem}>
        <Accordion.Header className={classes.accordionHeader}>
          <Trans>On-Chain Artwork</Trans>
        </Accordion.Header>
        <Accordion.Body>
          <p>
            <Trans>
              Nijis are stored directly on Ethereum and do not utilize pointers to other networks
              such as IPFS. This is possible because Niji parts are compressed and stored on-chain
              using a custom run-length encoding (RLE), which is a form of lossless compression.
            </Trans>
          </p>

          <p>
            <Trans>
              The compressed parts are efficiently converted into a single base64 encoded SVG image
              on-chain. To accomplish this, each part is decoded into an intermediate format before
              being converted into a series of SVG rects using batched, on-chain string
              concatenation. Once the entire SVG has been generated, it is base64 encoded.
            </Trans>
          </p>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="7" className={classes.accordionItem}>
        <Accordion.Header className={classes.accordionHeader}>
          <Trans>Niji Seeder Contract</Trans>
        </Accordion.Header>
        <Accordion.Body>
          <p>
            <Trans>
              The Niji Seeder contract is used to determine Niji traits during the minting process.
              The seeder contract can be replaced to allow for future trait generation algorithm
              upgrades. Additionally, it can be locked by the Niji DAO to prevent any future
              updates. Currently, Niji traits are determined using pseudo-random number generation:
            </Trans>
          </p>
          <code className="mb-2 mt-6 block">
            keccak256(abi.encodePacked(blockhash(block.number - 1), nounId))
          </code>
          <p>
            <Trans>
              Trait generation is not truly random. Traits can be predicted when minting a Niji on
              the pending block.
            </Trans>
          </p>
        </Accordion.Body>
      </Accordion.Item>
    </>
  );
}
