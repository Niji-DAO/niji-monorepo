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
});
