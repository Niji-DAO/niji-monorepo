import { ReactNode } from 'react';

import { Trans } from '@lingui/react/macro';
import Accordion from 'react-bootstrap/Accordion';

import Link from '@/components/Link';

import classes from './Documentation.module.css';

interface AboutSectionProps {
  cryptopunksLink: ReactNode;
  playgroundLink: ReactNode;
  publicDomainLink: ReactNode;
  compoundGovLink: ReactNode;
}

export function AboutHeader({
  cryptopunksLink,
  playgroundLink,
}: Pick<AboutSectionProps, 'cryptopunksLink' | 'playgroundLink'>) {
  return (
    <div className={classes.headerWrapper}>
      <h1>
        <Trans>WTF?</Trans>
      </h1>
      <p className={classes.aboutText}>
        <Trans>
          Nijis are an experimental attempt to improve the formation of on-chain avatar communities.
          While projects such as {cryptopunksLink} have attempted to bootstrap digital community and
          identity, Nijis attempt to bootstrap identity, community, governance, and a treasury that
          can be used by the community.
        </Trans>
      </p>
      <p className={classes.aboutText} style={{ paddingBottom: '4rem' }}>
        <Trans>
          Learn more below, or start creating Nijis off-chain using the {playgroundLink}.
        </Trans>
      </p>
    </div>
  );
}

export function AboutSection({
  publicDomainLink,
  compoundGovLink,
}: Pick<AboutSectionProps, 'publicDomainLink' | 'compoundGovLink'>) {
  return (
    <>
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
                Nijiders receive rewards in the form of Nijis (10% of supply for first 5 years).
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
              distribution mechanism, auctioning one Niji every 24 hours, forever. 100% of auction
              proceeds (ETH) are automatically deposited in the Niji DAO treasury, where they are
              governed by Niji owners.
            </Trans>
          </p>

          <p className={classes.aboutText}>
            <Trans>
              Each time an auction is settled, the settlement transaction will also cause a new Niji
              to be minted and a new 24 hour auction to begin.{' '}
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
            Niji DAO utilizes a fork of {compoundGovLink} and is the main governing body of the Niji
            ecosystem. The Niji DAO treasury receives 100% of ETH proceeds from daily Niji auctions.
            Each Niji is an irrevocable member of Niji DAO and entitled to one vote in all
            governance matters. Niji votes are non-transferable (if you sell your Niji the vote goes
            with it) but delegatable, which means you can assign your vote to someone else as long
            as you own your Niji.
          </Trans>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="3" className={classes.accordionItem}>
        <Accordion.Header className={classes.accordionHeader}>
          <Trans>Niji DUNA</Trans>
        </Accordion.Header>
        <Accordion.Body>
          <NijiDUNABody />
        </Accordion.Body>
      </Accordion.Item>
    </>
  );
}

function NijiDUNABody() {
  return (
    <>
      <p>
        <Trans>
          Niji DUNA is a legally recognized Decentralized Unincorporated Nonprofit Association
          established in Wyoming via{' '}
          <Link text="Proposal 727" url="https://nouns.wtf/vote/727" leavesPage={true} /> designed
          to provide a robust legal framework that aligns with the decentralized nature of Niji DAO.
          This structure allows Niji DAO to operate with limited liability protection and legal
          clarity without compromising its decentralized governance ethos.
        </Trans>
      </p>
      <p>
        <Trans>
          Under Wyoming&apos;s DUNA Act, Niji DAO can hold assets, enter into contracts, and
          participate in legal actions in its own name. Governance remains fully decentralized, with
          decisions controlled exclusively by Niji holders via on-chain voting. This enables Niji
          DAO to sustainably fund projects, manage its treasury, and interact confidently within
          both the digital and physical worlds.
        </Trans>
      </p>
      <p>
        <Trans>
          By adopting the DUNA model, Niji DAO sets a pioneering example for DAOs seeking to balance
          decentralized autonomy with legal certainty, further solidifying its position at the
          forefront of decentralized governance innovation.
        </Trans>
      </p>
      <Link
        text="Learn more about the DUNA"
        url="https://a16zcrypto.com/posts/article/duna-for-daos/"
        leavesPage={true}
      />
    </>
  );
}
