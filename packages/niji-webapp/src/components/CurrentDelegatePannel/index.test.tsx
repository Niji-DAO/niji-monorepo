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

  it('renders exactly 1 short-address element', () => {
    useAccountMock.mockReturnValue({ address: '0xACCOUNT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: '0xDELEGATE' });
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    expect(container.querySelectorAll('[data-testid="short"]').length).toBe(1);
  });

  it('repeated update clicks invoke onPrimary N times', () => {
    useAccountMock.mockReturnValue({ address: '0xACCOUNT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const onPri = vi.fn();
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={onPri} onSecondaryBtnClick={() => {}} />,
    );
    const buttons = container.querySelectorAll('button');
    fireEvent.click(buttons[1]);
    fireEvent.click(buttons[1]);
    expect(onPri).toHaveBeenCalledTimes(2);
  });

  it('renders Update Delegate button text', () => {
    useAccountMock.mockReturnValue({ address: '0xACCOUNT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons[1]?.textContent).toContain('Update');
  });

  it('renders Close button text', () => {
    useAccountMock.mockReturnValue({ address: '0xACCOUNT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons[0]?.textContent).toContain('Close');
  });

  it('account=null still falls back to "0x"', () => {
    useAccountMock.mockReturnValue({ address: null });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0x');
  });

  it('rerender from delegate to no delegate falls to account', () => {
    useAccountMock.mockReturnValue({ address: '0xACCOUNT' });
    useReadNijiTokenDelegatesMock.mockReturnValueOnce({ data: '0xDELEGATE' });
    const { container, rerender } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0xDELEGATE');
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    rerender(<CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />);
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0xACCOUNT');
  });

  it('h1 title text is exact "Delegation"', () => {
    useAccountMock.mockReturnValue({ address: '0xACCOUNT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    expect(container.querySelector('h1')?.textContent).toBe('Delegation');
  });

  it('close button does not fire onPrimary', () => {
    useAccountMock.mockReturnValue({ address: '0xACCOUNT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const onPri = vi.fn();
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={onPri} onSecondaryBtnClick={() => {}} />,
    );
    fireEvent.click(container.querySelectorAll('button')[0]);
    expect(onPri).not.toHaveBeenCalled();
  });

  it('update button does not fire onSecondary', () => {
    useAccountMock.mockReturnValue({ address: '0xACCOUNT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const onSec = vi.fn();
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={onSec} />,
    );
    fireEvent.click(container.querySelectorAll('button')[1]);
    expect(onSec).not.toHaveBeenCalled();
  });

  it('multiple instances render with own h1', () => {
    useAccountMock.mockReturnValue({ address: '0xACCOUNT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <>
        <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />
        <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />
      </>,
    );
    expect(container.querySelectorAll('h1').length).toBe(2);
  });

  it('different account address renders independently', () => {
    useAccountMock.mockReturnValueOnce({ address: '0xACCOUNT1' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const { container, rerender } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0xACCOUNT1');
    useAccountMock.mockReturnValue({ address: '0xACCOUNT2' });
    rerender(<CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />);
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0xACCOUNT2');
  });

  it('rerender from no delegate to delegate switches display', () => {
    useAccountMock.mockReturnValue({ address: '0xACCOUNT' });
    useReadNijiTokenDelegatesMock.mockReturnValueOnce({ data: undefined });
    const { container, rerender } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0xACCOUNT');
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: '0xDELEGATE' });
    rerender(<CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />);
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0xDELEGATE');
  });

  it('rapid 5 close clicks invoke onSecondary 5 times', () => {
    useAccountMock.mockReturnValue({ address: '0xACCOUNT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const onSec = vi.fn();
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={onSec} />,
    );
    const close = container.querySelectorAll('button')[0];
    for (let i = 0; i < 5; i++) fireEvent.click(close);
    expect(onSec).toHaveBeenCalledTimes(5);
  });

  it('h1 element renders inside wrapper div', () => {
    useAccountMock.mockReturnValue({ address: '0xACCOUNT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    expect(container.querySelector('div h1')).not.toBeNull();
  });

  it('button labels Close + Update Delegate render correctly', () => {
    useAccountMock.mockReturnValue({ address: '0xACCOUNT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons[0]?.textContent).toContain('Close');
    expect(buttons[1]?.textContent).toContain('Update');
  });

  it('short-address mock renders address verbatim', () => {
    useAccountMock.mockReturnValue({ address: '0xVERBATIM' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0xVERBATIM');
  });

  it('renders 3 instances each independently', () => {
    useAccountMock.mockReturnValue({ address: '0xUSER' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: '0xDELEG' });
    const { container } = render(
      <>
        <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />
        <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />
        <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />
      </>,
    );
    expect(container.querySelectorAll('[data-testid="short"]').length).toBe(3);
  });

  it('rerender with new account does not crash', () => {
    useAccountMock.mockReturnValue({ address: '0xA' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: '0xDELEG' });
    const { rerender } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    useAccountMock.mockReturnValue({ address: '0xB' });
    expect(() =>
      rerender(
        <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
      ),
    ).not.toThrow();
  });

  it('renders without crash when delegate data is undefined', () => {
    useAccountMock.mockReturnValue({ address: '0xA' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    expect(() =>
      render(<CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />),
    ).not.toThrow();
  });

  it('multiple instances render without crash', () => {
    useAccountMock.mockReturnValue({ address: '0xA' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: '0xDELEG' });
    expect(() =>
      render(
        <>
          <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />
          <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />
        </>,
      ),
    ).not.toThrow();
  });

  it('renders without crash with account undefined', () => {
    useAccountMock.mockReturnValue({ address: undefined });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: '0xDELEG' });
    expect(() =>
      render(<CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />),
    ).not.toThrow();
  });

  it('renders 10 instances independently', () => {
    useAccountMock.mockReturnValue({ address: '0xA' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: '0xDELEG' });
    expect(() =>
      render(
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <CurrentDelegatePannel
              key={i}
              onPrimaryBtnClick={() => {}}
              onSecondaryBtnClick={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender with different delegate data', () => {
    useAccountMock.mockReturnValue({ address: '0xA' });
    useReadNijiTokenDelegatesMock.mockReturnValueOnce({ data: '0xDELEG1' });
    const { rerender } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: '0xDELEG2' });
    expect(() =>
      rerender(
        <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
      ),
    ).not.toThrow();
  });

  it('renders consecutive 5 times', () => {
    useAccountMock.mockReturnValue({ address: '0xA' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    for (let i = 0; i < 5; i++) {
      expect(() =>
        render(
          <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
        ),
      ).not.toThrow();
    }
  });

  it('renders consistent h1 title across rerenders', () => {
    useAccountMock.mockReturnValue({ address: '0xA' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const { container, rerender } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    expect(container.querySelector('h1')?.textContent).toBe('Delegation');
    rerender(<CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />);
    expect(container.querySelector('h1')?.textContent).toBe('Delegation');
  });

  it('account null + delegate null shows 0x placeholder', () => {
    useAccountMock.mockReturnValue({ address: undefined });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0x');
  });

  it('renders 30 instances each independently', () => {
    useAccountMock.mockReturnValue({ address: '0xA' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: '0xDELEG' });
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <CurrentDelegatePannel
              key={i}
              onPrimaryBtnClick={() => {}}
              onSecondaryBtnClick={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender all combinations of account/delegate', () => {
    const cases = [
      { addr: '0xA', delegate: '0xDELEG' },
      { addr: '0xA', delegate: undefined },
      { addr: undefined, delegate: undefined },
      { addr: '0xB', delegate: '0xDELEG2' },
    ];
    useAccountMock.mockReturnValue({ address: cases[0].addr });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: cases[0].delegate });
    const { rerender } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    cases.slice(1).forEach(c => {
      useAccountMock.mockReturnValue({ address: c.addr });
      useReadNijiTokenDelegatesMock.mockReturnValue({ data: c.delegate });
      expect(() =>
        rerender(
          <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
        ),
      ).not.toThrow();
    });
  });

  it('rapid 30 close button clicks invoke handler 30 times', () => {
    useAccountMock.mockReturnValue({ address: '0xA' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const onSec = vi.fn();
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={onSec} />,
    );
    const buttons = container.querySelectorAll('button');
    for (let i = 0; i < 30; i++) fireEvent.click(buttons[0]);
    expect(onSec).toHaveBeenCalledTimes(30);
  });

  it('rapid 30 primary clicks invoke handler 30 times', () => {
    useAccountMock.mockReturnValue({ address: '0xA' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const onPri = vi.fn();
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={onPri} onSecondaryBtnClick={() => {}} />,
    );
    const buttons = container.querySelectorAll('button');
    for (let i = 0; i < 30; i++) fireEvent.click(buttons[1]);
    expect(onPri).toHaveBeenCalledTimes(30);
  });

  it('h1 title element preserved across rerenders', () => {
    useAccountMock.mockReturnValue({ address: '0xA' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: '0xDELEG' });
    const { container, rerender } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    expect(container.querySelector('h1')).not.toBeNull();
    rerender(<CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />);
    expect(container.querySelector('h1')).not.toBeNull();
  });

  it('renders 50 CurrentDelegatePannel instances independently', () => {
    useAccountMock.mockReturnValue({ address: '0xA' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: '0xDELEG' });
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <CurrentDelegatePannel
              key={i}
              onPrimaryBtnClick={() => {}}
              onSecondaryBtnClick={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 100 secondary clicks invoke onSec 100 times', () => {
    useAccountMock.mockReturnValue({ address: '0xA' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const onSec = vi.fn();
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={onSec} />,
    );
    const buttons = container.querySelectorAll('button');
    for (let i = 0; i < 100; i++) fireEvent.click(buttons[0]);
    expect(onSec).toHaveBeenCalledTimes(100);
  });

  it('rerender 30 times preserves h1 + buttons', () => {
    useAccountMock.mockReturnValue({ address: '0xA' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: '0xDELEG' });
    const { container, rerender } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
    );
    for (let i = 0; i < 30; i++) {
      rerender(
        <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
      );
      expect(container.querySelector('h1')).not.toBeNull();
      expect(container.querySelectorAll('button').length).toBe(2);
    }
  });

  it('handles 50 different delegate addresses consecutively', () => {
    useAccountMock.mockReturnValue({ address: '0xA' });
    for (let i = 0; i < 50; i++) {
      useReadNijiTokenDelegatesMock.mockReturnValue({ data: `0xDELEG${i}` });
      expect(() =>
        render(
          <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
        ),
      ).not.toThrow();
    }
  });

  it('handles unicode delegate address', () => {
    useAccountMock.mockReturnValue({ address: undefined });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: '0xABCあいう' });
    expect(() =>
      render(<CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />),
    ).not.toThrow();
  });

  it('mount-unmount 50 cycles', () => {
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
      );
      unmount();
    }
  });

  it('renders 200 instances without crash', () => {
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <CurrentDelegatePannel
              key={i}
              onPrimaryBtnClick={() => {}}
              onSecondaryBtnClick={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different delegate addresses sequentially', () => {
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    for (let i = 0; i < 30; i++) {
      useReadNijiTokenDelegatesMock.mockReturnValue({
        data: '0x' + i.toString(16).padStart(40, '0'),
      });
      expect(() =>
        render(
          <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
        ),
      ).not.toThrow();
    }
  });

  it('rapid 100 onPrimary clicks', () => {
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const onPri = vi.fn();
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={onPri} onSecondaryBtnClick={() => {}} />,
    );
    const buttons = container.querySelectorAll('button');
    for (let i = 0; i < 100; i++) fireEvent.click(buttons[1]);
    expect(onPri).toHaveBeenCalledTimes(100);
  });

  it('handles all 4 account/delegate combinations', () => {
    [
      { acct: '0xA', del: '0xD' },
      { acct: '0xA', del: undefined },
      { acct: undefined, del: '0xD' },
      { acct: undefined, del: undefined },
    ].forEach(({ acct, del }) => {
      useAccountMock.mockReturnValue({ address: acct });
      useReadNijiTokenDelegatesMock.mockReturnValue({ data: del });
      expect(() =>
        render(
          <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
        ),
      ).not.toThrow();
    });
  });

  it('mount-unmount 100 cycles', () => {
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
      );
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <CurrentDelegatePannel
              key={i}
              onPrimaryBtnClick={() => {}}
              onSecondaryBtnClick={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 500 onSecondary clicks', () => {
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const onSec = vi.fn();
    const { container } = render(
      <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={onSec} />,
    );
    const buttons = container.querySelectorAll('button');
    for (let i = 0; i < 500; i++) fireEvent.click(buttons[0]);
    expect(onSec).toHaveBeenCalledTimes(500);
  });

  it('handles 100 different sdk delegate addresses', () => {
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    for (let i = 0; i < 100; i++) {
      useReadNijiTokenDelegatesMock.mockReturnValue({
        data: '0x' + i.toString(16).padStart(40, '0'),
      });
      const { unmount } = render(
        <CurrentDelegatePannel onPrimaryBtnClick={() => {}} onSecondaryBtnClick={() => {}} />,
      );
      unmount();
    }
  });

  it('all 50 instances render h1 + 2 buttons', () => {
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useReadNijiTokenDelegatesMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <CurrentDelegatePannel
            key={i}
            onPrimaryBtnClick={() => {}}
            onSecondaryBtnClick={() => {}}
          />
        ))}
      </>,
    );
    expect(container.querySelectorAll('h1').length).toBe(50);
    expect(container.querySelectorAll('button').length).toBe(100);
  });
});
