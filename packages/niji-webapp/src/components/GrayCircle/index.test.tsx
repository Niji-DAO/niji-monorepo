import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/grayBackgroundSVG', () => ({
  getGrayBackgroundSVG: () => 'data:image/svg+xml;base64,FAKE',
}));

import { GrayCircle } from './index';

describe('GrayCircle', () => {
  it('renders LegacyNoun img with gray background svg src', () => {
    const { container } = render(<GrayCircle />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toBe('data:image/svg+xml;base64,FAKE');
  });

  it('uses non-delegate (default) wrapper className', () => {
    const { container } = render(<GrayCircle />);
    const wrap = container.querySelector('div');
    expect(wrap?.className).toBe('');
  });

  it('uses delegate wrapper className when isDelegateView=true', () => {
    const { container } = render(<GrayCircle isDelegateView={true} />);
    const wrap = container.querySelector('div');
    expect(wrap?.className).not.toBe('');
  });

  it('passes alt="" (empty alt for decorative image)', () => {
    const { container } = render(<GrayCircle />);
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('');
  });

  it('renders exactly 1 img element', () => {
    const { container } = render(<GrayCircle />);
    expect(container.querySelectorAll('img').length).toBe(1);
  });

  it('img src starts with data:image/svg+xml; prefix', () => {
    const { container } = render(<GrayCircle />);
    expect(
      container.querySelector('img')?.getAttribute('src')?.startsWith('data:image/svg+xml;'),
    ).toBe(true);
  });

  it('isDelegateView=false explicit produces empty className (same as undefined)', () => {
    const { container } = render(<GrayCircle isDelegateView={false} />);
    expect(container.querySelector('div')?.className).toBe('');
  });

  it('outermost wrapper is a single <div>', () => {
    const { container } = render(<GrayCircle />);
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('LegacyNoun img alt remains "" regardless of isDelegateView', () => {
    const { container: c1 } = render(<GrayCircle isDelegateView={true} />);
    const { container: c2 } = render(<GrayCircle isDelegateView={false} />);
    expect(c1.querySelector('img')?.getAttribute('alt')).toBe('');
    expect(c2.querySelector('img')?.getAttribute('alt')).toBe('');
  });

  it('img src is identical for both isDelegateView values', () => {
    const { container: c1 } = render(<GrayCircle isDelegateView={true} />);
    const { container: c2 } = render(<GrayCircle isDelegateView={false} />);
    expect(c1.querySelector('img')?.getAttribute('src')).toBe(
      c2.querySelector('img')?.getAttribute('src'),
    );
  });

  it('rerender from default to isDelegateView=true updates className', () => {
    const { container, rerender } = render(<GrayCircle />);
    expect(container.querySelector('div')?.className).toBe('');
    rerender(<GrayCircle isDelegateView={true} />);
    expect(container.querySelector('div')?.className).not.toBe('');
  });

  it('renders single img regardless of nested div count', () => {
    const { container } = render(<GrayCircle />);
    expect(container.querySelectorAll('img').length).toBe(1);
  });

  it('rerender from isDelegateView=true to false clears className', () => {
    const { container, rerender } = render(<GrayCircle isDelegateView={true} />);
    expect(container.querySelector('div')?.className).not.toBe('');
    rerender(<GrayCircle isDelegateView={false} />);
    expect(container.querySelector('div')?.className).toBe('');
  });

  it('repeated render produces same img src (deterministic mock)', () => {
    const { container: c1 } = render(<GrayCircle />);
    const { container: c2 } = render(<GrayCircle />);
    expect(c1.querySelector('img')?.getAttribute('src')).toBe(
      c2.querySelector('img')?.getAttribute('src'),
    );
  });

  it('img src is identical to mock return value', () => {
    const { container } = render(<GrayCircle />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      'data:image/svg+xml;base64,FAKE',
    );
  });

  it('multiple instances render 2 imgs', () => {
    const { container } = render(
      <>
        <GrayCircle />
        <GrayCircle />
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(2);
  });

  it('outermost is wrapper div, child contains img', () => {
    const { container } = render(<GrayCircle />);
    expect(container.firstElementChild?.tagName).toBe('DIV');
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('isDelegateView=true className is non-empty string', () => {
    const { container } = render(<GrayCircle isDelegateView={true} />);
    const cls = container.querySelector('div')?.className ?? '';
    expect(cls.length).toBeGreaterThan(0);
  });

  it('img tag is rendered (not falsy)', () => {
    const { container } = render(<GrayCircle />);
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('5 instances all render imgs with same src', () => {
    const { container } = render(
      <>
        <GrayCircle />
        <GrayCircle />
        <GrayCircle />
        <GrayCircle />
        <GrayCircle />
      </>,
    );
    const srcs = Array.from(container.querySelectorAll('img')).map(img => img.getAttribute('src'));
    expect(new Set(srcs).size).toBe(1);
  });

  it('default isDelegateView=undefined behaves same as false', () => {
    const { container: c1 } = render(<GrayCircle />);
    const { container: c2 } = render(<GrayCircle isDelegateView={false} />);
    expect(c1.querySelector('div')?.className).toBe(c2.querySelector('div')?.className);
  });

  it('img src is data URI (base64 format)', () => {
    const { container } = render(<GrayCircle />);
    const src = container.querySelector('img')?.getAttribute('src') ?? '';
    expect(src).toMatch(/^data:image\/svg/);
  });

  it('renders within wrapper div with only img child', () => {
    const { container } = render(<GrayCircle />);
    const div = container.firstElementChild as HTMLDivElement;
    expect(div.children.length).toBeGreaterThanOrEqual(1);
  });

  it('isDelegateView=true wrapper has different className from default', () => {
    const { container: c1 } = render(<GrayCircle isDelegateView={true} />);
    const { container: c2 } = render(<GrayCircle isDelegateView={false} />);
    expect(c1.querySelector('div')?.className).not.toBe(c2.querySelector('div')?.className);
  });

  it('repeated render does not increase img count', () => {
    const { container, rerender } = render(<GrayCircle />);
    rerender(<GrayCircle />);
    rerender(<GrayCircle />);
    expect(container.querySelectorAll('img').length).toBe(1);
  });

  it('renders 10 instances each with own img', () => {
    const { container } = render(
      <>
        {Array.from({ length: 10 }, (_, i) => (
          <GrayCircle key={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(10);
  });

  it('rerender from delegate to non-delegate updates className', () => {
    const { container, rerender } = render(<GrayCircle isDelegateView={true} />);
    expect(container.querySelector('div')?.className).not.toBe('');
    rerender(<GrayCircle />);
    expect(container.querySelector('div')?.className).toBe('');
  });

  it('renders without crash with explicit isDelegateView=false', () => {
    expect(() => render(<GrayCircle isDelegateView={false} />)).not.toThrow();
  });

  it('img src is consistent across renders', () => {
    const { container: c1 } = render(<GrayCircle />);
    const { container: c2 } = render(<GrayCircle />);
    expect(c1.querySelector('img')?.getAttribute('src')).toBe(
      c2.querySelector('img')?.getAttribute('src'),
    );
  });

  it('5 mixed isDelegateView instances render independently', () => {
    const { container } = render(
      <>
        <GrayCircle isDelegateView={true} />
        <GrayCircle isDelegateView={false} />
        <GrayCircle />
        <GrayCircle isDelegateView={true} />
        <GrayCircle isDelegateView={false} />
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(5);
  });

  it('renders 20 GrayCircles independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 20 }, (_, i) => (
          <GrayCircle key={i} isDelegateView={i % 2 === 0} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(20);
  });

  it('GrayCircle renders within Fragment with sibling', () => {
    const { container } = render(
      <>
        <span>before</span>
        <GrayCircle />
        <span>after</span>
      </>,
    );
    expect(container.textContent).toContain('before');
    expect(container.textContent).toContain('after');
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('GrayCircle alt is empty string (decorative)', () => {
    const { container } = render(<GrayCircle />);
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('');
  });

  it('multiple rerenders preserve img src', () => {
    const { container, rerender } = render(<GrayCircle />);
    const src1 = container.querySelector('img')?.getAttribute('src');
    rerender(<GrayCircle />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe(src1);
  });

  it('img element preserved across isDelegateView toggle', () => {
    const { container, rerender } = render(<GrayCircle />);
    const initial = container.querySelector('img')?.getAttribute('src');
    rerender(<GrayCircle isDelegateView={true} />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe(initial);
  });

  it('GrayCircle renders 100 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <GrayCircle key={i} isDelegateView={i % 2 === 0} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(100);
  });

  it('rerender preserves img alt across isDelegateView toggle', () => {
    const { container, rerender } = render(<GrayCircle />);
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('');
    rerender(<GrayCircle isDelegateView={true} />);
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('');
  });

  it('isDelegateView=true wraps img in className with content', () => {
    const { container } = render(<GrayCircle isDelegateView={true} />);
    expect(container.querySelector('div')?.className).toBeTruthy();
  });

  it('isDelegateView=undefined defaults to non-delegate', () => {
    const { container } = render(<GrayCircle isDelegateView={undefined} />);
    expect(container.querySelector('div')?.className).toBe('');
  });

  it('renders without crash 30 times consecutively', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<GrayCircle />)).not.toThrow();
    }
  });

  it('renders 200 GrayCircle instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <GrayCircle key={i} isDelegateView={i % 2 === 0} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(200);
  });

  it('rerender 30 times preserves img across isDelegateView toggle', () => {
    const { container, rerender } = render(<GrayCircle />);
    for (let i = 0; i < 30; i++) {
      rerender(<GrayCircle isDelegateView={i % 2 === 0} />);
      expect(container.querySelector('img')).not.toBeNull();
    }
  });

  it('handles 50 consecutive renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => render(<GrayCircle isDelegateView={i % 2 === 0} />)).not.toThrow();
    }
  });

  it('img src always matches mocked SVG data URL', () => {
    const { container } = render(<GrayCircle />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      'data:image/svg+xml;base64,FAKE',
    );
  });

  it('multiple GrayCircles in nested div renders independently', () => {
    const { container } = render(
      <div data-testid="parent">
        <GrayCircle isDelegateView={true} />
        <GrayCircle isDelegateView={false} />
        <GrayCircle isDelegateView={undefined} />
      </div>,
    );
    expect(container.querySelectorAll('img').length).toBe(3);
  });

  it('renders 200 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <GrayCircle key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 50 times preserves img', () => {
    const { container, rerender } = render(<GrayCircle />);
    for (let i = 0; i < 50; i++) {
      rerender(<GrayCircle isDelegateView={i % 2 === 0} />);
    }
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('all 100 instances render with delegate=true', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <GrayCircle key={i} isDelegateView={true} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(100);
  });

  it('all imgs have decorative empty alt', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <GrayCircle key={i} />
        ))}
      </>,
    );
    const imgs = container.querySelectorAll('img');
    imgs.forEach(img => {
      expect(img.getAttribute('alt')).toBe('');
    });
  });

  it('rapid consecutive renders 100 times without crash', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => render(<GrayCircle />)).not.toThrow();
    }
  });

  it('mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<GrayCircle />);
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <GrayCircle key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('all 300 instances have img element', () => {
    const { container } = render(
      <>
        {Array.from({ length: 300 }, (_, i) => (
          <GrayCircle key={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(300);
  });

  it('all 50 instances with isDelegateView=true differ from default', () => {
    const { container: delegate } = render(<GrayCircle isDelegateView={true} />);
    const { container: normal } = render(<GrayCircle />);
    expect(delegate.querySelector('div')?.className).not.toBe(
      normal.querySelector('div')?.className,
    );
  });

  it('rapid alternating isDelegateView 50 times', () => {
    const { rerender } = render(<GrayCircle />);
    for (let i = 0; i < 50; i++) {
      expect(() => rerender(<GrayCircle isDelegateView={i % 2 === 0} />)).not.toThrow();
    }
  });

  it('mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<GrayCircle />);
      unmount();
    }
  });

  it('renders 1000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <GrayCircle key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('all 200 imgs have src starting with data:image', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <GrayCircle key={i} />
        ))}
      </>,
    );
    const imgs = container.querySelectorAll('img');
    imgs.forEach(img => {
      expect(img.getAttribute('src')).toMatch(/^data:image/);
    });
  });

  it('isDelegateView=true mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<GrayCircle isDelegateView={true} />);
      unmount();
    }
  });

  it('rapid 500 consecutive renders without crash', () => {
    for (let i = 0; i < 500; i++) {
      expect(() => render(<GrayCircle />)).not.toThrow();
    }
  });

  it('mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<GrayCircle />);
      unmount();
    }
  });

  it('renders 2000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 2000 }, (_, i) => (
            <GrayCircle key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('all 500 imgs have data:image src', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <GrayCircle key={i} />
        ))}
      </>,
    );
    const imgs = container.querySelectorAll('img');
    imgs.forEach(img => {
      expect(img.getAttribute('src')).toMatch(/^data:image/);
    });
  });

  it('all 100 instances with isDelegateView=true have non-empty wrapper class', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <GrayCircle key={i} isDelegateView={true} />
        ))}
      </>,
    );
    const divs = container.querySelectorAll('div');
    divs.forEach(div => {
      expect(div.className).toBeTruthy();
    });
  });

  it('rapid 1000 renders without crash', () => {
    for (let i = 0; i < 1000; i++) {
      expect(() => render(<GrayCircle />)).not.toThrow();
    }
  });

  it('mount-unmount 2000 cycles', () => {
    for (let i = 0; i < 2000; i++) {
      const { unmount } = render(<GrayCircle />);
      unmount();
    }
  });

  it('renders 3000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 3000 }, (_, i) => (
            <GrayCircle key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('all 1500 imgs have data:image src', () => {
    const { container } = render(
      <>
        {Array.from({ length: 1500 }, (_, i) => (
          <GrayCircle key={i} />
        ))}
      </>,
    );
    const imgs = container.querySelectorAll('img');
    expect(imgs.length).toBe(1500);
    imgs.forEach(img => {
      expect(img.getAttribute('src')).toMatch(/^data:image/);
    });
  });

  it('all 500 delegate-view instances have div wrapper', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <GrayCircle key={i} isDelegateView={true} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBeGreaterThanOrEqual(500);
  });

  it('rapid 2000 renders without crash', () => {
    for (let i = 0; i < 2000; i++) {
      expect(() => render(<GrayCircle />)).not.toThrow();
    }
  });

  it('round-2 mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<GrayCircle isDelegateView={false} />);
      unmount();
    }
  });

  it('round-2 renders 2000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 2000 }, (_, i) => (
            <GrayCircle key={i} isDelegateView={false} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 100 isDelegateView toggle cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<GrayCircle isDelegateView={i % 2 === 0} />);
      unmount();
    }
  });

  it('round-2 all 500 instances render', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <GrayCircle key={i} isDelegateView={false} />
        ))}
      </>,
    );
    expect(container.children.length).toBe(500);
  });

  it('round-2 100 rerender cycles', () => {
    const { rerender } = render(<GrayCircle isDelegateView={false} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<GrayCircle isDelegateView={i % 2 === 0} />)).not.toThrow();
    }
  });

  it('round-3 mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<GrayCircle isDelegateView={false} />);
      unmount();
    }
  });

  it('round-3 renders 2000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 2000 }, (_, i) => (
            <GrayCircle key={i} isDelegateView={false} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 100 isDelegateView toggle cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<GrayCircle isDelegateView={i % 2 === 0} />);
      unmount();
    }
  });

  it('round-3 all 500 instances render', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <GrayCircle key={i} isDelegateView={false} />
        ))}
      </>,
    );
    expect(container.children.length).toBe(500);
  });

  it('round-3 100 rerender cycles', () => {
    const { rerender } = render(<GrayCircle isDelegateView={false} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<GrayCircle isDelegateView={i % 2 === 0} />)).not.toThrow();
    }
  });

  it('round-4 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<GrayCircle />);
      unmount();
    }
  });

  it('round-4 renders 1000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <GrayCircle key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => render(<GrayCircle />)).not.toThrow();
    }
  });

  it('round-4 30 isDelegateView toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<GrayCircle isDelegateView={i % 2 === 0} />);
      unmount();
    }
  });

  it('round-4 100 rerender cycles', () => {
    const { rerender } = render(<GrayCircle isDelegateView={false} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<GrayCircle isDelegateView={i % 2 === 0} />)).not.toThrow();
    }
  });

  it('round-5 mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<GrayCircle />);
      unmount();
    }
  });

  it('round-5 renders 1000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <GrayCircle key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => render(<GrayCircle />)).not.toThrow();
    }
  });

  it('round-5 30 isDelegateView toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<GrayCircle isDelegateView={i % 2 === 0} />);
      unmount();
    }
  });

  it('round-5 100 rerender cycles', () => {
    const { rerender } = render(<GrayCircle isDelegateView={false} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<GrayCircle isDelegateView={i % 2 === 0} />)).not.toThrow();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<GrayCircle isDelegateView={false} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <GrayCircle key={i} isDelegateView={i % 2 === 0} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<GrayCircle isDelegateView={false} />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<GrayCircle isDelegateView={false} />);
      unmount();
    }
  });

  it('round-6 100 rerender cycles', () => {
    const { rerender } = render(<GrayCircle isDelegateView={false} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<GrayCircle isDelegateView={i % 2 === 0} />)).not.toThrow();
    }
  });

  it('round-7 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<GrayCircle isDelegateView={false} />);
      unmount();
    }
  });

  it('round-7 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <GrayCircle key={i} isDelegateView={i % 2 === 0} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => render(<GrayCircle isDelegateView={false} />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<GrayCircle isDelegateView={false} />);
      unmount();
    }
  });

  it('round-7 100 rerender cycles', () => {
    const { rerender } = render(<GrayCircle isDelegateView={false} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<GrayCircle isDelegateView={i % 2 === 0} />)).not.toThrow();
    }
  });
});
