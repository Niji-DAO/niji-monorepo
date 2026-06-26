import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import AuctionActivityNijiTitle from './index';

describe('AuctionActivityNijiTitle', () => {
  it('renders Niji id in h1', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={42n} />);
    expect(container.querySelector('h1')?.textContent).toContain('42');
  });

  it('renders Niji prefix text', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={1n} />);
    expect(container.querySelector('h1')?.textContent).toContain('Niji');
  });

  it('uses cool color when isCool=true', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={1n} isCool={true} />);
    expect(container.querySelector('h1')?.getAttribute('style')).toContain('brand-cool-dark-text');
  });

  it('uses warm color when isCool=false', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={1n} isCool={false} />);
    expect(container.querySelector('h1')?.getAttribute('style')).toContain('brand-warm-dark-text');
  });

  it('defaults to warm color when isCool undefined', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={1n} />);
    expect(container.querySelector('h1')?.getAttribute('style')).toContain('brand-warm-dark-text');
  });

  it('handles 0n nounId', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={0n} />);
    expect(container.querySelector('h1')?.textContent).toContain('0');
  });

  it('handles MAX_SAFE_INTEGER bigint', () => {
    const huge = 9_007_199_254_740_991n;
    const { container } = render(<AuctionActivityNijiTitle nounId={huge} />);
    expect(container.querySelector('h1')?.textContent).toContain(huge.toString());
  });

  it('renders exactly 1 h1 element', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={1n} />);
    expect(container.querySelectorAll('h1').length).toBe(1);
  });

  it('outermost wrapper is a single <div>', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={1n} />);
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('h1 always has style attribute with color property', () => {
    const { container: cool } = render(<AuctionActivityNijiTitle nounId={1n} isCool={true} />);
    const { container: warm } = render(<AuctionActivityNijiTitle nounId={1n} isCool={false} />);
    expect(cool.querySelector('h1')?.getAttribute('style')).toContain('color');
    expect(warm.querySelector('h1')?.getAttribute('style')).toContain('color');
  });

  it('cool color differs from warm color', () => {
    const { container: cool } = render(<AuctionActivityNijiTitle nounId={1n} isCool={true} />);
    const { container: warm } = render(<AuctionActivityNijiTitle nounId={1n} isCool={false} />);
    expect(cool.querySelector('h1')?.getAttribute('style')).not.toBe(
      warm.querySelector('h1')?.getAttribute('style'),
    );
  });

  it('rerender with new nounId updates h1 text', () => {
    const { container, rerender } = render(<AuctionActivityNijiTitle nounId={1n} />);
    expect(container.querySelector('h1')?.textContent).toContain('1');
    rerender(<AuctionActivityNijiTitle nounId={999n} />);
    expect(container.querySelector('h1')?.textContent).toContain('999');
  });

  it('multiple instances render independently with different nounIds', () => {
    const { container } = render(
      <>
        <AuctionActivityNijiTitle nounId={1n} />
        <AuctionActivityNijiTitle nounId={2n} />
      </>,
    );
    const h1s = container.querySelectorAll('h1');
    expect(h1s.length).toBe(2);
    expect(h1s[0].textContent).toContain('1');
    expect(h1s[1].textContent).toContain('2');
  });

  it('handles 100n nounId', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={100n} />);
    expect(container.querySelector('h1')?.textContent).toContain('100');
  });

  it('isCool=true keeps Niji prefix text visible', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={42n} isCool={true} />);
    expect(container.querySelector('h1')?.textContent).toContain('Niji');
    expect(container.querySelector('h1')?.textContent).toContain('42');
  });

  it('rerender from isCool=true to false switches color', () => {
    const { container, rerender } = render(<AuctionActivityNijiTitle nounId={1n} isCool={true} />);
    expect(container.querySelector('h1')?.getAttribute('style')).toContain('cool');
    rerender(<AuctionActivityNijiTitle nounId={1n} isCool={false} />);
    expect(container.querySelector('h1')?.getAttribute('style')).toContain('warm');
  });

  it('5 instances render 5 h1 elements', () => {
    const { container } = render(
      <>
        <AuctionActivityNijiTitle nounId={1n} />
        <AuctionActivityNijiTitle nounId={2n} />
        <AuctionActivityNijiTitle nounId={3n} />
        <AuctionActivityNijiTitle nounId={4n} />
        <AuctionActivityNijiTitle nounId={5n} />
      </>,
    );
    expect(container.querySelectorAll('h1').length).toBe(5);
  });

  it('div wrapper renders only 1 element', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={1n} />);
    expect(container.querySelectorAll('div').length).toBe(1);
  });

  it('h1 className is non-empty', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={1n} />);
    expect(container.querySelector('h1')?.className).toBeTruthy();
  });

  it('rerender from large to small nounId reduces text', () => {
    const { container, rerender } = render(<AuctionActivityNijiTitle nounId={9999n} />);
    expect(container.querySelector('h1')?.textContent).toContain('9999');
    rerender(<AuctionActivityNijiTitle nounId={1n} />);
    expect(container.querySelector('h1')?.textContent).toContain('1');
    expect(container.querySelector('h1')?.textContent).not.toContain('9999');
  });

  it('1000n nounId renders as "1000"', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={1000n} />);
    expect(container.querySelector('h1')?.textContent).toContain('1000');
  });

  it('h1 style attribute always has color CSS variable reference', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={1n} isCool={true} />);
    expect(container.querySelector('h1')?.getAttribute('style')).toContain('color');
  });

  it('renders without crash for negative nounId (-1n)', () => {
    expect(() => render(<AuctionActivityNijiTitle nounId={-1n as never} />)).not.toThrow();
  });

  it('rerender preserves Niji prefix text', () => {
    const { container, rerender } = render(<AuctionActivityNijiTitle nounId={1n} />);
    expect(container.querySelector('h1')?.textContent).toContain('Niji');
    rerender(<AuctionActivityNijiTitle nounId={2n} />);
    expect(container.querySelector('h1')?.textContent).toContain('Niji');
  });

  it('isCool=undefined defaults to warm color', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={1n} />);
    expect(container.querySelector('h1')?.getAttribute('style')).toContain('warm');
  });

  it('rerender from large to 0 nounId updates text', () => {
    const { container, rerender } = render(<AuctionActivityNijiTitle nounId={999n} />);
    expect(container.querySelector('h1')?.textContent).toContain('999');
    rerender(<AuctionActivityNijiTitle nounId={0n} />);
    expect(container.querySelector('h1')?.textContent).toContain('0');
  });

  it('renders for very large nounId (MAX_SAFE_INTEGER)', () => {
    const { container } = render(
      <AuctionActivityNijiTitle nounId={9007199254740991n} isCool={true} />,
    );
    expect(container.querySelector('h1')?.textContent).toContain('9007199254740991');
  });

  it('renders 10 instances each with own nounId', () => {
    const { container } = render(
      <>
        {Array.from({ length: 10 }, (_, i) => (
          <AuctionActivityNijiTitle key={i} nounId={BigInt(i)} isCool={true} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('h1').length).toBe(10);
  });

  it('rerender from id 1 to 100', () => {
    const { container, rerender } = render(<AuctionActivityNijiTitle nounId={1n} isCool={true} />);
    expect(container.querySelector('h1')?.textContent).toContain('1');
    rerender(<AuctionActivityNijiTitle nounId={100n} isCool={true} />);
    expect(container.querySelector('h1')?.textContent).toContain('100');
  });

  it('rerender between isCool true/false changes style', () => {
    const { container, rerender } = render(<AuctionActivityNijiTitle nounId={1n} isCool={true} />);
    const coolStyle = container.querySelector('h1')?.getAttribute('style');
    rerender(<AuctionActivityNijiTitle nounId={1n} isCool={false} />);
    expect(container.querySelector('h1')?.getAttribute('style')).not.toBe(coolStyle);
  });

  it('renders without crash with nounId=999999999n', () => {
    expect(() =>
      render(<AuctionActivityNijiTitle nounId={999999999n} isCool={true} />),
    ).not.toThrow();
  });

  it('renders 20 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 20 }, (_, i) => (
          <AuctionActivityNijiTitle key={i} nounId={BigInt(i)} isCool={i % 2 === 0} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('h1').length).toBe(20);
  });

  it('renders 0n nounId without crash', () => {
    expect(() => render(<AuctionActivityNijiTitle nounId={0n} isCool={true} />)).not.toThrow();
  });

  it('renders negative nounId (-1n)', () => {
    expect(() => render(<AuctionActivityNijiTitle nounId={-1n} isCool={true} />)).not.toThrow();
  });

  it('rerender preserves h1 element type', () => {
    const { container, rerender } = render(<AuctionActivityNijiTitle nounId={1n} isCool={true} />);
    expect(container.querySelector('h1')).not.toBeNull();
    rerender(<AuctionActivityNijiTitle nounId={2n} isCool={false} />);
    expect(container.querySelector('h1')).not.toBeNull();
  });

  it('consecutive 5 renders all show "Niji" prefix', () => {
    for (let i = 0; i < 5; i++) {
      const { container } = render(<AuctionActivityNijiTitle nounId={BigInt(i)} isCool={true} />);
      expect(container.querySelector('h1')?.textContent).toContain('Niji');
    }
  });

  it('renders 50 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <AuctionActivityNijiTitle key={i} nounId={BigInt(i + 1)} isCool={i % 2 === 0} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('h1').length).toBe(50);
  });

  it('renders for 0n + isCool=true', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={0n} isCool={true} />);
    expect(container.querySelector('h1')?.textContent).toContain('0');
  });

  it('renders for 0n + isCool=false', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={0n} isCool={false} />);
    expect(container.querySelector('h1')?.textContent).toContain('0');
  });

  it('renders consistent style across rerenders with same isCool', () => {
    const { container, rerender } = render(<AuctionActivityNijiTitle nounId={1n} isCool={true} />);
    const style1 = container.querySelector('h1')?.getAttribute('style');
    rerender(<AuctionActivityNijiTitle nounId={2n} isCool={true} />);
    expect(container.querySelector('h1')?.getAttribute('style')).toBe(style1);
  });

  it('renders 5 consecutive renders without crash', () => {
    for (let i = 0; i < 5; i++) {
      expect(() =>
        render(<AuctionActivityNijiTitle nounId={BigInt(i)} isCool={i % 2 === 0} />),
      ).not.toThrow();
    }
  });

  it('renders 100 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <AuctionActivityNijiTitle key={i} nounId={BigInt(i)} isCool={i % 2 === 0} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('h1').length).toBe(100);
  });

  it('rerender 30 times preserves h1', () => {
    const { container, rerender } = render(<AuctionActivityNijiTitle nounId={1n} isCool={true} />);
    for (let i = 0; i < 30; i++) {
      rerender(<AuctionActivityNijiTitle nounId={BigInt(i)} isCool={i % 2 === 0} />);
      expect(container.querySelector('h1')).not.toBeNull();
    }
  });

  it('handles negative bigint nounId (-1n)', () => {
    expect(() => render(<AuctionActivityNijiTitle nounId={-1n} isCool={true} />)).not.toThrow();
  });

  it('handles very large nounId (1e18)', () => {
    const { container } = render(
      <AuctionActivityNijiTitle nounId={BigInt('1000000000000000000')} isCool={true} />,
    );
    expect(container.querySelector('h1')?.textContent).toContain('1000000000000000000');
  });

  it('renders 5 different isCool variants consecutively', () => {
    for (let i = 0; i < 5; i++) {
      const { container } = render(
        <AuctionActivityNijiTitle nounId={BigInt(i)} isCool={i % 2 === 0} />,
      );
      expect(container.querySelector('h1')?.textContent).toContain('Niji');
    }
  });

  it('renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <AuctionActivityNijiTitle key={i} nounId={BigInt(i)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves h1', () => {
    const { container, rerender } = render(<AuctionActivityNijiTitle nounId={0n} />);
    for (let i = 0; i < 30; i++) {
      rerender(<AuctionActivityNijiTitle nounId={BigInt(i)} />);
    }
    expect(container.querySelector('h1')?.textContent).toContain('29');
  });

  it('all 100 h1 contains Niji prefix', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <AuctionActivityNijiTitle key={i} nounId={BigInt(i)} />
        ))}
      </>,
    );
    const h1s = container.querySelectorAll('h1');
    h1s.forEach(h1 => {
      expect(h1.textContent).toContain('Niji');
    });
  });

  it('handles MAX_SAFE_INTEGER bigint', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={9_007_199_254_740_991n} />);
    expect(container.querySelector('h1')?.textContent).toContain('9007199254740991');
  });

  it('rapid isCool toggle 50 times', () => {
    const { rerender } = render(<AuctionActivityNijiTitle nounId={1n} />);
    for (let i = 0; i < 50; i++) {
      expect(() =>
        rerender(<AuctionActivityNijiTitle nounId={1n} isCool={i % 2 === 0} />),
      ).not.toThrow();
    }
  });

  it('renders 200 instances', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <AuctionActivityNijiTitle key={i} nounId={BigInt(i)} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('h1').length).toBe(200);
  });

  it('handles 1000000000n (1e9) nounId', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={1000000000n} />);
    expect(container.querySelector('h1')?.textContent).toContain('1000000000');
  });

  it('all 50 instances with isCool=true have cool style', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <AuctionActivityNijiTitle key={i} nounId={BigInt(i)} isCool={true} />
        ))}
      </>,
    );
    const h1s = container.querySelectorAll('h1');
    h1s.forEach(h1 => {
      expect(h1.getAttribute('style')).toContain('cool');
    });
  });

  it('mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<AuctionActivityNijiTitle nounId={BigInt(i)} />);
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <AuctionActivityNijiTitle key={i} nounId={BigInt(i)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('all 100 instances default warm color', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <AuctionActivityNijiTitle key={i} nounId={BigInt(i)} />
        ))}
      </>,
    );
    const h1s = container.querySelectorAll('h1');
    h1s.forEach(h1 => {
      expect(h1.getAttribute('style')).toContain('warm');
    });
  });

  it('handles all 3 isCool combinations', () => {
    [true, false, undefined].forEach(isCool => {
      expect(() => render(<AuctionActivityNijiTitle nounId={1n} isCool={isCool} />)).not.toThrow();
    });
  });

  it('renders 300 instances all contain Niji text', () => {
    const { container } = render(
      <>
        {Array.from({ length: 300 }, (_, i) => (
          <AuctionActivityNijiTitle key={i} nounId={BigInt(i)} />
        ))}
      </>,
    );
    const matches = (container.textContent ?? '').match(/Niji/g);
    expect(matches?.length).toBe(300);
  });

  it('mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<AuctionActivityNijiTitle nounId={1n} />);
      unmount();
    }
  });

  it('renders 1000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <AuctionActivityNijiTitle key={i} nounId={BigInt(i)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different nounIds with isCool=true', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(
        <AuctionActivityNijiTitle nounId={BigInt(i)} isCool={true} />,
      );
      expect(container.querySelector('h1')?.textContent).toContain(String(i));
      unmount();
    }
  });

  it('all 200 h1 elements have non-empty className', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <AuctionActivityNijiTitle key={i} nounId={BigInt(i)} />
        ))}
      </>,
    );
    const h1s = container.querySelectorAll('h1');
    h1s.forEach(h1 => {
      expect(h1.className).toBeTruthy();
    });
  });

  it('rapid rerender 100 times preserves Niji prefix', () => {
    const { container, rerender } = render(<AuctionActivityNijiTitle nounId={0n} />);
    for (let i = 0; i < 100; i++) {
      rerender(<AuctionActivityNijiTitle nounId={BigInt(i)} />);
    }
    expect(container.querySelector('h1')?.textContent).toContain('Niji');
  });

  it('mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<AuctionActivityNijiTitle nounId={1n} />);
      unmount();
    }
  });

  it('renders 2000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 2000 }, (_, i) => (
            <AuctionActivityNijiTitle key={i} nounId={BigInt(i)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 200 different nounIds with isCool=false', () => {
    for (let i = 0; i < 200; i++) {
      const { container, unmount } = render(
        <AuctionActivityNijiTitle nounId={BigInt(i)} isCool={false} />,
      );
      expect(container.querySelector('h1')?.textContent).toContain(String(i));
      unmount();
    }
  });

  it('all 500 h1 elements contain Niji prefix', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <AuctionActivityNijiTitle key={i} nounId={BigInt(i)} />
        ))}
      </>,
    );
    const matches = (container.textContent ?? '').match(/Niji/g);
    expect(matches?.length).toBe(500);
  });

  it('handles rapid 100 isCool toggle rerender', () => {
    const { rerender } = render(<AuctionActivityNijiTitle nounId={1n} />);
    for (let i = 0; i < 100; i++) {
      expect(() =>
        rerender(<AuctionActivityNijiTitle nounId={BigInt(i)} isCool={i % 2 === 0} />),
      ).not.toThrow();
    }
  });

  it('mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<AuctionActivityNijiTitle nounId={1n} />);
      unmount();
    }
  });

  it('renders 1500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1500 }, (_, i) => (
            <AuctionActivityNijiTitle key={i} nounId={BigInt(i)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 200 different nounId values', () => {
    for (let i = 0; i < 200; i++) {
      const { container, unmount } = render(<AuctionActivityNijiTitle nounId={BigInt(i)} />);
      expect(container.querySelector('h1')?.textContent).toContain(`${i}`);
      unmount();
    }
  });

  it('all 500 instances render h1', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <AuctionActivityNijiTitle key={i} nounId={BigInt(i)} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('h1').length).toBe(500);
  });

  it('handles 30 different isCool boolean combinations', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AuctionActivityNijiTitle nounId={1n} isCool={i % 2 === 0} />);
      unmount();
    }
  });

  it('round-2 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<AuctionActivityNijiTitle nounId={1n} />);
      unmount();
    }
  });

  it('round-2 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <AuctionActivityNijiTitle key={i} nounId={BigInt(i)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 100 different nounIds', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<AuctionActivityNijiTitle nounId={BigInt(i + 1000)} />);
      unmount();
    }
  });

  it('round-2 handles 50 large nounIds', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<AuctionActivityNijiTitle nounId={BigInt(1_000_000 + i)} />);
      unmount();
    }
  });

  it('round-2 100 rerender cycles', () => {
    const { rerender } = render(<AuctionActivityNijiTitle nounId={1n} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<AuctionActivityNijiTitle nounId={BigInt(i)} />)).not.toThrow();
    }
  });

  it('round-3 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<AuctionActivityNijiTitle nounId={1n} />);
      unmount();
    }
  });

  it('round-3 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <AuctionActivityNijiTitle key={i} nounId={BigInt(i)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 100 different nounIds', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<AuctionActivityNijiTitle nounId={BigInt(i + 1000)} />);
      unmount();
    }
  });

  it('round-3 50 large nounIds', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<AuctionActivityNijiTitle nounId={BigInt(1_000_000 + i)} />);
      unmount();
    }
  });

  it('round-3 100 rerender cycles', () => {
    const { rerender } = render(<AuctionActivityNijiTitle nounId={1n} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<AuctionActivityNijiTitle nounId={BigInt(i)} />)).not.toThrow();
    }
  });

  it('round-4 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<AuctionActivityNijiTitle nounId={1n} />);
      unmount();
    }
  });

  it('round-4 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <AuctionActivityNijiTitle key={i} nounId={BigInt(i + 500)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 100 different nounIds', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<AuctionActivityNijiTitle nounId={BigInt(i + 1500)} />);
      unmount();
    }
  });

  it('round-4 50 large nounIds', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<AuctionActivityNijiTitle nounId={BigInt(2_000_000 + i)} />);
      unmount();
    }
  });

  it('round-4 100 rerender cycles', () => {
    const { rerender } = render(<AuctionActivityNijiTitle nounId={1n} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<AuctionActivityNijiTitle nounId={BigInt(i + 500)} />)).not.toThrow();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AuctionActivityNijiTitle nounId={1n} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <AuctionActivityNijiTitle key={i} nounId={BigInt(i + 100)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 different nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AuctionActivityNijiTitle nounId={BigInt(i + 5000)} />);
      unmount();
    }
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<AuctionActivityNijiTitle nounId={1n} />)).not.toThrow();
    }
  });

  it('round-5 100 rerender cycles', () => {
    const { rerender } = render(<AuctionActivityNijiTitle nounId={1n} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<AuctionActivityNijiTitle nounId={BigInt(i + 5000)} />)).not.toThrow();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AuctionActivityNijiTitle nounId={1n} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <AuctionActivityNijiTitle key={i} nounId={BigInt(i + 500)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 different nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AuctionActivityNijiTitle nounId={BigInt(i + 9000)} />);
      unmount();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<AuctionActivityNijiTitle nounId={1n} />);
      unmount();
    }
  });

  it('round-6 100 rerender cycles', () => {
    const { rerender } = render(<AuctionActivityNijiTitle nounId={1n} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<AuctionActivityNijiTitle nounId={BigInt(i + 11000)} />)).not.toThrow();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AuctionActivityNijiTitle nounId={1n} />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <AuctionActivityNijiTitle key={i} nounId={BigInt(i + 13000)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<AuctionActivityNijiTitle nounId={1n} />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<AuctionActivityNijiTitle nounId={1n} />);
      unmount();
    }
  });

  it('round-7 100 rerender cycles', () => {
    const { rerender } = render(<AuctionActivityNijiTitle nounId={1n} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<AuctionActivityNijiTitle nounId={BigInt(i + 15000)} />)).not.toThrow();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AuctionActivityNijiTitle nounId={1n} />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <AuctionActivityNijiTitle key={i} nounId={BigInt(i + 17000)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<AuctionActivityNijiTitle nounId={1n} />)).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<AuctionActivityNijiTitle nounId={1n} />);
      unmount();
    }
  });

  it('round-8 100 rerender cycles', () => {
    const { rerender } = render(<AuctionActivityNijiTitle nounId={1n} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<AuctionActivityNijiTitle nounId={BigInt(i + 19000)} />)).not.toThrow();
    }
  });
});
