import { Trans, useLingui } from '@lingui/react/macro';
import { Col } from 'react-bootstrap';
import Accordion from 'react-bootstrap/Accordion';

import Link from '@/components/Link';
import Section from '@/layout/Section';
import { humanizeTraitKey, NijiImageData, nijiTraitKeys } from '@/lib/nijiAssets';
import { cn } from '@/lib/utils';

import classes from './Documentation.module.css';

interface DocumentationProps {
  backgroundColor?: string;
}

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

const Documentation = (props: DocumentationProps = { backgroundColor: '#FFF' }) => {
  const { t } = useLingui();
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
        <div className={classes.headerWrapper}>
          <h1>
            <Trans>WTF?</Trans>
          </h1>
          <p className={classes.aboutText}>
            <Trans>
              Nijis are an experimental attempt to improve the formation of on-chain avatar
              communities. While projects such as {cryptopunksLink} have attempted to bootstrap
              digital community and identity, Nijis attempt to bootstrap identity, community,
              governance, and a treasury that can be used by the community.
            </Trans>
          </p>
          <p className={classes.aboutText} style={{ paddingBottom: '4rem' }}>
            <Trans>
              Learn more below, or start creating Nijis off-chain using the {playgroundLink}.
            </Trans>
          </p>
        </div>
        <Accordion flush>
          <Accordion.Item eventKey="0" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>
              <Trans>Summary</Trans>
            </Accordion.Header>
            <Accordion.Body>
              <ul>
                <li>
                  <Trans>Niji artwork is in the {publicDomainLink}.</Trans>
                </li>
                <li>
                  <Trans>One Niji is trustlessly auctioned every 24 hours, forever.</Trans>
                </li>
                <li>
                  <Trans>100% of Niji auction proceeds are trustlessly sent to the treasury.</Trans>
                </li>
                <li>
                  <Trans>Settlement of one auction kicks off the next.</Trans>
                </li>
                <li>
                  <Trans>All Nijis are members of Niji DAO.</Trans>
                </li>
                <li>
                  <Trans>Niji DAO uses a fork of {compoundGovLink}.</Trans>
                </li>
                <li>
                  <Trans>One Niji is equal to one vote.</Trans>
                </li>
                <li>
                  <Trans>The treasury is controlled exclusively by Nijis via governance.</Trans>
                </li>
                <li>
                  <Trans>Artwork is generative and stored directly on-chain (not IPFS).</Trans>
                </li>
                <li>
                  <Trans>
                    No explicit rules exist for attribute scarcity; all Nijis are equally rare.
                  </Trans>
                </li>
                <li>
                  <Trans>
                    Nounders receive rewards in the form of Nijis (10% of supply for first 5 years).
                  </Trans>
                </li>
              </ul>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="1" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>
              <Trans>Daily Auctions</Trans>
            </Accordion.Header>
            <Accordion.Body>
              <p className={classes.aboutText}>
                <Trans>
                  The Niji Auction Contract will act as a self-sufficient Niji generation and
                  distribution mechanism, auctioning one Niji every 24 hours, forever. 100% of
                  auction proceeds (ETH) are automatically deposited in the Niji DAO treasury, where
                  they are governed by Niji owners.
                </Trans>
              </p>

              <p className={classes.aboutText}>
                <Trans>
                  Each time an auction is settled, the settlement transaction will also cause a new
                  Niji to be minted and a new 24 hour auction to begin.{' '}
                </Trans>
              </p>
              <p>
                <Trans>
                  While settlement is most heavily incentivized for the winning bidder, it can be
                  triggered by anyone, allowing the system to trustlessly auction Nijis as long as
                  Ethereum is operational and there are interested bidders.
                </Trans>
              </p>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>
              <Trans>Niji DAO</Trans>
            </Accordion.Header>
            <Accordion.Body>
              <Trans>
                Niji DAO utilizes a fork of {compoundGovLink} and is the main governing body of the
                Niji ecosystem. The Niji DAO treasury receives 100% of ETH proceeds from daily Niji
                auctions. Each Niji is an irrevocable member of Niji DAO and entitled to one vote in
                all governance matters. Niji votes are non-transferable (if you sell your Niji the
                vote goes with it) but delegatable, which means you can assign your vote to someone
                else as long as you own your Niji.
              </Trans>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="3" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>
              <Trans>Niji DUNA</Trans>
            </Accordion.Header>
            <Accordion.Body>
              <p>
                <Trans>
                  Niji DUNA is a legally recognized Decentralized Unincorporated Nonprofit
                  Association established in Wyoming via{' '}
                  <Link text="Proposal 727" url="https://nouns.wtf/vote/727" leavesPage={true} />{' '}
                  designed to provide a robust legal framework that aligns with the decentralized
                  nature of Niji DAO. This structure allows Niji DAO to operate with limited
                  liability protection and legal clarity without compromising its decentralized
                  governance ethos.
                </Trans>
              </p>
              <p>
                <Trans>
                  Under Wyoming&apos;s DUNA Act, Niji DAO can hold assets, enter into contracts, and
                  participate in legal actions in its own name. Governance remains fully
                  decentralized, with decisions controlled exclusively by Niji holders via on-chain
                  voting. This enables Niji DAO to sustainably fund projects, manage its treasury,
                  and interact confidently within both the digital and physical worlds.
                </Trans>
              </p>
              <p>
                <Trans>
                  By adopting the DUNA model, Niji DAO sets a pioneering example for DAOs seeking to
                  balance decentralized autonomy with legal certainty, further solidifying its
                  position at the forefront of decentralized governance innovation.
                </Trans>
              </p>
              <Link
                text={t`Learn more about the DUNA`}
                url="https://a16zcrypto.com/posts/article/duna-for-daos/"
                leavesPage={true}
              />
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="4" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>
              <Trans>Governance ‘Slow Start’</Trans>
            </Accordion.Header>
            <Accordion.Body>
              <p>
                <Trans>
                  The proposal veto right was initially envisioned as a temporary solution to the
                  problem of ‘51% attacks’ on the Niji DAO treasury. While Nounders initially
                  believed that a healthy distribution of Nijis would be sufficient protection for
                  the DAO, a more complete understanding of the incentives and risks has led to
                  general consensus within the Nounders, the Niji Foundation, and the wider
                  community that a more robust game-theoretic solution should be implemented before
                  the right is removed.
                </Trans>
              </p>
              <p>
                <Trans>
                  The Niji community has undertaken a preliminary exploration of proposal veto
                  alternatives (‘rage quit’ etc.), but it is now clear that this is a difficult
                  problem that will require significantly more research, development and testing
                  before a satisfactory solution can be implemented.
                </Trans>
              </p>
              <p>
                <Trans>
                  Consequently, the Niji Foundation anticipates being the steward of the veto power
                  until Niji DAO is ready to implement an alternative, and therefore wishes to
                  clarify the conditions under which it would exercise this power.
                </Trans>
              </p>
              <p>
                <Trans>
                  The Niji Foundation considers the veto an emergency power that should not be
                  exercised in the normal course of business. The Niji Foundation will veto
                  proposals that introduce non-trivial legal or existential risks to the Niji DAO or
                  the Niji Foundation, including (but not necessarily limited to) proposals that:
                </Trans>
              </p>
              <ul>
                <li>
                  <Trans>unequally withdraw the treasury for personal gain</Trans>
                </li>
                <li>
                  <Trans>
                    bribe voters to facilitate withdraws of the treasury for personal gain
                  </Trans>
                </li>
                <li>
                  <Trans>
                    attempt to alter Niji auction cadence for the purpose of maintaining or
                    acquiring a voting majority
                  </Trans>
                </li>
                <li>
                  <Trans>
                    make upgrades to critical smart contracts without undergoing an audit
                  </Trans>
                </li>
              </ul>
              <p>
                <Trans>
                  There are unfortunately no algorithmic solutions for making these determinations
                  in advance (if there were, the veto would not be required), and proposals must be
                  considered on a case by case basis.
                </Trans>
              </p>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="5" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>
              <Trans>Niji Traits</Trans>
            </Accordion.Header>
            <Accordion.Body>
              <p>
                <Trans>
                  Nijis are generated randomly based Ethereum block hashes. There are no
                  &apos;if&apos; statements or other rules governing Niji trait scarcity, which
                  makes all Nijis equally rare. As of this writing, Nijis are made up of:
                </Trans>
              </p>
              <NounTraits />
              <Trans>
                You can experiment with off-chain Niji generation at the {playgroundLink}.
              </Trans>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="6" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>
              <Trans>On-Chain Artwork</Trans>
            </Accordion.Header>
            <Accordion.Body>
              <p>
                <Trans>
                  Nijis are stored directly on Ethereum and do not utilize pointers to other
                  networks such as IPFS. This is possible because Niji parts are compressed and
                  stored on-chain using a custom run-length encoding (RLE), which is a form of
                  lossless compression.
                </Trans>
              </p>

              <p>
                <Trans>
                  The compressed parts are efficiently converted into a single base64 encoded SVG
                  image on-chain. To accomplish this, each part is decoded into an intermediate
                  format before being converted into a series of SVG rects using batched, on-chain
                  string concatenation. Once the entire SVG has been generated, it is base64
                  encoded.
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
                  The Niji Seeder contract is used to determine Niji traits during the minting
                  process. The seeder contract can be replaced to allow for future trait generation
                  algorithm upgrades. Additionally, it can be locked by the Niji DAO to prevent any
                  future updates. Currently, Niji traits are determined using pseudo-random number
                  generation:
                </Trans>
              </p>
              <code className="mb-2 mt-6 block">
                keccak256(abi.encodePacked(blockhash(block.number - 1), nounId))
              </code>
              <p>
                <Trans>
                  Trait generation is not truly random. Traits can be predicted when minting a Niji
                  on the pending block.
                </Trans>
              </p>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="8" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>
              <Trans>Nounder&apos;s Reward</Trans>
            </Accordion.Header>
            <Accordion.Body>
              <p>
                <Trans>
                  &apos;Nounders&apos; are the group of ten builders that initiated Niji. Here are
                  the Nounders:
                </Trans>
              </p>
              <ul>
                <li>
                  <Link
                    text="@cryptoseneca"
                    url="https://twitter.com/cryptoseneca"
                    leavesPage={true}
                  />
                </li>
                <li>
                  <Link text="@gremplin" url="https://twitter.com/gremplin" leavesPage={true} />
                </li>
                <li>
                  <Link text="@punk4156" url="https://twitter.com/punk4156" leavesPage={true} />
                </li>
                <li>
                  <Link text="@eboyarts" url="https://twitter.com/eBoyArts" leavesPage={true} />
                </li>
                <li>
                  <Link text="@punk4464" url="https://twitter.com/punk4464" leavesPage={true} />
                </li>
                <li>
                  <Link
                    text="@_solimander_"
                    url="https://twitter.com/_solimander_"
                    leavesPage={true}
                  />
                </li>
                <li>
                  <Link text="@dhof" url="https://twitter.com/dhof" leavesPage={true} />
                </li>
                <li>
                  <Link text="@devcarrot" url="https://twitter.com/carrot_init" leavesPage={true} />
                </li>
                <li>
                  <Link text="@TimpersHD" url="https://twitter.com/TimpersHD" leavesPage={true} />
                </li>
                <li>
                  <Link
                    text="@lastpunk9999"
                    url="https://twitter.com/lastpunk9999"
                    leavesPage={true}
                  />
                </li>
              </ul>
              <p>
                <Trans>
                  Because 100% of Niji auction proceeds are sent to Niji DAO, Nounders have chosen
                  to compensate themselves with Nijis. Every 10th Niji for the first 5 years of the
                  project (Niji ids #0, #10, #20, #30 and so on) will be automatically sent to the
                  Nounder&apos;s multisig to be vested and shared among the founding members of the
                  project.
                </Trans>
              </p>
              <p>
                <Trans>
                  Nounder distributions don&apos;t interfere with the cadence of 24 hour auctions.
                  Nijis are sent directly to the Nounder&apos;s Multisig, and auctions continue on
                  schedule with the next available Niji ID.
                </Trans>
              </p>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Col>
    </Section>
  );
};
export default Documentation;
