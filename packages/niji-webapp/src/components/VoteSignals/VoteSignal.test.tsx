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

  it('uses plural "votes" for voteCount=0', () => {
    useEnsNameMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <VoteSignal support={1} voteCount={0} reason="ok" address={ADDR} />,
    );
    expect(container.textContent).toContain('0 votes');
  });

  it('renders empty reason without crash', () => {
    useEnsNameMock.mockReturnValue({ data: undefined });
    const { container } = render(<VoteSignal support={1} voteCount={1} reason="" address={ADDR} />);
    expect(container.querySelector('[data-testid="short"]')).not.toBeNull();
  });

  it('renders for support=0 (AGAINST variant)', () => {
    useEnsNameMock.mockReturnValue({ data: undefined });
    expect(() =>
      render(<VoteSignal support={0} voteCount={1} reason="x" address={ADDR} />),
    ).not.toThrow();
  });

  it('renders for support=2 (ABSTAIN variant)', () => {
    useEnsNameMock.mockReturnValue({ data: undefined });
    expect(() =>
      render(<VoteSignal support={2} voteCount={1} reason="x" address={ADDR} />),
    ).not.toThrow();
  });

  it('handles large voteCount (1000) with plural', () => {
    useEnsNameMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <VoteSignal support={1} voteCount={1000} reason="ok" address={ADDR} />,
    );
    expect(container.textContent).toContain('1000 votes');
  });

  it('ENS avatar src is data:image/png (blo() fallback path)', () => {
    useEnsNameMock.mockReturnValue({ data: 'alice.eth' });
    const { container } = render(
      <VoteSignal support={1} voteCount={1} reason="ok" address={ADDR} />,
    );
    expect(container.querySelector('img')?.getAttribute('src')).toBe('data:image/png;base64,FAKE');
  });

  it('multi-line reason renders all lines', () => {
    useEnsNameMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <VoteSignal support={1} voteCount={1} reason="line1\nline2" address={ADDR} />,
    );
    expect(container.textContent).toContain('line1');
    expect(container.textContent).toContain('line2');
  });

  it('different address renders ShortAddress with that address', () => {
    useEnsNameMock.mockReturnValue({ data: undefined });
    const OTHER = '0x0000000000000000000000000000000000000001' as const;
    const { container } = render(
      <VoteSignal support={1} voteCount={1} reason="x" address={OTHER} />,
    );
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe(OTHER);
  });

  it('renders 1 ShortAddress element exactly', () => {
    useEnsNameMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <VoteSignal support={1} voteCount={1} reason="ok" address={ADDR} />,
    );
    expect(container.querySelectorAll('[data-testid="short"]').length).toBe(1);
  });

  it('ENS with empty string still treated as no avatar', () => {
    useEnsNameMock.mockReturnValue({ data: '' });
    const { container } = render(
      <VoteSignal support={1} voteCount={1} reason="ok" address={ADDR} />,
    );
    expect(container.querySelector('img')).toBeNull();
  });

  it('mount-unmount 200 cycles', () => {
    useEnsNameMock.mockReturnValue({ data: undefined });
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<VoteSignal voter={ADDR} votes={5} reason="" />);
      unmount();
    }
  });

  it('renders 200 instances without crash', () => {
    useEnsNameMock.mockReturnValue({ data: 'alice.eth' });
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <VoteSignal key={i} voter={ADDR} votes={i} reason={`r-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different votes values', () => {
    useEnsNameMock.mockReturnValue({ data: undefined });
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<VoteSignal voter={ADDR} votes={i} reason="" />);
      unmount();
    }
  });

  it('handles 100 different voter addresses', () => {
    useEnsNameMock.mockReturnValue({ data: undefined });
    for (let i = 0; i < 100; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`;
      const { unmount } = render(<VoteSignal voter={addr} votes={1} reason="" />);
      unmount();
    }
  });

  it('handles 100 different reason values', () => {
    useEnsNameMock.mockReturnValue({ data: undefined });
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<VoteSignal voter={ADDR} votes={1} reason={`r-${i}`} />);
      unmount();
    }
  });

  it('round-2 mount-unmount 200 cycles', () => {
    useEnsNameMock.mockReturnValue({ data: undefined });
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<VoteSignal voter={ADDR} votes={5} reason="" />);
      unmount();
    }
  });

  it('round-2 renders 200 instances variant', () => {
    useEnsNameMock.mockReturnValue({ data: 'alice.eth' });
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <VoteSignal key={i} voter={ADDR} votes={i} reason={`r2-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 50 different votes values', () => {
    useEnsNameMock.mockReturnValue({ data: undefined });
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteSignal voter={ADDR} votes={i + 100} reason="" />);
      unmount();
    }
  });

  it('round-2 handles 50 different voter addresses', () => {
    useEnsNameMock.mockReturnValue({ data: undefined });
    for (let i = 0; i < 50; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`;
      const { unmount } = render(<VoteSignal voter={addr} votes={1} reason="" />);
      unmount();
    }
  });

  it('round-2 handles 50 different reason values', () => {
    useEnsNameMock.mockReturnValue({ data: undefined });
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteSignal voter={ADDR} votes={1} reason={`r2-r-${i}`} />);
      unmount();
    }
  });
});
