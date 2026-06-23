import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const useEnsNameMock = vi.fn();
vi.mock('wagmi', () => ({
  useEnsName: () => useEnsNameMock(),
}));

vi.mock('blo', () => ({
  blo: () => 'data:image/png;base64,FAKE',
}));

vi.mock('@/components/ShortAddress', () => ({
  default: ({ address }: { address: string }) => <span data-testid="short">{address}</span>,
}));

import VoteSignal from './VoteSignal';

const ADDR = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const;

describe('VoteSignal', () => {
  it('renders ShortAddress for given address', () => {
    useEnsNameMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <VoteSignal support={1} voteCount={1} reason="ok" address={ADDR} />,
    );
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe(ADDR);
  });

  it('renders avatar img when ENS is found', () => {
    useEnsNameMock.mockReturnValue({ data: 'alice.eth' });
    const { container } = render(
      <VoteSignal support={1} voteCount={1} reason="ok" address={ADDR} />,
    );
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('omits avatar img when ENS is missing', () => {
    useEnsNameMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <VoteSignal support={1} voteCount={1} reason="ok" address={ADDR} />,
    );
    expect(container.querySelector('img')).toBeNull();
  });

  it('uses singular "vote" for voteCount=1', () => {
    useEnsNameMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <VoteSignal support={1} voteCount={1} reason="ok" address={ADDR} />,
    );
    expect(container.textContent).toContain('1 vote');
    expect(container.textContent).not.toContain('1 votes');
  });

  it('uses plural "votes" for voteCount=2', () => {
    useEnsNameMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <VoteSignal support={1} voteCount={2} reason="ok" address={ADDR} />,
    );
    expect(container.textContent).toContain('2 votes');
  });

  it('renders reason text', () => {
    useEnsNameMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <VoteSignal support={1} voteCount={1} reason="My reason here" address={ADDR} />,
    );
    expect(container.textContent).toContain('My reason here');
  });
});
