import React, { HTMLAttributes, useState } from 'react';

import clsx from 'clsx';
import { Dropdown } from 'react-bootstrap';

import NavBarButton, { NavBarButtonStyle } from '@/components/NavBarButton';
import { usePickByState } from '@/utils/colorResponsiveUIUtils';

import navDropdownClasses from '@/components/NavBar/NavBarDropdown.module.css';
import responsiveUiUtilsClasses from '@/utils/ResponsiveUIUtils.module.css';

const NAV_DROPDOWN_WRAPPER_CLASS =
  "h-10 rounded-[10px] p-0 font-['PT_Root_UI'] text-[16px] font-bold leading-[16px] shadow-none transition-all duration-[125ms] ease-in-out";
const NAV_DROPDOWN_MENU_CLASS =
  'm-0 overflow-hidden rounded-[10px] border border-black/10 p-0 !left-[5px] [&_a]:block [&_a]:border-0 [&_a]:border-b-[1.5px] [&_a]:border-b-[#e2e3e8] [&_a]:rounded-none [&_a]:px-4 [&_a]:py-2 [&_a]:font-bold [&_a]:text-[rgb(95,95,95)] [&_a]:!no-underline [&_a:last-child]:!border-none hover:[&_a]:bg-white';

interface NavDropDownProps {
  buttonStyle?: NavBarButtonStyle;
  buttonIcon?: React.ReactNode;
  buttonText: string;
  children: React.ReactNode;
}

const NavDropDown: React.FC<NavDropDownProps> = props => {
  const { buttonStyle } = props;

  const [buttonUp, setButtonUp] = useState(false);

  const statePrimaryButtonClass = usePickByState(
    navDropdownClasses.whiteInfo,
    navDropdownClasses.coolInfo,
    navDropdownClasses.warmInfo,
  );

  const stateSelectedDropdownClass = usePickByState(
    navDropdownClasses.whiteInfoSelected,
    navDropdownClasses.dropdownActive,
    navDropdownClasses.dropdownActive,
  );

  const customDropdownToggle = ({
    ref,
    onClick,
  }: HTMLAttributes<HTMLDivElement> & { ref?: React.RefObject<HTMLDivElement | null> }) => (
    <>
      <div
        ref={ref}
        className={NAV_DROPDOWN_WRAPPER_CLASS}
        onClick={e => {
          e.preventDefault();
          onClick?.(e);
        }}
      >
        <NavBarButton
          buttonText={props.buttonText}
          buttonIcon={props.buttonIcon}
          buttonStyle={buttonStyle}
          isDropdown={true}
          isButtonUp={buttonUp}
        />
      </div>
    </>
  );

  customDropdownToggle.displayName = 'CustomDropdownToggle';

  return (
    <>
      <Dropdown
        className={clsx(navDropdownClasses.nounsNavLink, responsiveUiUtilsClasses.desktopOnly)}
        onToggle={() => setButtonUp(!buttonUp)}
        autoClose={true}
      >
        <Dropdown.Toggle as={customDropdownToggle} id="dropdown" />
        <Dropdown.Menu
          className={clsx(
            NAV_DROPDOWN_MENU_CLASS,
            stateSelectedDropdownClass,
            buttonUp ? stateSelectedDropdownClass : statePrimaryButtonClass,
          )}
        >
          {props.children}
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};

export default NavDropDown;
