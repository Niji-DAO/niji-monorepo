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
});
