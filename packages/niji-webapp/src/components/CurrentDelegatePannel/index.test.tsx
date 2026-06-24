import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const useAccountMock = vi.fn();
const useReadNijiTokenDelegatesMock = vi.fn();
vi.mock('wagmi', () => ({
  useAccount: () => useAccountMock(),
}));
vi.mock('@niji/sdk/react', () => ({
  useReadNijiTokenDelegates: () => useReadNijiTokenDelegatesMock(),
}));

vi.mock('@/components/ShortAddress', () => ({
  default: ({ address }: { address: string }) => <span data-testid="short">{address}</span>,
}));

vi.mock('@/components/NavBarButton', () => {
  const NavBarButtonStyle = {
    DELEGATE_BACK: 'back',
    DELEGATE_PRIMARY: 'primary',
  };
  const NavBarButton = ({
    buttonText,
    onClick,
  }: {
    buttonText: React.ReactNode;
    buttonStyle: string;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
  }) => <button onClick={onClick}>{buttonText}</button>;
  return { default: NavBarButton, NavBarButtonStyle };
});

import CurrentDelegatePannel from './index';

describe('CurrentDelegatePannel', () => {
  it('uses delegate from sdk when available', () => {
    useAccountMock.mockReturnValue({ address: '0xACCOUNT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: '0xDELEGATE' });
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0xDELEGATE');
  });

  it('falls back to connected account when no delegate', () => {
    useAccountMock.mockReturnValue({ address: '0xACCOUNT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0xACCOUNT');
  });

  it('falls back to "0x" placeholder when no account + no delegate', () => {
    useAccountMock.mockReturnValue({ address: undefined });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0x');
  });

  it('fires onSecondaryBtnClick on Close button click', () => {
    useAccountMock.mockReturnValue({ address: '0xACCOUNT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const onSec = vi.fn();
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={onSec} />,
    );
    const buttons = container.querySelectorAll('button');
    fireEvent.click(buttons[0]);
    expect(onSec).toHaveBeenCalledTimes(1);
  });

  it('fires onPrimaryBtnClick on Update Delegate button click', () => {
    useAccountMock.mockReturnValue({ address: '0xACCOUNT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const onPri = vi.fn();
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={onPri} onSecondaryBtnClick={() => {}} />,
    );
    const buttons = container.querySelectorAll('button');
    fireEvent.click(buttons[1]);
    expect(onPri).toHaveBeenCalledTimes(1);
  });

  it('renders Delegation title', () => {
    useAccountMock.mockReturnValue({ address: '0xACCOUNT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    expect(container.querySelector('h1')?.textContent).toBe('Delegation');
  });

  it('delegate prefers sdk data even when account is set (sdk wins)', () => {
    useAccountMock.mockReturnValue({ address: '0xACCOUNT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: '0xDELEGATE' });
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0xDELEGATE');
    expect(container.querySelector('[data-testid="short"]')?.textContent).not.toBe('0xACCOUNT');
  });

  it('repeated close clicks invoke onSecondary multiple times', () => {
    useAccountMock.mockReturnValue({ address: '0xACCOUNT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const onSec = vi.fn();
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={onSec} />,
    );
    const buttons = container.querySelectorAll('button');
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[0]);
    expect(onSec).toHaveBeenCalledTimes(3);
  });

  it('renders exactly 1 h1 element', () => {
    useAccountMock.mockReturnValue({ address: '0xACCOUNT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    expect(container.querySelectorAll('h1').length).toBe(1);
  });

  it('renders exactly 2 buttons (Close + Update)', () => {
    useAccountMock.mockReturnValue({ address: '0xACCOUNT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  it('accepts mixed-case delegate address verbatim', () => {
    useAccountMock.mockReturnValue({ address: undefined });
    useReadNijiTokenDelegatesMock.mockReturnValue({
      data: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
    });
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe(
      '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
    );
  });
});
