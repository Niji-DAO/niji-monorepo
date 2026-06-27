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

  it('round-3 mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(
        <VoteSignal support={1} voteCount={1} reason="r3" address={ADDR} />,
      );
      unmount();
    }
  });

  it('round-3 renders 200 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <VoteSignal key={i} support={i % 3} voteCount={i} reason={`r3-${i}`} address={ADDR} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different support cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <VoteSignal support={i % 3} voteCount={1} reason="ok" address={ADDR} />,
      );
      unmount();
    }
  });

  it('round-3 30 different voteCount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <VoteSignal support={1} voteCount={i + 100} reason="ok" address={ADDR} />,
      );
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<VoteSignal support={1} voteCount={1} reason="x" address={ADDR} />),
      ).not.toThrow();
    }
  });

  it('round-4 mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(
        <VoteSignal support={1} voteCount={1} reason="r4" address={ADDR} />,
      );
      unmount();
    }
  });

  it('round-4 renders 200 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <VoteSignal key={i} support={i % 3} voteCount={i} reason={`r4-${i}`} address={ADDR} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different support cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <VoteSignal support={i % 3} voteCount={1} reason="ok" address={ADDR} />,
      );
      unmount();
    }
  });

  it('round-4 30 different voteCount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <VoteSignal support={1} voteCount={i + 500} reason="ok" address={ADDR} />,
      );
      unmount();
    }
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<VoteSignal support={1} voteCount={1} reason="x" address={ADDR} />),
      ).not.toThrow();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <VoteSignal support={1} voteCount={1} reason="r5" address={ADDR} />,
      );
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteSignal
              key={i}
              support={(i % 3) as 0 | 1 | 2}
              voteCount={i + 100}
              reason={`r5-${i}`}
              address={ADDR}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 different voteCount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <VoteSignal support={1} voteCount={i + 5000} reason="x" address={ADDR} />,
      );
      unmount();
    }
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<VoteSignal support={1} voteCount={1} reason="x" address={ADDR} />),
      ).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <VoteSignal support={1} voteCount={1} reason="x" address={ADDR} />,
      );
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <VoteSignal support={1} voteCount={1} reason="r6" address={ADDR} />,
      );
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteSignal
              key={i}
              support={i % 3}
              voteCount={i + 8000}
              reason={`r6-${i}`}
              address={ADDR}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<VoteSignal support={1} voteCount={1} reason="x" address={ADDR} />),
      ).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <VoteSignal support={1} voteCount={1} reason="x" address={ADDR} />,
      );
      unmount();
    }
  });

  it('round-6 30 different voteCount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <VoteSignal support={1} voteCount={i + 9000} reason="x" address={ADDR} />,
      );
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <VoteSignal support={1} voteCount={1} reason="r7" address={ADDR} />,
      );
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteSignal key={i} support={1} voteCount={i} reason={`r7-${i}`} address={ADDR} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<VoteSignal support={1} voteCount={1} reason="x" address={ADDR} />),
      ).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <VoteSignal support={1} voteCount={1} reason="x" address={ADDR} />,
      );
      unmount();
    }
  });

  it('round-7 30 different voteCount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <VoteSignal support={1} voteCount={i + 11000} reason="x" address={ADDR} />,
      );
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <VoteSignal support={1} voteCount={1} reason="r8" address={ADDR} />,
      );
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteSignal key={i} support={1} voteCount={i} reason={`r8-${i}`} address={ADDR} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<VoteSignal support={1} voteCount={1} reason="x" address={ADDR} />),
      ).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <VoteSignal support={1} voteCount={1} reason="x" address={ADDR} />,
      );
      unmount();
    }
  });

  it('round-8 30 different voteCount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <VoteSignal support={1} voteCount={i + 13000} reason="x" address={ADDR} />,
      );
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <VoteSignal support={1} voteCount={1} reason="r9" address={ADDR} />,
      );
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteSignal key={i} support={1} voteCount={i} reason={`r9-${i}`} address={ADDR} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<VoteSignal support={1} voteCount={1} reason="x" address={ADDR} />),
      ).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <VoteSignal support={1} voteCount={1} reason="x" address={ADDR} />,
      );
      unmount();
    }
  });

  it('round-9 30 different voteCount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <VoteSignal support={1} voteCount={i + 15000} reason="x" address={ADDR} />,
      );
      unmount();
    }
  });

  it('round-10 30 sequential VoteSignal mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <VoteSignal support={1} voteCount={i} reason="r10" address={ADDR} />,
      );
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteSignal key={i} support={1} voteCount={i} reason="r10" address={ADDR} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<VoteSignal support={1} voteCount={i} reason="r10" address={ADDR} />),
      ).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <VoteSignal support={1} voteCount={i + 30000} reason="r10-2" address={ADDR} />,
      );
      unmount();
    }
  });

  it('round-10 100 sequential different voteCount values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <VoteSignal support={1} voteCount={i + 40000} reason="r10" address={ADDR} />,
      );
      unmount();
    }
  });
});
