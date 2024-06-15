import { Trans } from '@lingui/macro';
import { Col, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import dlFromAppStoreImg from '../../assets/download-on-app-store.svg';
import nounsIosGif from '../../assets/nouns-ios.gif';
import Section from '../../layout/Section';
import classes from './NounsIntroSection.module.css';

const NounsIntroSection = () => {
  const prophouseLink = (
    <a
      href="https://prop.house/"
      target="_blank"
      rel="noreferrer"
      className={classes.nounsIntroLinks}
    >
      <Trans>Prop House</Trans>
    </a>
  );

  return (
    <>
      <Section fullWidth={false} className={classes.videoSection}>
        <Col lg={6}>
          <div className={classes.textWrapper}>
            <h1>
              <Trans>One Niji, Every Day, Forever.</Trans>
            </h1>
            <p>
              <Trans>
                Behold, an infinite work of art! Niji is a community-owned brand that makes a
                positive impact by funding ideas and fostering collaboration. From collectors and
                technologists, to non-profits and brands, Niji is for everyone.
              </Trans>
            </p>
          </div>
        </Col>
        <Col lg={6} className={classes.youtubeEmbedContainer}>
          <iframe
            src="https://www.youtube.com/embed/lOzCA7bZG_k"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>

          <small className={`${classes.videoSubtitle} ${classes.youtubeVideoSubtitle} text-muted`}>
            This video was commissioned in{' '}
            <Nav.Link as={Link} to="/vote/113">
              Prop 113
            </Nav.Link>{' '}
            <span className={classes.videoMintedSubtitle}>
              and minted in{' '}
              <Nav.Link as={Link} to="/vote/190">
                Prop 190
              </Nav.Link>
            </span>
          </small>
        </Col>
      </Section>
      <Section fullWidth={false} className={classes.videoSection}>
        <Col lg={6} className={`${classes.youtubeEmbedContainer} order-lg-1 order-2`}>
          <iframe
            src="https://www.youtube.com/embed/oa79nN4gMPs"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>

          <small className={`${classes.videoSubtitle} ${classes.youtubeVideoSubtitle} text-muted`}>
            This video was produced as part of{' '}
            <Nav.Link as={Link} to="/vote/143">
              Prop 143
            </Nav.Link>
          </small>
        </Col>

        <Col lg={6} className={`order-lg-2 order-1`}>
          <div className={`${classes.textWrapper} ${classes.youtubeSectionText}`}>
            <h1>
              <Trans>Build With Niji. Get Funded.</Trans>
            </h1>
            <p>
              <Trans>
                There's a way for everyone to get involved with Niji. From whimsical endeavors like
                naming a frog, to ambitious projects like constructing a giant float for the Rose
                Parade, or even crypto infrastructure like {prophouseLink}. Niji funds projects of
                all sizes and domains.
              </Trans>
            </p>
          </div>
        </Col>
      </Section>

      <Section fullWidth={false} className={classes.iosSection}>
        <Col lg={6}>
          <div className={classes.textWrapper}>
            <h1>
              <Trans>Download the Free iOS App</Trans>
            </h1>
            <p>
              <Trans>
                Every new Niji pushed right to your pocket! View the current auction, remix your own
                Niji, and explore the entire history directly from the app.
              </Trans>
              <br />
              <a
                href="https://apps.apple.com/us/app/nouns-explore-create-play/id1592583925"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={dlFromAppStoreImg}
                  className={classes.dlFromAppStoreImg}
                  alt="download nouns ios app from app store"
                />
              </a>
            </p>
          </div>
        </Col>
        <Col lg={6} className={classes.iosImgContainer}>
          <img src={nounsIosGif} className={classes.iosImg} alt="nouns ios" />
        </Col>
      </Section>
    </>
  );
};

export default NounsIntroSection;
