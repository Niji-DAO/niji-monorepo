import { useState } from 'react';

import { Trans } from '@lingui/react/macro';
import { nijiTreasuryAddress, useReadNijiTreasuryBalancesInEth } from '@niji/sdk/react';
import clsx from 'clsx';
import { ConnectKitButton } from 'connectkit';
import { useAtomValue } from 'jotai/react';
import { Droplet, File, House, Play, SquarePen, Users } from 'lucide-react';
import { Container, Dropdown, Nav, Navbar } from 'react-bootstrap';
import { Link, useLocation } from 'react-router';
import { formatEther } from 'viem';

import NogglesIcon from '@/assets/icons/Noggles.svg?react';
import nijiLogo from '@/assets/niji-lp/fav_180.png';
import NavBarButton, { NavBarButtonStyle } from '@/components/NavBarButton';
import NavBarTreasury from '@/components/NavBarTreasury';
import NavDropdown from '@/components/NavDropdown';
import NavLocaleSwitcher from '@/components/NavLocaleSwitcher';
import ShortAddress from '@/components/ShortAddress';
import config, { CHAIN_ID } from '@/config';
import { isCoolBackgroundAtom, stateBackgroundColorAtom } from '@/state/atoms/applicationAtom';
import { usePickByStateColor } from '@/utils/colorResponsiveUIUtils';
import { buildEtherscanAddressLink } from '@/utils/etherscan';
import { defaultChain } from '@/wagmi';
import { useIsDaoGteV3 } from '@/wrappers/nijiDao';

import classes from './NavBar.module.css';
import navDropdownClasses from './NavBarDropdown.module.css';

import responsiveUiUtilsClasses from '@/utils/ResponsiveUIUtils.module.css';

const NavBar = () => {
  const chainId = defaultChain.id;
  const isDaoGteV3 = useIsDaoGteV3();
  const stateBgColor = useAtomValue(stateBackgroundColorAtom);
  const isCool = useAtomValue(isCoolBackgroundAtom);
  const location = useLocation();
  const treasuryBalance = useReadNijiTreasuryBalancesInEth({
    query: {
      select: (data: { total: bigint }) => data.total,
    },
  }).data;
  const daoEtherscanLink = buildEtherscanAddressLink(nijiTreasuryAddress[chainId]);
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  const useStateBg =
    location.pathname === '/' ||
    location.pathname.includes('/niji/') ||
    location.pathname.includes('/auction/');

  const stateBasedButtonStyle = isCool ? NavBarButtonStyle.COOL_INFO : NavBarButtonStyle.WARM_INFO;

  const nonWalletButtonStyle = !useStateBg ? NavBarButtonStyle.WHITE_INFO : stateBasedButtonStyle;

  const closeNav = () => setIsNavExpanded(false);
  const buttonClasses = usePickByStateColor(
    navDropdownClasses.whiteInfoSelectedBottom,
    navDropdownClasses.coolInfoSelected,
    navDropdownClasses.warmInfoSelected,
  );
  const candidatesNavItem = config.featureToggles.candidates ? (
    <Dropdown.Item className={buttonClasses} href="/vote#candidates">
      <Trans>Candidates</Trans>
    </Dropdown.Item>
  ) : null;

  const v3DaoNavItem = (
    <NavDropdown
      buttonText="DAO"
      buttonIcon={<Users className="h-4 w-4" />}
      buttonStyle={nonWalletButtonStyle}
    >
      <Dropdown.Item
        className={clsx(
          usePickByStateColor(
            navDropdownClasses.whiteInfoSelectedBottom,
            navDropdownClasses.coolInfoSelected,
            navDropdownClasses.warmInfoSelected,
          ),
        )}
        href="/vote"
      >
        <Trans>Proposals</Trans>
      </Dropdown.Item>
      {candidatesNavItem}
    </NavDropdown>
  );

  return (
    <>
      <Navbar
        expand="xl"
        style={{ backgroundColor: `${useStateBg ? stateBgColor : 'white'}` }}
        className={classes.navBarCustom}
        // `expanded` を渡すと controlled mode になり、 React Bootstrap の expand="xl"
        // (1200px 以上で自動展開) が無効化される。 viewport 1440px の desktop でも
        // navbar-collapse が `visibility: collapse` で残ってしまい右半分が消える。
        // mobile toggle は Navbar.Toggle の onClick で setIsNavExpanded を呼び、
        // 表示状態は uncontrolled に bootstrap CSS query に委ねる方が安全。
      >
        <Container style={{ maxWidth: 'unset' }}>
          <div className={classes.brandAndTreasuryWrapper}>
            <Navbar.Brand as={Link} to="/" className={classes.navBarBrand}>
              <img src={nijiLogo} className={classes.navBarLogo} alt="Niji DAO" />
            </Navbar.Brand>
            <Nav.Item>
              {treasuryBalance !== undefined ? (
                <Nav.Link
                  href={daoEtherscanLink}
                  className={classes.nounsNavLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  <NavBarTreasury
                    treasuryBalance={Number(formatEther(treasuryBalance)).toFixed(0)}
                    treasuryStyle={nonWalletButtonStyle}
                  />
                </Nav.Link>
              ) : null}
            </Nav.Item>
          </div>
          <Navbar.Toggle
            className={classes.navBarToggle}
            aria-controls="basic-navbar-nav"
            onClick={() => setIsNavExpanded(!isNavExpanded)}
          />
          <Navbar.Collapse className="justify-content-end z-10">
            <div className={clsx(responsiveUiUtilsClasses.mobileOnly)}>
              {Number(CHAIN_ID) !== 1 && (
                <span className={classes.testnetBadge} aria-label="testnet">
                  TESTNET
                </span>
              )}
              <Nav.Link href="/lp/" className={classes.nounsNavLink} onClick={closeNav}>
                <NavBarButton
                  buttonText={<Trans>LP</Trans>}
                  buttonIcon={<House className="h-4 w-4" />}
                  buttonStyle={nonWalletButtonStyle}
                />
              </Nav.Link>
              {Number(CHAIN_ID) === 31337 && (
                <Nav.Link
                  as={Link}
                  to="/faucet"
                  className={classes.nounsNavLink}
                  onClick={closeNav}
                >
                  <NavBarButton
                    buttonText={<Trans>Faucet</Trans>}
                    buttonIcon={<Droplet className="h-4 w-4" />}
                    buttonStyle={nonWalletButtonStyle}
                  />
                </Nav.Link>
              )}
              <Nav.Link as={Link} to="/vote" className={classes.nounsNavLink} onClick={closeNav}>
                <NavBarButton
                  buttonText={isDaoGteV3 ? <Trans>Proposals</Trans> : <Trans>DAO</Trans>}
                  buttonIcon={<File className="h-4 w-4" />}
                  buttonStyle={nonWalletButtonStyle}
                />
              </Nav.Link>
              {isDaoGteV3 && (
                <>
                  {config.featureToggles.candidates && (
                    <Nav.Link
                      as={Link}
                      to="/vote#candidates"
                      className={classes.nounsNavLink}
                      onClick={closeNav}
                    >
                      <NavBarButton
                        buttonText={<Trans>Candidates</Trans>}
                        buttonIcon={<SquarePen className="h-4 w-4" />}
                        buttonStyle={nonWalletButtonStyle}
                      />
                    </Nav.Link>
                  )}
                </>
              )}
            </div>
            <div className={clsx(responsiveUiUtilsClasses.desktopOnly, classes.navGroupRow)}>
              {Number(CHAIN_ID) !== 1 && (
                <span className={classes.testnetBadge} aria-label="testnet">
                  TESTNET
                </span>
              )}
              <Nav.Link href="/lp/" className={classes.nounsNavLink}>
                <NavBarButton
                  buttonText={<Trans>LP</Trans>}
                  buttonIcon={<House className="h-4 w-4" />}
                  buttonStyle={nonWalletButtonStyle}
                />
              </Nav.Link>
              {Number(CHAIN_ID) === 31337 && (
                <Nav.Link as={Link} to="/faucet" className={classes.nounsNavLink}>
                  <NavBarButton
                    buttonText={<Trans>Faucet</Trans>}
                    buttonIcon={<Droplet className="h-4 w-4" />}
                    buttonStyle={nonWalletButtonStyle}
                  />
                </Nav.Link>
              )}
              {isDaoGteV3 ? (
                v3DaoNavItem
              ) : (
                <Nav.Link as={Link} to="/vote" className={classes.nounsNavLink} onClick={closeNav}>
                  <NavBarButton
                    buttonText={<Trans>DAO</Trans>}
                    buttonIcon={<Users className="h-4 w-4" />}
                    buttonStyle={nonWalletButtonStyle}
                  />
                </Nav.Link>
              )}
            </div>
            <div className={clsx(responsiveUiUtilsClasses.mobileOnly)}>
              <Nav.Link
                as={Link}
                to="/playground"
                className={classes.nounsNavLink}
                onClick={closeNav}
              >
                <NavBarButton
                  buttonText={<Trans>Playground</Trans>}
                  buttonIcon={<Play className="h-4 w-4" />}
                  buttonStyle={nonWalletButtonStyle}
                />
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/nijis"
                className={clsx(classes.nounsNavLink, classes.exploreButton)}
                onClick={closeNav}
              >
                <NavBarButton
                  buttonText={<Trans>Nijis</Trans>}
                  buttonIcon={<NogglesIcon />}
                  buttonStyle={nonWalletButtonStyle}
                />
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/traits"
                className={clsx(classes.nounsNavLink, classes.exploreButton)}
                onClick={closeNav}
              >
                <NavBarButton
                  buttonText={<Trans>Traits</Trans>}
                  buttonIcon={<NogglesIcon />}
                  buttonStyle={nonWalletButtonStyle}
                />
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/crystal-ball"
                className={clsx(classes.nounsNavLink, classes.exploreButton)}
                onClick={closeNav}
              >
                <NavBarButton
                  buttonText={<Trans>Crystal Ball</Trans>}
                  buttonIcon={<NogglesIcon />}
                  buttonStyle={nonWalletButtonStyle}
                />
              </Nav.Link>
            </div>
            <div className={clsx(responsiveUiUtilsClasses.desktopOnly)}>
              <NavDropdown
                buttonText="Explore"
                buttonIcon={<NogglesIcon />}
                buttonStyle={nonWalletButtonStyle}
              >
                <Dropdown.Item
                  className={clsx(
                    usePickByStateColor(
                      navDropdownClasses.whiteInfoSelectedBottom,
                      navDropdownClasses.coolInfoSelected,
                      navDropdownClasses.warmInfoSelected,
                    ),
                  )}
                  href="/nijis"
                >
                  <Trans>Nijis</Trans>
                </Dropdown.Item>
                <Dropdown.Item
                  className={clsx(
                    usePickByStateColor(
                      navDropdownClasses.whiteInfoSelectedBottom,
                      navDropdownClasses.coolInfoSelected,
                      navDropdownClasses.warmInfoSelected,
                    ),
                  )}
                  href="/traits"
                >
                  <Trans>Traits</Trans>
                </Dropdown.Item>
                <Dropdown.Item
                  className={clsx(
                    usePickByStateColor(
                      navDropdownClasses.whiteInfoSelectedBottom,
                      navDropdownClasses.coolInfoSelected,
                      navDropdownClasses.warmInfoSelected,
                    ),
                  )}
                  href="/playground"
                >
                  Playground
                </Dropdown.Item>
                <Dropdown.Item
                  className={clsx(
                    usePickByStateColor(
                      navDropdownClasses.whiteInfoSelectedBottom,
                      navDropdownClasses.coolInfoSelected,
                      navDropdownClasses.warmInfoSelected,
                    ),
                  )}
                  href="/crystal-ball"
                >
                  Crystal Ball 🔮
                </Dropdown.Item>
              </NavDropdown>
            </div>
            <NavLocaleSwitcher buttonStyle={nonWalletButtonStyle} />
            <ConnectKitButton.Custom>
              {({ isConnected, show, address }) => {
                if (!isConnected)
                  return (
                    <NavBarButton
                      buttonText="Connect"
                      buttonStyle={nonWalletButtonStyle}
                      onClick={show}
                    />
                  );
                return (
                  <NavBarButton
                    buttonText={<ShortAddress address={address!} avatar={true} size={24} />}
                    buttonStyle={nonWalletButtonStyle}
                    onClick={show}
                  />
                );
              }}
            </ConnectKitButton.Custom>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default NavBar;
