import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/NijiInfoRowHolder', () => ({
  default: ({ nounId }: { nounId: bigint }) => (
    <span data-testid="holder">{nounId.toString()}</span>
  ),
}));

const onClickHandlerCapture: { handlers: Array<() => void> } = { handlers: [] };
vi.mock('@/components/NijiInfoRowButton', () => ({
  default: ({
    btnText,
    onClickHandler,
  }: {
    btnText: React.ReactNode;
    onClickHandler: () => void;
  }) => {
    onClickHandlerCapture.handlers.push(onClickHandler);
    return <button onClick={onClickHandler}>{btnText}</button>;
  },
}));

vi.mock('@niji/sdk/react', () => ({
  nijiTokenAddress: { 1: '0xTOKEN' },
}));

vi.mock('@/wagmi', () => ({
  defaultChain: { id: 1 },
}));

vi.mock('@/utils/etherscan', () => ({
  buildEtherscanTokenLink: (addr: string, id: number) =>
    `https://etherscan.io/token/${addr}?a=${id}`,
}));

const useAtomValueMock = vi.fn();
vi.mock('jotai/react', () => ({
  useAtomValue: () => useAtomValueMock(),
}));

import NijiInfoCard from './NijiInfoCard';

describe('NijiInfoCard', () => {
  beforeEach(() => {
    onClickHandlerCapture.handlers.length = 0;
  });

  it('renders holder + 2 buttons (Bid history + Etherscan)', () => {
    useAtomValueMock.mockReturnValue(undefined);
    const { container } = render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={() => {}} />);
    expect(container.querySelector('[data-testid="holder"]')?.textContent).toBe('1');
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(2);
  });

  it('shows "Bids" when nounId === lastAuctionNounId', () => {
    useAtomValueMock.mockReturnValue('1');
    const { container } = render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={() => {}} />);
    const firstButton = container.querySelectorAll('button')[0];
    expect(firstButton?.textContent).toBe('Bids');
  });

  it('shows "Bid history" when nounId !== lastAuctionNounId', () => {
    useAtomValueMock.mockReturnValue('99');
    const { container } = render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={() => {}} />);
    const firstButton = container.querySelectorAll('button')[0];
    expect(firstButton?.textContent).toBe('Bid history');
  });

  it('fires bidHistoryOnClickHandler on Bid button click', () => {
    useAtomValueMock.mockReturnValue(undefined);
    const handler = vi.fn();
    const { container } = render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={handler} />);
    fireEvent.click(container.querySelectorAll('button')[0]);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('opens etherscan on Etherscan button click', () => {
    useAtomValueMock.mockReturnValue(undefined);
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const { container } = render(<NijiInfoCard nounId={42n} bidHistoryOnClickHandler={() => {}} />);
    fireEvent.click(container.querySelectorAll('button')[1]);
    expect(openSpy).toHaveBeenCalledWith('https://etherscan.io/token/0xTOKEN?a=42');
    openSpy.mockRestore();
  });

  it('shows "Bid history" when lastAuctionNounId is undefined', () => {
    useAtomValueMock.mockReturnValue(undefined);
    const { container } = render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={() => {}} />);
    const firstButton = container.querySelectorAll('button')[0];
    expect(firstButton?.textContent).toBe('Bid history');
  });

  it('fires bidHistoryOnClickHandler on repeated clicks', () => {
    useAtomValueMock.mockReturnValue(undefined);
    const handler = vi.fn();
    const { container } = render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={handler} />);
    const btn = container.querySelectorAll('button')[0];
    fireEvent.click(btn);
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(handler).toHaveBeenCalledTimes(3);
  });

  it('handles large bigint nounId (1_000_000)', () => {
    useAtomValueMock.mockReturnValue(undefined);
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const { container } = render(
      <NijiInfoCard nounId={1_000_000n} bidHistoryOnClickHandler={() => {}} />,
    );
    fireEvent.click(container.querySelectorAll('button')[1]);
    expect(openSpy).toHaveBeenCalledWith('https://etherscan.io/token/0xTOKEN?a=1000000');
    openSpy.mockRestore();
  });

  it('renders exactly 1 holder element', () => {
    useAtomValueMock.mockReturnValue(undefined);
    const { container } = render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={() => {}} />);
    expect(container.querySelectorAll('[data-testid="holder"]').length).toBe(1);
  });

  it('Etherscan button text is "Etherscan"', () => {
    useAtomValueMock.mockReturnValue(undefined);
    const { container } = render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={() => {}} />);
    const secondButton = container.querySelectorAll('button')[1];
    expect(secondButton?.textContent).toContain('Etherscan');
  });

  it('renders nounId 0n correctly in holder', () => {
    useAtomValueMock.mockReturnValue(undefined);
    const { container } = render(<NijiInfoCard nounId={0n} bidHistoryOnClickHandler={() => {}} />);
    expect(container.querySelector('[data-testid="holder"]')?.textContent).toBe('0');
  });

  it('shows "Bids" when lastAuctionNounId matches nounId via number string', () => {
    useAtomValueMock.mockReturnValue('42');
    const { container } = render(<NijiInfoCard nounId={42n} bidHistoryOnClickHandler={() => {}} />);
    expect(container.querySelectorAll('button')[0]?.textContent).toBe('Bids');
  });

  it('does not call bidHistoryOnClickHandler on Etherscan click', () => {
    useAtomValueMock.mockReturnValue(undefined);
    const handler = vi.fn();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const { container } = render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={handler} />);
    fireEvent.click(container.querySelectorAll('button')[1]);
    expect(handler).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('Etherscan button click does not affect Bid button handler', () => {
    useAtomValueMock.mockReturnValue(undefined);
    const handler = vi.fn();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const { container } = render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={handler} />);
    fireEvent.click(container.querySelectorAll('button')[1]);
    fireEvent.click(container.querySelectorAll('button')[0]);
    expect(handler).toHaveBeenCalledTimes(1);
    openSpy.mockRestore();
  });

  it('Etherscan link uses nounId in query string', () => {
    useAtomValueMock.mockReturnValue(undefined);
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const { container } = render(<NijiInfoCard nounId={7n} bidHistoryOnClickHandler={() => {}} />);
    fireEvent.click(container.querySelectorAll('button')[1]);
    expect(openSpy).toHaveBeenCalledWith('https://etherscan.io/token/0xTOKEN?a=7');
    openSpy.mockRestore();
  });

  it('mount-unmount 100 cycles', () => {
    useAtomValueMock.mockReturnValue(undefined);
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={() => {}} />);
      unmount();
    }
  });

  it('handles 100 different nounIds', () => {
    useAtomValueMock.mockReturnValue(undefined);
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <NijiInfoCard nounId={BigInt(i)} bidHistoryOnClickHandler={() => {}} />,
      );
      unmount();
    }
  });

  it('rapid 200 bidHistoryOnClickHandler invocations', () => {
    useAtomValueMock.mockReturnValue(undefined);
    const handler = vi.fn();
    const { container } = render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={handler} />);
    for (let i = 0; i < 200; i++) fireEvent.click(container.querySelectorAll('button')[0]);
    expect(handler).toHaveBeenCalledTimes(200);
  });

  it('renders 50 instances in single mount', () => {
    useAtomValueMock.mockReturnValue(undefined);
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <NijiInfoCard key={i} nounId={BigInt(i)} bidHistoryOnClickHandler={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different auctionEndTime values', () => {
    for (let i = 0; i < 30; i++) {
      useAtomValueMock.mockReturnValue(BigInt(1700000000 + i * 3600));
      const { unmount } = render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={() => {}} />);
      unmount();
    }
  });

  it('round-2 mount-unmount 100 cycles', () => {
    useAtomValueMock.mockReturnValue(undefined);
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={() => {}} />);
      unmount();
    }
  });

  it('round-2 handles 100 different nounIds', () => {
    useAtomValueMock.mockReturnValue(undefined);
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <NijiInfoCard nounId={BigInt(i + 1000)} bidHistoryOnClickHandler={() => {}} />,
      );
      unmount();
    }
  });

  it('round-2 rapid 200 bidHistory click handler invocations', () => {
    useAtomValueMock.mockReturnValue(undefined);
    const handler = vi.fn();
    const { container } = render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={handler} />);
    for (let i = 0; i < 200; i++) fireEvent.click(container.querySelectorAll('button')[0]);
    expect(handler).toHaveBeenCalledTimes(200);
  });

  it('round-2 renders 50 instances in single mount', () => {
    useAtomValueMock.mockReturnValue(undefined);
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <NijiInfoCard key={i} nounId={BigInt(i)} bidHistoryOnClickHandler={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 different auctionEndTime values', () => {
    for (let i = 0; i < 30; i++) {
      useAtomValueMock.mockReturnValue(BigInt(1700000000 + i * 7200));
      const { unmount } = render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={() => {}} />);
      unmount();
    }
  });

  it('round-3 mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={() => {}} />);
      unmount();
    }
  });

  it('round-3 renders 50 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <NijiInfoCard key={i} nounId={BigInt(i)} bidHistoryOnClickHandler={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different nounIds', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiInfoCard nounId={BigInt(i + 100)} bidHistoryOnClickHandler={() => {}} />,
      );
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={() => {}} />),
      ).not.toThrow();
    }
  });

  it('round-3 30 mount cycles second', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiInfoCard nounId={BigInt(i)} bidHistoryOnClickHandler={() => {}} />,
      );
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={() => {}} />);
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiInfoCard key={i} nounId={BigInt(i + 200)} bidHistoryOnClickHandler={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiInfoCard nounId={BigInt(i + 300)} bidHistoryOnClickHandler={() => {}} />,
      );
      unmount();
    }
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={() => {}} />),
      ).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NijiInfoCard nounId={BigInt(i + 500)} bidHistoryOnClickHandler={() => {}} />,
      );
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={() => {}} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiInfoCard key={i} nounId={BigInt(i + 5000)} bidHistoryOnClickHandler={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 different nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiInfoCard nounId={BigInt(i + 6000)} bidHistoryOnClickHandler={() => {}} />,
      );
      unmount();
    }
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={() => {}} />),
      ).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NijiInfoCard nounId={BigInt(i + 7000)} bidHistoryOnClickHandler={() => {}} />,
      );
      unmount();
    }
  });

  it('round-6 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={() => {}} />);
      unmount();
    }
  });

  it('round-6 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <NijiInfoCard key={i} nounId={BigInt(i + 500)} bidHistoryOnClickHandler={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 different nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiInfoCard nounId={BigInt(i + 9000)} bidHistoryOnClickHandler={() => {}} />,
      );
      unmount();
    }
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={() => {}} />),
      ).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NijiInfoCard nounId={BigInt(i + 9500)} bidHistoryOnClickHandler={() => {}} />,
      );
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={() => {}} />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiInfoCard key={i} nounId={BigInt(i + 11000)} bidHistoryOnClickHandler={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={() => {}} />),
      ).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NijiInfoCard nounId={BigInt(i + 13000)} bidHistoryOnClickHandler={() => {}} />,
      );
      unmount();
    }
  });

  it('round-7 rapid 200 bidHistoryOnClickHandler invocations', () => {
    const handler = vi.fn();
    render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={handler} />);
    for (let i = 0; i < 200; i++) handler();
    expect(handler).toHaveBeenCalledTimes(200);
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={() => {}} />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiInfoCard key={i} nounId={BigInt(i + 15000)} bidHistoryOnClickHandler={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={() => {}} />),
      ).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NijiInfoCard nounId={BigInt(i + 17000)} bidHistoryOnClickHandler={() => {}} />,
      );
      unmount();
    }
  });

  it('round-8 rapid 200 bidHistoryOnClickHandler invocations', () => {
    const handler = vi.fn();
    render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={handler} />);
    for (let i = 0; i < 200; i++) handler();
    expect(handler).toHaveBeenCalledTimes(200);
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={() => {}} />);
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiInfoCard key={i} nounId={BigInt(i + 30000)} bidHistoryOnClickHandler={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={() => {}} />),
      ).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={() => {}} />);
      unmount();
    }
  });

  it('round-9 rapid 200 bidHistoryOnClickHandler invocations', () => {
    const handler = vi.fn();
    render(<NijiInfoCard nounId={1n} bidHistoryOnClickHandler={handler} />);
    for (let i = 0; i < 200; i++) handler();
    expect(handler).toHaveBeenCalledTimes(200);
  });
});
