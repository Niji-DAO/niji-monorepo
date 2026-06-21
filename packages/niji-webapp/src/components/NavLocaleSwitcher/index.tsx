import React, { HTMLAttributes, useState } from 'react';

import { Trans } from '@lingui/react/macro';
import clsx from 'clsx';
import { useAtom } from 'jotai/react';
import { Check, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { Dropdown } from 'react-bootstrap';

import LanguageSelectionModal from '@/components/LanguageSelectionModal';
import NavBarButton, { NavBarButtonStyle } from '@/components/NavBarButton';
import { activeLocaleAtom } from '@/i18n/activeLocaleAtom';
import { LOCALE_LABEL, SUPPORTED_LOCALES, SupportedLocale } from '@/i18n/locales';
import { usePickByStateColor } from '@/utils/colorResponsiveUIUtils';

import classes from './NavLocalSwitcher.module.css';

import navDropdownClasses from '@/components/NavBar/NavBarDropdown.module.css';
import responsiveUiUtilsClasses from '@/utils/ResponsiveUIUtils.module.css';

interface NavLocalSwitcherProps {
  buttonStyle?: NavBarButtonStyle;
}

type CustomMenuProps = {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  labeledBy?: string;
};

const CustomMenu = ({
  ref,
  children,
  style,
  className,
  labeledBy,
}: CustomMenuProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
  return (
    <div ref={ref} style={style} className={className} aria-labelledby={labeledBy}>
      {children}
    </div>
  );
};

CustomMenu.displayName = 'CustomMenu';

const NavLocaleSwitcher: React.FC<NavLocalSwitcherProps> = props => {
  const { buttonStyle } = props;

  const [buttonUp, setButtonUp] = useState(false);
  const [showLanguagePickerModal, setShowLanguagePickerModal] = useState(false);
  const [activeLocale, setActiveLocale] = useAtom(activeLocaleAtom);

  const statePrimaryButtonClass = usePickByStateColor(
    navDropdownClasses.whiteInfo,
    navDropdownClasses.coolInfo,
    navDropdownClasses.warmInfo,
  );

  const stateSelectedDropdownClass = usePickByStateColor(
    navDropdownClasses.whiteInfoSelected,
    navDropdownClasses.dropdownActive,
    navDropdownClasses.dropdownActive,
  );

  const buttonStyleTop = usePickByStateColor(
    navDropdownClasses.whiteInfoSelectedTop,
    navDropdownClasses.coolInfoSelected,
    navDropdownClasses.warmInfoSelected,
  );

  const buttonStyleBottom = usePickByStateColor(
    navDropdownClasses.whiteInfoSelectedBottom,
    navDropdownClasses.coolInfoSelected,
    navDropdownClasses.warmInfoSelected,
  );

  const customDropdownToggle = ({
    ref,
    onClick,
  }: HTMLAttributes<HTMLDivElement> & { ref?: React.RefObject<HTMLDivElement | null> }) => (
    <>
      <div
        ref={ref}
        className={clsx(
          navDropdownClasses.wrapper,
          buttonUp ? stateSelectedDropdownClass : statePrimaryButtonClass,
        )}
        onClick={e => {
          e.preventDefault();
          onClick?.(e);
        }}
      >
        <div className={navDropdownClasses.button}>
          <div className={navDropdownClasses.dropdownBtnContent}>
            <Globe className="inline-block h-4 w-4" />
          </div>
          <div className={buttonUp ? navDropdownClasses.arrowUp : navDropdownClasses.arrowDown}>
            {buttonUp ? (
              <ChevronUp className="inline-block h-4 w-4" />
            ) : (
              <ChevronDown className="inline-block h-4 w-4" />
            )}{' '}
          </div>
        </div>
      </div>
    </>
  );

  customDropdownToggle.displayName = 'CustomDropdownToggle';

  return (
    <>
      {showLanguagePickerModal && (
        <LanguageSelectionModal onDismiss={() => setShowLanguagePickerModal(false)} />
      )}

      <div
        className={clsx(navDropdownClasses.nounsNavLink, responsiveUiUtilsClasses.mobileOnly)}
        onClick={() => setShowLanguagePickerModal(true)}
      >
        <NavBarButton
          buttonText={<Trans>Language</Trans>}
          buttonIcon={<Globe className="h-4 w-4" />}
          buttonStyle={buttonStyle}
        />
      </div>

      <Dropdown
        className={clsx(navDropdownClasses.nounsNavLink, responsiveUiUtilsClasses.desktopOnly)}
        onToggle={() => setButtonUp(!buttonUp)}
        autoClose={true}
      >
        <Dropdown.Toggle as={customDropdownToggle} id="dropdown-custom-components" />
        <Dropdown.Menu className={`${navDropdownClasses.desktopDropdown} `} as={CustomMenu}>
          {SUPPORTED_LOCALES.map((locale: SupportedLocale, index: number) => {
            let dropDownStyle;
            let buttonStyle;

            switch (index) {
              case 0:
                dropDownStyle = classes.dropDownTop;
                buttonStyle = buttonStyleTop;
                break;
              case SUPPORTED_LOCALES.length - 1:
                dropDownStyle = classes.dropDownBottom;
                buttonStyle = buttonStyleBottom;
                break;
              default:
                dropDownStyle = classes.dropDownInterior;
                buttonStyle = buttonStyleBottom;
            }

            return (
              <div
                key={locale}
                className={clsx(
                  navDropdownClasses.button,
                  navDropdownClasses.dropdownPrimaryText,
                  buttonStyle,
                  dropDownStyle,
                  classes.desktopLanguageButton,
                )}
                onClick={() => setActiveLocale(locale)}
              >
                {LOCALE_LABEL[locale]}
                {activeLocale === locale && <Check height={24} width={24} />}
              </div>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};

export default NavLocaleSwitcher;
