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
});
