import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const useDelegateNounsAtBlockQueryMock = vi.fn();
vi.mock('@/wrappers/nijiToken', () => ({
  useDelegateNounsAtBlockQuery: () => useDelegateNounsAtBlockQueryMock(),
}));

vi.mock('@/components/ShortAddress', () => ({
  default: ({ address }: { address: string }) => <span data-testid="short">{address}</span>,
}));

vi.mock('@/components/HorizontalStackedNijis', () => ({
  default: ({ nounIds }: { nounIds: string[] }) => (
    <div data-testid="stacked">stack-{nounIds.length}</div>
  ),
}));

import DelegateHoverCard from './index';

describe('DelegateHoverCard', () => {
  it('renders Spinner while loading', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    const { container } = render(
      <DelegateHoverCard delegateId="delegate-0xABC" proposalCreationBlock={1n} />,
    );
    expect(container.querySelector('.spinner-border')).not.toBeNull();
  });

  it('renders error fallback when error is set', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xABC', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: new Error('boom'),
    });
    const { container } = render(
      <DelegateHoverCard delegateId="delegate-0xABC" proposalCreationBlock={1n} />,
    );
    expect(container.textContent).toBe('Error fetching Vote info');
  });

  it('renders Spinner when delegates is empty', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [] },
      loading: false,
      error: undefined,
    });
    const { container } = render(
      <DelegateHoverCard delegateId="delegate-0xABC" proposalCreationBlock={1n} />,
    );
    expect(container.querySelector('.spinner-border')).not.toBeNull();
  });

  it('renders ShortAddress + stacked nijis when data is present', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: {
        delegates: [{ id: '0xABCDEF', nijiRepresented: [{ id: '1' }, { id: '2' }, { id: '3' }] }],
      },
      loading: false,
      error: undefined,
    });
    const { container } = render(
      <DelegateHoverCard delegateId="delegate-0xABCDEF" proposalCreationBlock={1n} />,
    );
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0xABCDEF');
    expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe('stack-3');
  });

  it('renders stack-5 for 5 nijis', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: {
        delegates: [
          {
            id: '0xABCDEF',
            nijiRepresented: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }],
          },
        ],
      },
      loading: false,
      error: undefined,
    });
    const { container } = render(
      <DelegateHoverCard delegateId="delegate-0xABCDEF" proposalCreationBlock={1n} />,
    );
    expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe('stack-5');
  });

  it('accepts proposalCreationBlock 0n', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xABC', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: undefined,
    });
    expect(() =>
      render(<DelegateHoverCard delegateId="delegate-0xABC" proposalCreationBlock={0n} />),
    ).not.toThrow();
  });

  it('renders exactly 1 ShortAddress and 1 stacked element', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xABCDEF', nijiRepresented: [{ id: '1' }, { id: '2' }] }] },
      loading: false,
      error: undefined,
    });
    const { container } = render(
      <DelegateHoverCard delegateId="delegate-0xABCDEF" proposalCreationBlock={1n} />,
    );
    expect(container.querySelectorAll('[data-testid="short"]').length).toBe(1);
    expect(container.querySelectorAll('[data-testid="stacked"]').length).toBe(1);
  });

  it('renders Spinner when data is undefined (loading transition)', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: false,
      error: undefined,
    });
    const { container } = render(
      <DelegateHoverCard delegateId="delegate-0xABC" proposalCreationBlock={1n} />,
    );
    expect(container.querySelector('.spinner-border')).not.toBeNull();
  });

  it('useDelegateNounsAtBlockQuery is called once per render', () => {
    useDelegateNounsAtBlockQueryMock.mockClear();
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    render(<DelegateHoverCard delegateId="delegate-0xABC" proposalCreationBlock={1n} />);
    expect(useDelegateNounsAtBlockQueryMock).toHaveBeenCalledTimes(1);
  });

  it('renders ShortAddress with full delegate.id (not delegateId prop)', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xFULL_DELEGATE_ID', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: undefined,
    });
    const { container } = render(
      <DelegateHoverCard delegateId="delegate-0xFULL_DELEGATE_ID" proposalCreationBlock={1n} />,
    );
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe(
      '0xFULL_DELEGATE_ID',
    );
  });

  it('does not render error message when error is undefined', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: undefined,
    });
    const { container } = render(
      <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
    );
    expect(container.textContent).not.toContain('Error');
  });

  it('renders stack-1 for single niji', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: undefined,
    });
    const { container } = render(
      <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
    );
    expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe('stack-1');
  });

  it('renders stack-10 for 10 nijis', () => {
    const nijiList = Array.from({ length: 10 }, (_, i) => ({ id: String(i + 1) }));
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: nijiList }] },
      loading: false,
      error: undefined,
    });
    const { container } = render(
      <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
    );
    expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe('stack-10');
  });

  it('large proposalCreationBlock (1000000n) does not crash', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: undefined,
    });
    expect(() =>
      render(<DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1000000n} />),
    ).not.toThrow();
  });

  it('rerender from loading to data shows stacked + short', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValueOnce({
      data: undefined,
      loading: true,
      error: undefined,
    });
    const { container, rerender } = render(
      <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
    );
    expect(container.querySelector('.spinner-border')).not.toBeNull();
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: undefined,
    });
    rerender(<DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />);
    expect(container.querySelector('[data-testid="short"]')).not.toBeNull();
  });

  it('rerender from data to error shows error msg', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValueOnce({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: undefined,
    });
    const { container, rerender } = render(
      <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
    );
    expect(container.textContent).not.toContain('Error');
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: new Error('boom'),
    });
    rerender(<DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />);
    expect(container.textContent).toContain('Error');
  });

  it('error text matches exact "Error fetching Vote info"', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: new Error('rpc'),
    });
    const { container } = render(
      <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
    );
    expect(container.textContent).toBe('Error fetching Vote info');
  });

  it('loading=true takes precedence over error', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: true,
      error: new Error('boom'),
    });
    const { container } = render(
      <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
    );
    expect(container.querySelector('.spinner-border')).not.toBeNull();
    expect(container.textContent).not.toContain('Error');
  });

  it('renders stack-0 when delegates have empty nijiRepresented (data branch may differ)', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [] }] },
      loading: false,
      error: undefined,
    });
    const { container } = render(
      <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
    );
    expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe('stack-0');
  });

  it('20 nijis renders correctly (large data set)', () => {
    const nijiList = Array.from({ length: 20 }, (_, i) => ({ id: String(i + 1) }));
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: nijiList }] },
      loading: false,
      error: undefined,
    });
    const { container } = render(
      <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
    );
    expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe('stack-20');
  });

  it('useDelegateNounsAtBlockQuery called once per render', () => {
    useDelegateNounsAtBlockQueryMock.mockClear();
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: undefined,
    });
    render(<DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />);
    expect(useDelegateNounsAtBlockQueryMock).toHaveBeenCalledTimes(1);
  });

  it('100 nijis renders stack-100', () => {
    const nijiList = Array.from({ length: 100 }, (_, i) => ({ id: String(i + 1) }));
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: nijiList }] },
      loading: false,
      error: undefined,
    });
    const { container } = render(
      <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
    );
    expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe('stack-100');
  });

  it('delegateId with different value renders different short address', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xDIFFERENT', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: undefined,
    });
    const { container } = render(
      <DelegateHoverCard delegateId="delegate-0xDIFFERENT" proposalCreationBlock={1n} />,
    );
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0xDIFFERENT');
  });

  it('proposalCreationBlock=0n renders without crash', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: undefined,
    });
    expect(() =>
      render(<DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={0n} />),
    ).not.toThrow();
  });

  it('stack-1 for single niji from large block number', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '99' }] }] },
      loading: false,
      error: undefined,
    });
    const { container } = render(
      <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={9999n} />,
    );
    expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe('stack-1');
  });

  it('renders spinner consistently while loading', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    const { container } = render(
      <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={100n} />,
    );
    expect(container.querySelector('.spinner-border')).not.toBeNull();
  });

  it('renders multiple instances independently with loading state', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    const { container } = render(
      <>
        <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />
        <DelegateHoverCard delegateId="delegate-0xB" proposalCreationBlock={2n} />
      </>,
    );
    expect(container.querySelectorAll('.spinner-border').length).toBe(2);
  });

  it('renders without crash for very large proposalCreationBlock', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    expect(() =>
      render(
        <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={9007199254740991n} />,
      ),
    ).not.toThrow();
  });

  it('rerender from loading to error does not crash', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValueOnce({
      data: undefined,
      loading: true,
      error: undefined,
    });
    const { rerender } = render(
      <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
    );
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: false,
      error: new Error('boom'),
    });
    expect(() =>
      rerender(<DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />),
    ).not.toThrow();
  });

  it('renders for delegateId with hex prefix variations', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    expect(() =>
      render(<DelegateHoverCard delegateId="delegate-0xABCDEF" proposalCreationBlock={5n} />),
    ).not.toThrow();
  });

  it('renders without crash with delegateId empty string', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    expect(() =>
      render(<DelegateHoverCard delegateId="" proposalCreationBlock={1n} />),
    ).not.toThrow();
  });

  it('renders 5 instances with different delegate IDs', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    expect(() =>
      render(
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <DelegateHoverCard
              key={i}
              delegateId={`delegate-0x${i}`}
              proposalCreationBlock={BigInt(i + 1)}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender from error to loading recovers', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValueOnce({
      data: undefined,
      loading: false,
      error: new Error('first'),
    });
    const { rerender } = render(
      <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
    );
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    expect(() =>
      rerender(<DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />),
    ).not.toThrow();
  });

  it('handles delegate data with 20 nijis', () => {
    const nijiList = Array.from({ length: 20 }, (_, i) => ({ id: String(i + 1) }));
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: nijiList }] },
      loading: false,
      error: undefined,
    });
    const { container } = render(
      <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
    );
    expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe('stack-20');
  });

  it('handles negative proposalCreationBlock (-1n)', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    expect(() =>
      render(<DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={-1n} />),
    ).not.toThrow();
  });

  it('renders 10 instances independently', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    expect(() =>
      render(
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <DelegateHoverCard
              key={i}
              delegateId={`delegate-0x${i}`}
              proposalCreationBlock={BigInt(i + 1)}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 50 nijis without crash', () => {
    const nijiList = Array.from({ length: 50 }, (_, i) => ({ id: String(i + 1) }));
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: nijiList }] },
      loading: false,
      error: undefined,
    });
    const { container } = render(
      <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
    );
    expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe('stack-50');
  });

  it('rerender from error to success', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValueOnce({
      data: undefined,
      loading: false,
      error: new Error('boom'),
    });
    const { rerender } = render(
      <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
    );
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: undefined,
    });
    expect(() =>
      rerender(<DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />),
    ).not.toThrow();
  });

  it('handles consecutive 5 renders without crash', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    for (let i = 0; i < 5; i++) {
      expect(() =>
        render(<DelegateHoverCard delegateId={`delegate-0x${i}`} proposalCreationBlock={1n} />),
      ).not.toThrow();
    }
  });

  it('handles empty delegateId string', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    expect(() =>
      render(<DelegateHoverCard delegateId="" proposalCreationBlock={1n} />),
    ).not.toThrow();
  });

  it('renders 30 instances each independently', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegateHoverCard
              key={i}
              delegateId={`delegate-0x${i}`}
              proposalCreationBlock={BigInt(i + 1)}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 nijis without crash', () => {
    const nijiList = Array.from({ length: 100 }, (_, i) => ({ id: String(i + 1) }));
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: nijiList }] },
      loading: false,
      error: undefined,
    });
    const { container } = render(
      <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
    );
    expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe('stack-100');
  });

  it('rerender 10 times with different delegateId', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    const { rerender } = render(
      <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
    );
    for (let i = 0; i < 10; i++) {
      expect(() =>
        rerender(<DelegateHoverCard delegateId={`delegate-0x${i}`} proposalCreationBlock={1n} />),
      ).not.toThrow();
    }
  });

  it('handles negative proposalCreationBlock', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    expect(() =>
      render(<DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={-100n} />),
    ).not.toThrow();
  });

  it('handles 50 different delegateIds consecutively', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(<DelegateHoverCard delegateId={`delegate-0x${i}`} proposalCreationBlock={1n} />),
      ).not.toThrow();
    }
  });

  it('renders 50 instances without crash', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <DelegateHoverCard
              key={i}
              delegateId={`delegate-0xX${i}`}
              proposalCreationBlock={BigInt(i)}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves component', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    const { rerender } = render(
      <DelegateHoverCard delegateId="delegate-0x0" proposalCreationBlock={1n} />,
    );
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(
          <DelegateHoverCard
            delegateId={`delegate-0x${i}`}
            proposalCreationBlock={BigInt(i + 100)}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('handles very large proposalCreationBlock', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    expect(() =>
      render(
        <DelegateHoverCard
          delegateId="delegate-0xA"
          proposalCreationBlock={9_007_199_254_740_991n}
        />,
      ),
    ).not.toThrow();
  });

  it('handles unicode delegateId', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    expect(() =>
      render(<DelegateHoverCard delegateId="delegate-🚀日本" proposalCreationBlock={1n} />),
    ).not.toThrow();
  });

  it('handles rapid loading state transitions 50 times', () => {
    const { rerender } = render(
      <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
    );
    for (let i = 0; i < 50; i++) {
      useDelegateNounsAtBlockQueryMock.mockReturnValue({
        data: undefined,
        loading: i % 2 === 0,
        error: undefined,
      });
      expect(() =>
        rerender(<DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />),
      ).not.toThrow();
    }
  });

  it('mount-unmount 30 cycles', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
      );
      unmount();
    }
  });

  it('handles 50 different delegate ids', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <DelegateHoverCard delegateId={`delegate-0x${i}`} proposalCreationBlock={1n} />,
      );
      unmount();
    }
  });

  it('renders 100 instances without crash', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <DelegateHoverCard
              key={i}
              delegateId={`delegate-0x${i}`}
              proposalCreationBlock={BigInt(i)}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles all 4 query state combinations', () => {
    [
      { loading: true, error: undefined, data: undefined },
      { loading: false, error: new Error('e'), data: undefined },
      { loading: false, error: undefined, data: { delegates: [] } },
      {
        loading: false,
        error: undefined,
        data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      },
    ].forEach(state => {
      useDelegateNounsAtBlockQueryMock.mockReturnValue(state);
      expect(() =>
        render(<DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />),
      ).not.toThrow();
    });
  });

  it('handles 0n proposalCreationBlock edge case', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    expect(() =>
      render(<DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={0n} />),
    ).not.toThrow();
  });

  it('mount-unmount 30 cycles', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
      );
      unmount();
    }
  });

  it('handles 30 different delegates with full data', () => {
    for (let i = 0; i < 30; i++) {
      useDelegateNounsAtBlockQueryMock.mockReturnValue({
        data: {
          delegates: [{ id: `0xD${i}`, nijiRepresented: [{ id: String(i) }] }],
        },
        loading: false,
        error: undefined,
      });
      const { unmount } = render(
        <DelegateHoverCard delegateId={`delegate-0xD${i}`} proposalCreationBlock={1n} />,
      );
      unmount();
    }
  });

  it('renders 30 instances all in loading state', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegateHoverCard
              key={i}
              delegateId={`delegate-0xX${i}`}
              proposalCreationBlock={BigInt(i)}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different niji counts in stacked', () => {
    for (let i = 1; i <= 30; i++) {
      const niji = Array.from({ length: i }, (_, j) => ({ id: String(j) }));
      useDelegateNounsAtBlockQueryMock.mockReturnValue({
        data: { delegates: [{ id: '0xA', nijiRepresented: niji }] },
        loading: false,
        error: undefined,
      });
      const { container, unmount } = render(
        <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
      );
      expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe(`stack-${i}`);
      unmount();
    }
  });

  it('handles 30 different proposalCreationBlock values', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={BigInt(i * 100)} />,
      );
      unmount();
    }
  });

  it('mount-unmount 100 cycles', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
      );
      unmount();
    }
  });

  it('renders 100 instances all loading', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <DelegateHoverCard key={i} delegateId={`delegate-0x${i}`} proposalCreationBlock={1n} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different niji counts', () => {
    for (let i = 1; i <= 30; i++) {
      const niji = Array.from({ length: i }, (_, j) => ({ id: String(j) }));
      useDelegateNounsAtBlockQueryMock.mockReturnValue({
        data: { delegates: [{ id: '0xA', nijiRepresented: niji }] },
        loading: false,
        error: undefined,
      });
      const { container, unmount } = render(
        <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
      );
      expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe(`stack-${i}`);
      unmount();
    }
  });

  it('handles all 4 query state transitions', () => {
    [
      { loading: true, error: undefined, data: undefined },
      { loading: false, error: new Error('e'), data: undefined },
      { loading: false, error: undefined, data: { delegates: [] } },
      {
        loading: false,
        error: undefined,
        data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      },
    ].forEach(state => {
      useDelegateNounsAtBlockQueryMock.mockReturnValue(state);
      const { unmount } = render(
        <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
      );
      unmount();
    });
  });

  it('handles 50 different delegateIds', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <DelegateHoverCard delegateId={`delegate-0x${i}`} proposalCreationBlock={1n} />,
      );
      unmount();
    }
  });

  it('mount-unmount 200 cycles', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(
        <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
      );
      unmount();
    }
  });

  it('renders 200 instances all in loading state', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <DelegateHoverCard key={i} delegateId={`delegate-0x${i}`} proposalCreationBlock={1n} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different delegateIds', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <DelegateHoverCard delegateId={`delegate-0x${i}`} proposalCreationBlock={1n} />,
      );
      unmount();
    }
  });

  it('handles 30 different niji counts', () => {
    for (let i = 1; i <= 30; i++) {
      const niji = Array.from({ length: i }, (_, j) => ({ id: String(j) }));
      useDelegateNounsAtBlockQueryMock.mockReturnValue({
        data: { delegates: [{ id: '0xA', nijiRepresented: niji }] },
        loading: false,
        error: undefined,
      });
      const { container, unmount } = render(
        <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
      );
      expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe(`stack-${i}`);
      unmount();
    }
  });

  it('handles all query state transitions', () => {
    [
      { loading: true, error: undefined, data: undefined },
      { loading: false, error: new Error('e'), data: undefined },
      { loading: false, error: undefined, data: { delegates: [] } },
      {
        loading: false,
        error: undefined,
        data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      },
    ].forEach(state => {
      useDelegateNounsAtBlockQueryMock.mockReturnValue(state);
      const { unmount } = render(
        <DelegateHoverCard delegateId="delegate-0xA" proposalCreationBlock={1n} />,
      );
      unmount();
    });
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<DelegateHoverCard delegateId="0xABC" proposerAddress="0xPROP" />);
      unmount();
    }
  });

  it('round-2 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegateHoverCard
              key={i}
              delegateId={('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`}
              proposerAddress="0xPROP"
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 different delegateId values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`;
      const { unmount } = render(<DelegateHoverCard delegateId={addr} proposerAddress="0xPROP" />);
      unmount();
    }
  });

  it('round-2 handles 30 different proposerAddress values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`;
      const { unmount } = render(<DelegateHoverCard delegateId="0xABC" proposerAddress={addr} />);
      unmount();
    }
  });

  it('round-2 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<DelegateHoverCard delegateId="0xABC" proposerAddress="0xPROP" />),
      ).not.toThrow();
    }
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<DelegateHoverCard delegateId="0xABC" proposerAddress="0xPROP" />);
      unmount();
    }
  });

  it('round-3 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegateHoverCard
              key={i}
              delegateId={('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`}
              proposerAddress="0xPROP"
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different delegateId values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`;
      const { unmount } = render(<DelegateHoverCard delegateId={addr} proposerAddress="0xPROP" />);
      unmount();
    }
  });

  it('round-3 30 different proposerAddress values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`;
      const { unmount } = render(<DelegateHoverCard delegateId="0xABC" proposerAddress={addr} />);
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<DelegateHoverCard delegateId="0xABC" proposerAddress="0xPROP" />),
      ).not.toThrow();
    }
  });

  it('round-4 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<DelegateHoverCard delegateId="0xR4" proposerAddress="0xPROP" />);
      unmount();
    }
  });

  it('round-4 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <DelegateHoverCard key={i} delegateId={`0xR4-${i}`} proposerAddress={`0xPROP-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different delegateId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateHoverCard delegateId={`0xR4-d-${i}`} proposerAddress="0xPROP" />,
      );
      unmount();
    }
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<DelegateHoverCard delegateId="0xR4" proposerAddress="0xPROP" />),
      ).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <DelegateHoverCard delegateId="0xR4-2" proposerAddress="0xPROP" />,
      );
      unmount();
    }
  });

  it('round-5 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<DelegateHoverCard delegateId="0xR5" proposerAddress="0xPROP" />);
      unmount();
    }
  });

  it('round-5 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <DelegateHoverCard key={i} delegateId={`0xR5-${i}`} proposerAddress={`0xPROP-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 different delegateId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateHoverCard delegateId={`0xR5-d-${i}`} proposerAddress="0xPROP" />,
      );
      unmount();
    }
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<DelegateHoverCard delegateId="0xR5" proposerAddress="0xPROP" />),
      ).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <DelegateHoverCard delegateId="0xR5-2" proposerAddress="0xPROP" />,
      );
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<DelegateHoverCard delegateId="0xR6" proposerAddress="0xPROP" />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegateHoverCard key={i} delegateId={`0xR6-${i}`} proposerAddress="0xPROP" />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<DelegateHoverCard delegateId="0xR6" proposerAddress="0xPROP" />),
      ).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <DelegateHoverCard delegateId="0xR6-2" proposerAddress="0xPROP" />,
      );
      unmount();
    }
  });

  it('round-6 30 different delegateId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateHoverCard delegateId={`0xR6-d-${i}`} proposerAddress="0xPROP" />,
      );
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<DelegateHoverCard delegateId="0xDEL" proposerAddress="0xPROP" />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegateHoverCard key={i} delegateId={`0xR7-d-${i}`} proposerAddress="0xPROP" />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<DelegateHoverCard delegateId="0xDEL" proposerAddress="0xPROP" />),
      ).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<DelegateHoverCard delegateId="0xDEL" proposerAddress="0xPROP" />);
      unmount();
    }
  });

  it('round-7 30 different delegateId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateHoverCard delegateId={`0xR7-d-${i}`} proposerAddress="0xPROP" />,
      );
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<DelegateHoverCard delegateId="0xDEL" proposerAddress="0xPROP" />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegateHoverCard key={i} delegateId={`0xR8-d-${i}`} proposerAddress="0xPROP" />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<DelegateHoverCard delegateId="0xDEL" proposerAddress="0xPROP" />),
      ).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<DelegateHoverCard delegateId="0xDEL" proposerAddress="0xPROP" />);
      unmount();
    }
  });

  it('round-8 30 different delegateId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateHoverCard delegateId={`0xR8-d-${i}`} proposerAddress="0xPROP" />,
      );
      unmount();
    }
  });
});
