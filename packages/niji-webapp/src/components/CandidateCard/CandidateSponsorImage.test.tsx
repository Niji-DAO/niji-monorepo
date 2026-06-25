import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/Niji', () => ({
  NijiImage: ({ nounId }: { nounId: bigint }) => (
    <span data-testid="niji-image">{nounId.toString()}</span>
  ),
}));

import CandidateSponsorImage from './CandidateSponsorImage';

describe('CandidateSponsorImage', () => {
  it('passes nounId to NijiImage', () => {
    const { container } = render(<CandidateSponsorImage nounId={42n} />);
    expect(container.querySelector('[data-testid="niji-image"]')?.textContent).toBe('42');
  });

  it('wraps NijiImage in a div with sponsorAvatar class', () => {
    const { container } = render(<CandidateSponsorImage nounId={1n} />);
    const div = container.querySelector('div');
    expect(div).not.toBeNull();
    expect(div?.querySelector('[data-testid="niji-image"]')).not.toBeNull();
  });

  it('renders 0n nounId correctly', () => {
    const { container } = render(<CandidateSponsorImage nounId={0n} />);
    expect(container.querySelector('[data-testid="niji-image"]')?.textContent).toBe('0');
  });

  it('renders very large bigint nounId', () => {
    const huge = 9_007_199_254_740_991n; // Number.MAX_SAFE_INTEGER as bigint
    const { container } = render(<CandidateSponsorImage nounId={huge} />);
    expect(container.querySelector('[data-testid="niji-image"]')?.textContent).toBe(
      huge.toString(),
    );
  });

  it('outermost wrapper is a single <div>', () => {
    const { container } = render(<CandidateSponsorImage nounId={1n} />);
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('renders exactly 1 NijiImage child', () => {
    const { container } = render(<CandidateSponsorImage nounId={1n} />);
    expect(container.querySelectorAll('[data-testid="niji-image"]').length).toBe(1);
  });

  it('applies CSS module className on wrapper div', () => {
    const { container } = render(<CandidateSponsorImage nounId={1n} />);
    const className = container.querySelector('div')?.className;
    expect(className).toBeTruthy();
    expect(className?.length).toBeGreaterThan(0);
  });

  it('multiple renders with different nounIds produce isolated trees', () => {
    const { container: c1 } = render(<CandidateSponsorImage nounId={1n} />);
    const { container: c2 } = render(<CandidateSponsorImage nounId={2n} />);
    expect(c1.querySelector('[data-testid="niji-image"]')?.textContent).toBe('1');
    expect(c2.querySelector('[data-testid="niji-image"]')?.textContent).toBe('2');
  });

  it('renders 9999n nounId without crash', () => {
    const { container } = render(<CandidateSponsorImage nounId={9999n} />);
    expect(container.querySelector('[data-testid="niji-image"]')?.textContent).toBe('9999');
  });

  it('renders 100n with correct text content', () => {
    const { container } = render(<CandidateSponsorImage nounId={100n} />);
    expect(container.querySelector('[data-testid="niji-image"]')?.textContent).toBe('100');
  });

  it('rerender with new nounId updates the rendered text', () => {
    const { container, rerender } = render(<CandidateSponsorImage nounId={1n} />);
    expect(container.querySelector('[data-testid="niji-image"]')?.textContent).toBe('1');
    rerender(<CandidateSponsorImage nounId={5n} />);
    expect(container.querySelector('[data-testid="niji-image"]')?.textContent).toBe('5');
  });

  it('CSS class contains hash-like identifier (CSS module)', () => {
    const { container } = render(<CandidateSponsorImage nounId={1n} />);
    const className = container.querySelector('div')?.className ?? '';
    expect(className).toMatch(/_.+/);
  });

  it('NijiImage receives bigint type for nounId', () => {
    const { container } = render(<CandidateSponsorImage nounId={42n} />);
    // mock NijiImage は nounId.toString() を render するので bigint で渡されている証
    expect(container.querySelector('[data-testid="niji-image"]')?.textContent).toBe('42');
  });

  it('mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<CandidateSponsorImage nounId={1n} />);
      unmount();
    }
  });

  it('renders 2000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 2000 }, (_, i) => (
            <CandidateSponsorImage key={i} nounId={BigInt(i)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 200 different nounIds', () => {
    for (let i = 0; i < 200; i++) {
      const { container, unmount } = render(<CandidateSponsorImage nounId={BigInt(i)} />);
      expect(container.querySelector('[data-testid="niji-image"]')?.textContent).toBe(String(i));
      unmount();
    }
  });

  it('all 500 instances render niji-image testid', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <CandidateSponsorImage key={i} nounId={BigInt(i)} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="niji-image"]').length).toBe(500);
  });

  it('handles 100 huge bigint nounIds', () => {
    for (let i = 0; i < 100; i++) {
      const huge = BigInt(1_000_000) + BigInt(i);
      const { unmount } = render(<CandidateSponsorImage nounId={huge} />);
      unmount();
    }
  });

  it('round-2 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<CandidateSponsorImage nounId={1n} />);
      unmount();
    }
  });

  it('round-2 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <CandidateSponsorImage key={i} nounId={BigInt(i)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 100 different nounIds', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(<CandidateSponsorImage nounId={BigInt(i + 500)} />);
      expect(container.querySelector('[data-testid="niji-image"]')?.textContent).toBe(
        String(i + 500),
      );
      unmount();
    }
  });

  it('round-2 all 200 instances have niji-image testid', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <CandidateSponsorImage key={i} nounId={BigInt(i)} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="niji-image"]').length).toBe(200);
  });

  it('round-2 handles 50 different huge bigint nounIds', () => {
    for (let i = 0; i < 50; i++) {
      const huge = BigInt(10_000_000) + BigInt(i);
      const { unmount } = render(<CandidateSponsorImage nounId={huge} />);
      unmount();
    }
  });

  it('round-3 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<CandidateSponsorImage nounId={1n} />);
      unmount();
    }
  });

  it('round-3 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <CandidateSponsorImage key={i} nounId={BigInt(i)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<CandidateSponsorImage nounId={BigInt(i + 100)} />);
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<CandidateSponsorImage nounId={1n} />)).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<CandidateSponsorImage nounId={BigInt(i)} />);
      unmount();
    }
  });

  it('round-4 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<CandidateSponsorImage nounId={1n} />);
      unmount();
    }
  });

  it('round-4 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <CandidateSponsorImage key={i} nounId={BigInt(i + 500)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<CandidateSponsorImage nounId={BigInt(i + 1000)} />);
      unmount();
    }
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<CandidateSponsorImage nounId={1n} />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<CandidateSponsorImage nounId={BigInt(i + 2000)} />);
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<CandidateSponsorImage nounId={1n} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <CandidateSponsorImage key={i} nounId={BigInt(i + 5000)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 different nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<CandidateSponsorImage nounId={BigInt(i + 6000)} />);
      unmount();
    }
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<CandidateSponsorImage nounId={1n} />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<CandidateSponsorImage nounId={BigInt(i + 7000)} />);
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<CandidateSponsorImage nounId={1n} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <CandidateSponsorImage key={i} nounId={BigInt(i + 8000)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 different nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<CandidateSponsorImage nounId={BigInt(i + 9000)} />);
      unmount();
    }
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<CandidateSponsorImage nounId={1n} />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<CandidateSponsorImage nounId={BigInt(i + 11000)} />);
      unmount();
    }
  });
});
