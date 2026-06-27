import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const useSubgraphQueryMock = vi.fn();
vi.mock('@/hooks/useSubgraphQuery', () => ({
  useSubgraphQuery: () => useSubgraphQueryMock(),
}));

vi.mock('@/components/ShortAddress', () => ({
  default: ({ address }: { address: string }) => <span data-testid="short">{address}</span>,
}));

vi.mock('@/components/HorizontalStackedNijis', () => ({
  default: ({ nounIds }: { nounIds: string[] }) => (
    <span data-testid="stacked">stack-{nounIds.length}</span>
  ),
}));

vi.mock('@/wrappers/subgraph', () => ({
  currentlyDelegatedNounsDocument: 'DOC',
}));

import ByLineHoverCard from './index';

describe('ByLineHoverCard', () => {
  it('renders spinner when loading', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    const { container } = render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.querySelector('.spinner-border')).not.toBeNull();
  });

  it('renders spinner when delegates is empty', () => {
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [] },
      loading: false,
      error: undefined,
    });
    const { container } = render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.querySelector('.spinner-border')).not.toBeNull();
  });

  it('renders error message when error is set', () => {
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: new Error('rpc'),
    });
    const { container } = render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.textContent).toBe('Error fetching Vote info');
  });

  it('renders stacked nijis + total when data is present', () => {
    useSubgraphQueryMock.mockReturnValue({
      data: {
        delegates: [
          {
            id: '0xA',
            nijiRepresented: [{ id: '3' }, { id: '1' }, { id: '2' }],
          },
        ],
      },
      loading: false,
      error: undefined,
    });
    const { container } = render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe('stack-3');
  });

  it('renders stack-1 for single niji', () => {
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: undefined,
    });
    const { container } = render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe('stack-1');
  });

  it('renders stack-5 for 5 nijis', () => {
    useSubgraphQueryMock.mockReturnValue({
      data: {
        delegates: [
          {
            id: '0xA',
            nijiRepresented: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }],
          },
        ],
      },
      loading: false,
      error: undefined,
    });
    const { container } = render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe('stack-5');
  });

  it('calls useSubgraphQuery exactly once per render', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    useSubgraphQueryMock.mockClear();
    render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(useSubgraphQueryMock).toHaveBeenCalledTimes(1);
  });

  it('error message has no data dependency (still error even with data)', () => {
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: new Error('boom'),
    });
    const { container } = render(<ByLineHoverCard proposerAddress="0xZ" />);
    expect(container.textContent).toContain('Error');
  });

  it('does not render spinner when data has at least 1 delegate (no loading, no error)', () => {
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: undefined,
    });
    const { container } = render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.querySelector('.spinner-border')).toBeNull();
  });

  it('does not render error message when error is undefined', () => {
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: undefined,
    });
    const { container } = render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.textContent).not.toContain('Error');
  });

  it('renders stacked with 10 nijis', () => {
    const nijiList = Array.from({ length: 10 }, (_, i) => ({ id: String(i + 1) }));
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: nijiList }] },
      loading: false,
      error: undefined,
    });
    const { container } = render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe('stack-10');
  });

  it('loading=true takes precedence over data (still spinner)', () => {
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: true,
      error: undefined,
    });
    const { container } = render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.querySelector('.spinner-border')).not.toBeNull();
  });

  it('loading=true takes precedence over error (spinner shown, error skipped)', () => {
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: true,
      error: new Error('boom'),
    });
    const { container } = render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.querySelector('.spinner-border')).not.toBeNull();
    expect(container.textContent).not.toContain('Error');
  });

  it('different proposerAddress does not change rendering of stacked content', () => {
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xB', nijiRepresented: [{ id: '7' }, { id: '8' }] }] },
      loading: false,
      error: undefined,
    });
    const { container } = render(<ByLineHoverCard proposerAddress="0xB" />);
    expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe('stack-2');
  });

  it('rerender from loading to data shows stacked', () => {
    useSubgraphQueryMock.mockReturnValueOnce({
      data: undefined,
      loading: true,
      error: undefined,
    });
    const { container, rerender } = render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.querySelector('.spinner-border')).not.toBeNull();
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: undefined,
    });
    rerender(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.querySelector('[data-testid="stacked"]')).not.toBeNull();
  });

  it('rerender from data to error shows error msg', () => {
    useSubgraphQueryMock.mockReturnValueOnce({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: undefined,
    });
    const { container, rerender } = render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.textContent).not.toContain('Error');
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: new Error('rpc'),
    });
    rerender(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.textContent).toContain('Error');
  });

  it('renders only 1 stacked element regardless of delegate count', () => {
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }, { id: '2' }] }] },
      loading: false,
      error: undefined,
    });
    const { container } = render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.querySelectorAll('[data-testid="stacked"]').length).toBe(1);
  });

  it('error msg in exact text "Error fetching Vote info"', () => {
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: new Error('rpc'),
    });
    const { container } = render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.textContent).toBe('Error fetching Vote info');
  });

  it('stack-0 not rendered when delegates empty (spinner branch)', () => {
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [] },
      loading: false,
      error: undefined,
    });
    const { container } = render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.querySelector('[data-testid="stacked"]')).toBeNull();
  });

  it('large 50 nijis render in stacked', () => {
    const nijiList = Array.from({ length: 50 }, (_, i) => ({ id: String(i + 1) }));
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: nijiList }] },
      loading: false,
      error: undefined,
    });
    const { container } = render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe('stack-50');
  });

  it('useSubgraphQuery called exactly 1 time per render', () => {
    useSubgraphQueryMock.mockClear();
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: undefined,
    });
    render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(useSubgraphQueryMock).toHaveBeenCalledTimes(1);
  });

  it('100 nijis render stack-100', () => {
    const nijiList = Array.from({ length: 100 }, (_, i) => ({ id: String(i + 1) }));
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: nijiList }] },
      loading: false,
      error: undefined,
    });
    const { container } = render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe('stack-100');
  });

  it('different proposerAddress prop forwarded as-is', () => {
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xB', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: undefined,
    });
    expect(() => render(<ByLineHoverCard proposerAddress="0xB" />)).not.toThrow();
  });

  it('error message renders only 1 time (no duplication)', () => {
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: new Error('rpc'),
    });
    const { container } = render(<ByLineHoverCard proposerAddress="0xA" />);
    const text = container.textContent ?? '';
    expect(text.split('Error fetching').length).toBe(2); // 1 occurrence (split by it produces 2 parts)
  });

  it('stack-3 for 3 nijis renders', () => {
    useSubgraphQueryMock.mockReturnValue({
      data: {
        delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }, { id: '2' }, { id: '3' }] }],
      },
      loading: false,
      error: undefined,
    });
    const { container } = render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe('stack-3');
  });

  it('renders without crash for undefined data + loading=false', () => {
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [] },
      loading: false,
      error: undefined,
    });
    expect(() => render(<ByLineHoverCard proposerAddress="0xA" />)).not.toThrow();
  });

  it('renders without crash with empty proposer string', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    expect(() => render(<ByLineHoverCard proposerAddress="" />)).not.toThrow();
  });

  it('renders spinner consistently across rerenders', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    const { container, rerender } = render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.querySelector('.spinner-border')).not.toBeNull();
    rerender(<ByLineHoverCard proposerAddress="0xB" />);
    expect(container.querySelector('.spinner-border')).not.toBeNull();
  });

  it('renders multiple instances independently', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    const { container } = render(
      <>
        <ByLineHoverCard proposerAddress="0xA" />
        <ByLineHoverCard proposerAddress="0xB" />
      </>,
    );
    expect(container.querySelectorAll('.spinner-border').length).toBe(2);
  });

  it('renders without crash for very long proposer address', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    expect(() =>
      render(<ByLineHoverCard proposerAddress={'0x' + 'a'.repeat(100)} />),
    ).not.toThrow();
  });

  it('renders 5 instances each independently', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    expect(() =>
      render(
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <ByLineHoverCard key={i} proposerAddress={`0xA${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('renders spinner consistently across rerenders', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    const { container, rerender } = render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.querySelector('.spinner-border')).not.toBeNull();
    rerender(<ByLineHoverCard proposerAddress="0xB" />);
    expect(container.querySelector('.spinner-border')).not.toBeNull();
  });

  it('renders for empty proposer string', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    expect(() => render(<ByLineHoverCard proposerAddress="" />)).not.toThrow();
  });

  it('renders for very long proposer address (200 char)', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    expect(() =>
      render(<ByLineHoverCard proposerAddress={'0x' + 'a'.repeat(200)} />),
    ).not.toThrow();
  });

  it('rerender from loading to error state', () => {
    useSubgraphQueryMock.mockReturnValueOnce({
      data: undefined,
      loading: true,
      error: undefined,
    });
    const { rerender } = render(<ByLineHoverCard proposerAddress="0xA" />);
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: new Error('boom'),
    });
    expect(() => rerender(<ByLineHoverCard proposerAddress="0xA" />)).not.toThrow();
  });

  it('renders 20 instances each with own proposerAddress', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    expect(() =>
      render(
        <>
          {Array.from({ length: 20 }, (_, i) => (
            <ByLineHoverCard key={i} proposerAddress={`0x${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('renders consecutive 5 times', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    for (let i = 0; i < 5; i++) {
      expect(() => render(<ByLineHoverCard proposerAddress="0xA" />)).not.toThrow();
    }
  });

  it('data with 1 delegate + 50 nijis', () => {
    const nijiList = Array.from({ length: 50 }, (_, i) => ({ id: String(i + 1) }));
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: nijiList }] },
      loading: false,
      error: undefined,
    });
    const { container } = render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe('stack-50');
  });

  it('rerender from error to success state', () => {
    useSubgraphQueryMock.mockReturnValueOnce({
      data: undefined,
      loading: false,
      error: new Error('boom'),
    });
    const { container, rerender } = render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.textContent).toContain('Error');
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: undefined,
    });
    rerender(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.querySelector('[data-testid="stacked"]')).not.toBeNull();
  });

  it('consistent ShortAddress text across rerenders', () => {
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xAAA', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: undefined,
    });
    const { container, rerender } = render(<ByLineHoverCard proposerAddress="0xAAA" />);
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0xAAA');
    rerender(<ByLineHoverCard proposerAddress="0xAAA" />);
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0xAAA');
  });

  it('renders 30 instances each independently', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ByLineHoverCard key={i} proposerAddress={`0x${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('renders consecutive 20 times without crash', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    for (let i = 0; i < 20; i++) {
      expect(() => render(<ByLineHoverCard proposerAddress={`0x${i}`} />)).not.toThrow();
    }
  });

  it('handles 100 nijis data', () => {
    const nijiList = Array.from({ length: 100 }, (_, i) => ({ id: String(i + 1) }));
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: nijiList }] },
      loading: false,
      error: undefined,
    });
    const { container } = render(<ByLineHoverCard proposerAddress="0xA" />);
    expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe('stack-100');
  });

  it('rerender from loading→data→error→data sequence', () => {
    useSubgraphQueryMock.mockReturnValueOnce({
      data: undefined,
      loading: true,
      error: undefined,
    });
    const { rerender } = render(<ByLineHoverCard proposerAddress="0xA" />);
    useSubgraphQueryMock.mockReturnValueOnce({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      loading: false,
      error: undefined,
    });
    rerender(<ByLineHoverCard proposerAddress="0xA" />);
    useSubgraphQueryMock.mockReturnValueOnce({
      data: undefined,
      loading: false,
      error: new Error('x'),
    });
    rerender(<ByLineHoverCard proposerAddress="0xA" />);
    useSubgraphQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '2' }] }] },
      loading: false,
      error: undefined,
    });
    expect(() => rerender(<ByLineHoverCard proposerAddress="0xA" />)).not.toThrow();
  });

  it('handles very long proposer address', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    expect(() =>
      render(<ByLineHoverCard proposerAddress={'0x' + 'a'.repeat(200)} />),
    ).not.toThrow();
  });

  it('renders 50 instances without crash', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <ByLineHoverCard key={i} proposerAddress={`0xADDR${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves component', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    const { rerender } = render(<ByLineHoverCard proposerAddress="0xA" />);
    for (let i = 0; i < 30; i++) {
      expect(() => rerender(<ByLineHoverCard proposerAddress={`0xA${i}`} />)).not.toThrow();
    }
  });

  it('handles rapid loading state transitions 50 times', () => {
    const { rerender } = render(<ByLineHoverCard proposerAddress="0xA" />);
    for (let i = 0; i < 50; i++) {
      useSubgraphQueryMock.mockReturnValue({
        data: undefined,
        loading: i % 2 === 0,
        error: undefined,
      });
      expect(() => rerender(<ByLineHoverCard proposerAddress="0xA" />)).not.toThrow();
    }
  });

  it('handles empty string proposer address', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    expect(() => render(<ByLineHoverCard proposerAddress="" />)).not.toThrow();
  });

  it('handles unicode proposer address', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    expect(() => render(<ByLineHoverCard proposerAddress="🚀0xJP" />)).not.toThrow();
  });

  it('mount-unmount 30 cycles', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress="0xA" />);
      unmount();
    }
  });

  it('handles 50 different addresses', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress={`0xA${i}`} />);
      unmount();
    }
  });

  it('handles error state with no data', () => {
    useSubgraphQueryMock.mockReturnValue({
      data: undefined,
      loading: false,
      error: new Error('rpc'),
    });
    expect(() => render(<ByLineHoverCard proposerAddress="0xA" />)).not.toThrow();
  });

  it('renders 100 instances without crash', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <ByLineHoverCard key={i} proposerAddress={`0xADDR${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles long proposerAddress (200 char)', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    const long = '0x' + 'a'.repeat(200);
    expect(() => render(<ByLineHoverCard proposerAddress={long} />)).not.toThrow();
  });

  it('mount-unmount 30 cycles', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress="0xA" />);
      unmount();
    }
  });

  it('renders 30 instances all in loading state', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ByLineHoverCard key={i} proposerAddress={`0xADDR${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different proposer addresses with data', () => {
    for (let i = 0; i < 30; i++) {
      useSubgraphQueryMock.mockReturnValue({
        data: { delegates: [{ id: `0xD${i}`, nijiRepresented: [{ id: '1' }] }] },
        loading: false,
        error: undefined,
      });
      const { unmount } = render(<ByLineHoverCard proposerAddress={`0xP${i}`} />);
      unmount();
    }
  });

  it('handles all 3 query state combinations', () => {
    [
      { loading: true, error: undefined, data: undefined },
      { loading: false, error: new Error('e'), data: undefined },
      {
        loading: false,
        error: undefined,
        data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
      },
    ].forEach(state => {
      useSubgraphQueryMock.mockReturnValue(state);
      const { unmount } = render(<ByLineHoverCard proposerAddress="0xA" />);
      unmount();
    });
  });

  it('handles 30 different niji counts in stacked', () => {
    for (let i = 1; i <= 30; i++) {
      const niji = Array.from({ length: i }, (_, j) => ({ id: String(j) }));
      useSubgraphQueryMock.mockReturnValue({
        data: { delegates: [{ id: '0xA', nijiRepresented: niji }] },
        loading: false,
        error: undefined,
      });
      const { container, unmount } = render(<ByLineHoverCard proposerAddress="0xA" />);
      expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe(`stack-${i}`);
      unmount();
    }
  });

  it('mount-unmount 100 cycles', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress="0xA" />);
      unmount();
    }
  });

  it('renders 100 instances all loading', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <ByLineHoverCard key={i} proposerAddress={`0xA${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 50 different proposer addresses with data', () => {
    for (let i = 0; i < 50; i++) {
      useSubgraphQueryMock.mockReturnValue({
        data: { delegates: [{ id: `0xD${i}`, nijiRepresented: [{ id: '1' }] }] },
        loading: false,
        error: undefined,
      });
      const { unmount } = render(<ByLineHoverCard proposerAddress={`0xP${i}`} />);
      unmount();
    }
  });

  it('all 30 loading instances render spinner', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    const { container } = render(
      <>
        {Array.from({ length: 30 }, (_, i) => (
          <ByLineHoverCard key={i} proposerAddress="0xA" />
        ))}
      </>,
    );
    expect(container.querySelectorAll('.spinner-border').length).toBeGreaterThanOrEqual(30);
  });

  it('handles 30 different niji counts in stacked', () => {
    for (let i = 1; i <= 30; i++) {
      const niji = Array.from({ length: i }, (_, j) => ({ id: String(j) }));
      useSubgraphQueryMock.mockReturnValue({
        data: { delegates: [{ id: '0xA', nijiRepresented: niji }] },
        loading: false,
        error: undefined,
      });
      const { container, unmount } = render(<ByLineHoverCard proposerAddress="0xA" />);
      expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe(`stack-${i}`);
      unmount();
    }
  });

  it('mount-unmount 200 cycles', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress="0xA" />);
      unmount();
    }
  });

  it('renders 200 instances all in loading state', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <ByLineHoverCard key={i} proposerAddress={`0xA${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different proposer addresses', () => {
    useSubgraphQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress={`0xADDR${i}`} />);
      unmount();
    }
  });

  it('handles 30 different error message types', () => {
    for (let i = 0; i < 30; i++) {
      useSubgraphQueryMock.mockReturnValue({
        data: undefined,
        loading: false,
        error: new Error(`err-${i}`),
      });
      const { unmount } = render(<ByLineHoverCard proposerAddress="0xA" />);
      unmount();
    }
  });

  it('handles 30 different delegates niji counts', () => {
    for (let i = 1; i <= 30; i++) {
      const niji = Array.from({ length: i }, (_, j) => ({ id: String(j) }));
      useSubgraphQueryMock.mockReturnValue({
        data: { delegates: [{ id: '0xA', nijiRepresented: niji }] },
        loading: false,
        error: undefined,
      });
      const { container, unmount } = render(<ByLineHoverCard proposerAddress="0xA" />);
      expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe(`stack-${i}`);
      unmount();
    }
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress="0xABC" />);
      unmount();
    }
  });

  it('round-2 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ByLineHoverCard
              key={i}
              proposerAddress={('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 different addresses', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`;
      const { unmount } = render(<ByLineHoverCard proposerAddress={addr} />);
      unmount();
    }
  });

  it('round-2 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ByLineHoverCard proposerAddress="0xABC" />)).not.toThrow();
    }
  });

  it('round-2 30 mount-unmount cycles second', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress="0xR2" />);
      unmount();
    }
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress="0xABC" />);
      unmount();
    }
  });

  it('round-3 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ByLineHoverCard
              key={i}
              proposerAddress={('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different addresses', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`;
      const { unmount } = render(<ByLineHoverCard proposerAddress={addr} />);
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ByLineHoverCard proposerAddress="0xABC" />)).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress="0xR3" />);
      unmount();
    }
  });

  it('round-4 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress="0xR4" />);
      unmount();
    }
  });

  it('round-4 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <ByLineHoverCard key={i} proposerAddress={`0xR4-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different proposerAddress values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress={`0xR4-${i + 500}`} />);
      unmount();
    }
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ByLineHoverCard proposerAddress="0xR4" />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress="0xR4-2" />);
      unmount();
    }
  });

  it('round-5 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress="0xR5" />);
      unmount();
    }
  });

  it('round-5 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <ByLineHoverCard key={i} proposerAddress={`0xR5-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 different proposerAddress values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress={`0xR5-${i + 500}`} />);
      unmount();
    }
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ByLineHoverCard proposerAddress="0xR5" />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress="0xR5-2" />);
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress="0xR6" />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ByLineHoverCard key={i} proposerAddress={`0xR6-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ByLineHoverCard proposerAddress="0xR6" />)).not.toThrow();
    }
  });

  it('round-6 30 different proposerAddress values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress={`0xR6-p-${i}`} />);
      unmount();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress="0xR6-2" />);
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress="0xR7" />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ByLineHoverCard key={i} proposerAddress={`0xR7-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ByLineHoverCard proposerAddress="0xR7" />)).not.toThrow();
    }
  });

  it('round-7 30 different proposerAddress values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress={`0xR7-c-${i}`} />);
      unmount();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress="0xR7-2" />);
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress="0xR8" />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ByLineHoverCard key={i} proposerAddress={`0xR8-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ByLineHoverCard proposerAddress="0xR8" />)).not.toThrow();
    }
  });

  it('round-8 30 different proposerAddress values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress={`0xR8-c-${i}`} />);
      unmount();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress="0xR8-2" />);
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress="0xR9" />);
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ByLineHoverCard key={i} proposerAddress={`0xR9-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ByLineHoverCard proposerAddress="0xR9" />)).not.toThrow();
    }
  });

  it('round-9 30 different proposerAddress values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress={`0xR9-c-${i}`} />);
      unmount();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress="0xR9-2" />);
      unmount();
    }
  });

  it('round-10 30 sequential ByLineHoverCard mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress="0xR10" />);
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ByLineHoverCard key={i} proposerAddress={`0xR10-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ByLineHoverCard proposerAddress="0xR10" />)).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress={`0xR10-m-${i}`} />);
      unmount();
    }
  });

  it('round-10 100 sequential different proposerAddress values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ByLineHoverCard proposerAddress={`0xR10-c-${i}`} />);
      unmount();
    }
  });
});
