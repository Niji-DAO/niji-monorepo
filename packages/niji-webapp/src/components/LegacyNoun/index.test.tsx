import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import LegacyNoun, { LoadingNoun } from './index';

describe('LegacyNoun', () => {
  it('renders img with given src + alt', () => {
    const { container } = render(<LegacyNoun imgPath="/x.png" alt="my alt" />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toBe('/x.png');
    expect(img?.getAttribute('alt')).toBe('my alt');
  });

  it('falls back to loading skull when imgPath is empty', () => {
    const { container } = render(<LegacyNoun imgPath="" alt="x" />);
    const src = container.querySelector('img')?.getAttribute('src') ?? '';
    expect(src).toMatch(/loading-skull-noun/i);
  });

  it('merges custom className', () => {
    const { container } = render(<LegacyNoun imgPath="/x.png" alt="x" className="extra" />);
    expect(container.querySelector('img')?.className).toContain('extra');
  });

  it('merges custom wrapperClassName', () => {
    const { container } = render(
      <LegacyNoun imgPath="/x.png" alt="x" wrapperClassName="wrap-class" />,
    );
    const wrap = container.querySelector('div');
    expect(wrap?.className).toContain('wrap-class');
  });
});

describe('LoadingNoun', () => {
  it('renders an img', () => {
    const { container } = render(<LoadingNoun />);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('alt')).toBe('loading noun');
  });

  it('LoadingNoun img src is loading-skull URL', () => {
    const { container } = render(<LoadingNoun />);
    const src = container.querySelector('img')?.getAttribute('src') ?? '';
    expect(src).toMatch(/loading-skull-noun/i);
  });

  it('LoadingNoun renders within div wrapper', () => {
    const { container } = render(<LoadingNoun />);
    expect(container.querySelector('div')).not.toBeNull();
    expect(container.querySelector('div img')).not.toBeNull();
  });
});

describe('LegacyNoun — additional edge cases', () => {
  it('renders with empty alt (allowed for decorative use)', () => {
    const { container } = render(<LegacyNoun imgPath="/x.png" alt="" />);
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('');
  });

  it('merges className + wrapperClassName simultaneously', () => {
    const { container } = render(
      <LegacyNoun imgPath="/x.png" alt="x" className="img-extra" wrapperClassName="wrap-extra" />,
    );
    expect(container.querySelector('img')?.className).toContain('img-extra');
    expect(container.querySelector('div')?.className).toContain('wrap-extra');
  });

  it('falls back to loading skull URL prefix when imgPath is empty', () => {
    const { container } = render(<LegacyNoun imgPath="" alt="x" />);
    const src = container.querySelector('img')?.getAttribute('src') ?? '';
    expect(src.length).toBeGreaterThan(0);
    expect(src).toMatch(/loading-skull-noun/i);
  });

  it('renders exactly 1 img element', () => {
    const { container } = render(<LegacyNoun imgPath="/x.png" alt="x" />);
    expect(container.querySelectorAll('img').length).toBe(1);
  });

  it('outermost wrapper is a single <div>', () => {
    const { container } = render(<LegacyNoun imgPath="/x.png" alt="x" />);
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('long alt text (200 chars) is set verbatim', () => {
    const long = 'a'.repeat(200);
    const { container } = render(<LegacyNoun imgPath="/x.png" alt={long} />);
    expect(container.querySelector('img')?.getAttribute('alt')).toBe(long);
  });

  it('data URI imgPath is preserved verbatim', () => {
    const dataUri = 'data:image/svg+xml;base64,FAKE';
    const { container } = render(<LegacyNoun imgPath={dataUri} alt="x" />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe(dataUri);
  });

  it('renders without crash for very long imgPath URL', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(500) + '.png';
    expect(() => render(<LegacyNoun imgPath={longUrl} alt="x" />)).not.toThrow();
  });

  it('LoadingNoun renders exactly 1 img', () => {
    const { container } = render(<LoadingNoun />);
    expect(container.querySelectorAll('img').length).toBe(1);
  });

  it('LegacyNoun without className still renders img', () => {
    const { container } = render(<LegacyNoun imgPath="/x.png" alt="x" />);
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('rerender imgPath updates src', () => {
    const { container, rerender } = render(<LegacyNoun imgPath="/a.png" alt="x" />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/a.png');
    rerender(<LegacyNoun imgPath="/b.png" alt="x" />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/b.png');
  });

  it('rerender alt updates alt attribute', () => {
    const { container, rerender } = render(<LegacyNoun imgPath="/x.png" alt="alt1" />);
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('alt1');
    rerender(<LegacyNoun imgPath="/x.png" alt="alt2" />);
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('alt2');
  });

  it('multiple LegacyNoun instances render 2 imgs', () => {
    const { container } = render(
      <>
        <LegacyNoun imgPath="/a.png" alt="A" />
        <LegacyNoun imgPath="/b.png" alt="B" />
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(2);
  });

  it('unicode alt renders verbatim', () => {
    const { container } = render(<LegacyNoun imgPath="/x.png" alt="日本語" />);
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('日本語');
  });

  it('LoadingNoun has expected alt="loading noun"', () => {
    const { container } = render(<LoadingNoun />);
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('loading noun');
  });

  it('rerender from empty imgPath to loaded shows real img', () => {
    const { container, rerender } = render(<LegacyNoun imgPath="" alt="x" />);
    expect(container.querySelector('img')?.getAttribute('src')).toMatch(/loading-skull/i);
    rerender(<LegacyNoun imgPath="/real.png" alt="x" />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/real.png');
  });

  it('5 LoadingNoun instances render 5 imgs', () => {
    const { container } = render(
      <>
        <LoadingNoun />
        <LoadingNoun />
        <LoadingNoun />
        <LoadingNoun />
        <LoadingNoun />
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(5);
  });

  it('LegacyNoun renders without crash for empty alt', () => {
    expect(() => render(<LegacyNoun imgPath="/x.png" alt="" />)).not.toThrow();
  });

  it('LegacyNoun rerender from empty imgPath to valid path', () => {
    const { container, rerender } = render(<LegacyNoun imgPath="" alt="x" />);
    expect(container.querySelector('img')?.getAttribute('src')).toMatch(/loading-skull-noun/i);
    rerender(<LegacyNoun imgPath="/new.png" alt="x" />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/new.png');
  });

  it('LegacyNoun renders 3 instances each with own src', () => {
    const { container } = render(
      <>
        <LegacyNoun imgPath="/a.png" alt="a" />
        <LegacyNoun imgPath="/b.png" alt="b" />
        <LegacyNoun imgPath="/c.png" alt="c" />
      </>,
    );
    const imgs = container.querySelectorAll('img');
    expect(imgs[0]?.getAttribute('src')).toBe('/a.png');
    expect(imgs[1]?.getAttribute('src')).toBe('/b.png');
    expect(imgs[2]?.getAttribute('src')).toBe('/c.png');
  });

  it('LegacyNoun handles unicode alt text', () => {
    const { container } = render(<LegacyNoun imgPath="/x.png" alt="日本語ALT" />);
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('日本語ALT');
  });

  it('LegacyNoun handles 500 char long imgPath', () => {
    const longPath = '/' + 'x'.repeat(500) + '.png';
    const { container } = render(<LegacyNoun imgPath={longPath} alt="x" />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe(longPath);
  });

  it('LegacyNoun renders with custom className across rerenders', () => {
    const { container, rerender } = render(
      <LegacyNoun imgPath="/x.png" alt="x" className="cls1" />,
    );
    expect(container.querySelector('img')?.className).toContain('cls1');
    rerender(<LegacyNoun imgPath="/x.png" alt="x" className="cls2" />);
    expect(container.querySelector('img')?.className).toContain('cls2');
  });

  it('LegacyNoun rerender wrapperClassName updates wrapper', () => {
    const { container, rerender } = render(
      <LegacyNoun imgPath="/x.png" alt="x" wrapperClassName="wrap1" />,
    );
    expect(container.querySelector('div')?.className).toContain('wrap1');
    rerender(<LegacyNoun imgPath="/x.png" alt="x" wrapperClassName="wrap2" />);
    expect(container.querySelector('div')?.className).toContain('wrap2');
  });

  it('LegacyNoun rerender from valid imgPath to empty', () => {
    const { container, rerender } = render(<LegacyNoun imgPath="/x.png" alt="x" />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/x.png');
    rerender(<LegacyNoun imgPath="" alt="x" />);
    expect(container.querySelector('img')?.getAttribute('src')).toMatch(/loading-skull-noun/i);
  });

  it('LegacyNoun renders for null-like alt without crash', () => {
    expect(() => render(<LegacyNoun imgPath="/x.png" alt={undefined as never} />)).not.toThrow();
  });

  it('LegacyNoun renders 10 instances each independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 10 }, (_, i) => (
          <LegacyNoun key={i} imgPath={`/img${i}.png`} alt={`alt-${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(10);
  });

  it('LegacyNoun renders 50 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <LegacyNoun key={i} imgPath={`/img${i}.png`} alt={`a-${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(50);
  });

  it('LegacyNoun rerender preserves className across imgPath changes', () => {
    const { container, rerender } = render(
      <LegacyNoun imgPath="/x.png" alt="x" className="cls1" />,
    );
    expect(container.querySelector('img')?.className).toContain('cls1');
    rerender(<LegacyNoun imgPath="/y.png" alt="x" className="cls1" />);
    expect(container.querySelector('img')?.className).toContain('cls1');
  });

  it('LegacyNoun rerender preserves wrapperClassName across alt changes', () => {
    const { container, rerender } = render(
      <LegacyNoun imgPath="/x.png" alt="a" wrapperClassName="wrap" />,
    );
    expect(container.querySelector('div')?.className).toContain('wrap');
    rerender(<LegacyNoun imgPath="/x.png" alt="b" wrapperClassName="wrap" />);
    expect(container.querySelector('div')?.className).toContain('wrap');
  });

  it('LegacyNoun handles unicode imgPath', () => {
    expect(() => render(<LegacyNoun imgPath="/日本.png" alt="x" />)).not.toThrow();
  });

  it('LegacyNoun handles 1000 char imgPath', () => {
    const longPath = '/' + 'a'.repeat(1000) + '.png';
    expect(() => render(<LegacyNoun imgPath={longPath} alt="x" />)).not.toThrow();
  });

  it('LegacyNoun renders 100 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <LegacyNoun key={i} imgPath={`/img${i}.png`} alt={`alt-${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(100);
  });

  it('LegacyNoun rerender preserves img across imgPath changes', () => {
    const { container, rerender } = render(<LegacyNoun imgPath="/x.png" alt="x" />);
    expect(container.querySelector('img')).not.toBeNull();
    for (let i = 0; i < 10; i++) {
      rerender(<LegacyNoun imgPath={`/img${i}.png`} alt={`alt-${i}`} />);
      expect(container.querySelector('img')).not.toBeNull();
    }
  });

  it('LegacyNoun handles className + wrapperClassName both', () => {
    const { container } = render(
      <LegacyNoun imgPath="/x.png" alt="x" className="cls1" wrapperClassName="wrap1" />,
    );
    expect(container.querySelector('img')?.className).toContain('cls1');
    expect(container.querySelector('div')?.className).toContain('wrap1');
  });

  it('LegacyNoun handles symbol-like imgPath', () => {
    expect(() => render(<LegacyNoun imgPath="/<>&.png" alt="x" />)).not.toThrow();
  });

  it('LegacyNoun handles unicode alt text', () => {
    const { container } = render(<LegacyNoun imgPath="/x.png" alt="日本語ALT文字列" />);
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('日本語ALT文字列');
  });

  it('LegacyNoun renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <LegacyNoun key={i} imgPath={`/img-${i}.png`} alt={`alt-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('LegacyNoun rerender 30 times preserves img', () => {
    const { container, rerender } = render(<LegacyNoun imgPath="/x.png" alt="x" />);
    for (let i = 0; i < 30; i++) {
      rerender(<LegacyNoun imgPath={`/x-${i}.png`} alt={`x-${i}`} />);
    }
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/x-29.png');
  });

  it('LegacyNoun handles very long imgPath (1000 char)', () => {
    const long = '/x'.repeat(500);
    const { container } = render(<LegacyNoun imgPath={long} alt="x" />);
    expect(container.querySelector('img')?.getAttribute('src')?.length).toBe(long.length);
  });

  it('LegacyNoun handles whitespace-only alt', () => {
    const { container } = render(<LegacyNoun imgPath="/x.png" alt="   " />);
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('   ');
  });

  it('LoadingNoun renders 50 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <LoadingNoun key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('LegacyNoun mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<LegacyNoun imgPath={`/x-${i}.png`} alt="x" />);
      unmount();
    }
  });

  it('LegacyNoun renders 300 instances', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <LegacyNoun key={i} imgPath={`/img-${i}.png`} alt={`alt-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('LegacyNoun handles 50 different alts', () => {
    for (let i = 0; i < 50; i++) {
      const { container, unmount } = render(<LegacyNoun imgPath="/x.png" alt={`alt-${i}`} />);
      expect(container.querySelector('img')?.getAttribute('alt')).toBe(`alt-${i}`);
      unmount();
    }
  });

  it('LegacyNoun handles className + wrapperClassName combined', () => {
    const { container } = render(
      <LegacyNoun imgPath="/x.png" alt="x" className="img-cls" wrapperClassName="wrap-cls" />,
    );
    expect(container.querySelector('img')?.className).toContain('img-cls');
    expect(container.querySelector('div')?.className).toContain('wrap-cls');
  });

  it('LoadingNoun renders 200 instances', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <LoadingNoun key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('LegacyNoun mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<LegacyNoun imgPath="/x.png" alt="x" />);
      unmount();
    }
  });

  it('LegacyNoun renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <LegacyNoun key={i} imgPath={`/x-${i}.png`} alt={`alt-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('LegacyNoun handles 100 different imgPath values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(<LegacyNoun imgPath={`/path-${i}.png`} alt="x" />);
      expect(container.querySelector('img')?.getAttribute('src')).toBe(`/path-${i}.png`);
      unmount();
    }
  });

  it('LoadingNoun mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<LoadingNoun />);
      unmount();
    }
  });

  it('LoadingNoun all 100 instances have loading-skull-noun src', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <LoadingNoun key={i} />
        ))}
      </>,
    );
    const imgs = container.querySelectorAll('img');
    imgs.forEach(img => {
      expect(img.getAttribute('src')).toMatch(/loading-skull-noun/i);
    });
  });

  it('LegacyNoun mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<LegacyNoun imgPath="/x.png" alt="x" />);
      unmount();
    }
  });

  it('LegacyNoun renders 1000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <LegacyNoun key={i} imgPath={`/img-${i}.png`} alt={`alt-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('LegacyNoun handles 100 different className values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(
        <LegacyNoun imgPath="/x.png" alt="x" className={`cls-${i}`} />,
      );
      expect(container.querySelector('img')?.className).toContain(`cls-${i}`);
      unmount();
    }
  });

  it('LoadingNoun renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <LoadingNoun key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('LoadingNoun all 200 imgs have loading-skull src', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <LoadingNoun key={i} />
        ))}
      </>,
    );
    const imgs = container.querySelectorAll('img');
    imgs.forEach(img => {
      expect(img.getAttribute('src')).toMatch(/loading-skull-noun/i);
    });
  });

  it('LegacyNoun mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<LegacyNoun imgPath="/x.png" alt="x" />);
      unmount();
    }
  });

  it('LegacyNoun renders 2000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 2000 }, (_, i) => (
            <LegacyNoun key={i} imgPath={`/x-${i}.png`} alt={`alt-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('LegacyNoun handles 200 different className values', () => {
    for (let i = 0; i < 200; i++) {
      const { container, unmount } = render(
        <LegacyNoun imgPath="/x.png" alt="x" className={`cls-${i}`} />,
      );
      expect(container.querySelector('img')?.className).toContain(`cls-${i}`);
      unmount();
    }
  });

  it('LoadingNoun mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<LoadingNoun />);
      unmount();
    }
  });

  it('LoadingNoun renders 1000 instances', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <LoadingNoun key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<LegacyNoun imgPath="/x.png" alt="x" />);
      unmount();
    }
  });

  it('round-2 renders 1500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1500 }, (_, i) => (
            <LegacyNoun key={i} imgPath={`/r2-${i}.png`} alt={`r2-alt-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 100 different imgPath values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(<LegacyNoun imgPath={`/r2-img-${i}.png`} alt="x" />);
      expect(container.querySelector('img')?.getAttribute('src')).toBe(`/r2-img-${i}.png`);
      unmount();
    }
  });

  it('round-2 handles 100 different alt values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(<LegacyNoun imgPath="/x.png" alt={`r2-alt-${i}`} />);
      expect(container.querySelector('img')?.getAttribute('alt')).toBe(`r2-alt-${i}`);
      unmount();
    }
  });

  it('round-2 all 500 instances have img element', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <LegacyNoun key={i} imgPath="/x.png" alt={`a-${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(500);
  });

  it('round-3 mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<LegacyNoun imgPath="/x.png" alt="x" />);
      unmount();
    }
  });

  it('round-3 renders 1500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1500 }, (_, i) => (
            <LegacyNoun key={i} imgPath={`/r3-${i}.png`} alt={`r3-alt-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 100 different imgPath values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(<LegacyNoun imgPath={`/r3-img-${i}.png`} alt="x" />);
      expect(container.querySelector('img')?.getAttribute('src')).toBe(`/r3-img-${i}.png`);
      unmount();
    }
  });

  it('round-3 100 different alt values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(<LegacyNoun imgPath="/x.png" alt={`r3-alt-${i}`} />);
      expect(container.querySelector('img')?.getAttribute('alt')).toBe(`r3-alt-${i}`);
      unmount();
    }
  });

  it('round-3 all 500 instances have img element', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <LegacyNoun key={i} imgPath="/x.png" alt={`a-${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(500);
  });

  it('round-4 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<LegacyNoun imgPath="/x.png" alt="r4" />);
      unmount();
    }
  });

  it('round-4 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <LegacyNoun key={i} imgPath={`/r4-${i}.png`} alt={`r4-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different alt values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<LegacyNoun imgPath="/x.png" alt={`r4-alt-${i}`} />);
      unmount();
    }
  });

  it('round-4 30 different imgPath values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<LegacyNoun imgPath={`/r4-${i}.png`} alt="x" />);
      unmount();
    }
  });

  it('round-4 all 500 imgs render', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <LegacyNoun key={i} imgPath="/r4.png" alt={`r4-${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(500);
  });

  it('round-5 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<LegacyNoun imgPath="/x.png" alt="r5" />);
      unmount();
    }
  });

  it('round-5 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <LegacyNoun key={i} imgPath={`/r5-${i}.png`} alt={`r5-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 different alt values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<LegacyNoun imgPath="/x.png" alt={`r5-alt-${i}`} />);
      unmount();
    }
  });

  it('round-5 30 different imgPath values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<LegacyNoun imgPath={`/r5-${i}.png`} alt="x" />);
      unmount();
    }
  });

  it('round-5 all 500 imgs render', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <LegacyNoun key={i} imgPath="/r5.png" alt={`r5-${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(500);
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<LegacyNoun imgPath="/r6.png" alt="r6" />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <LegacyNoun key={i} imgPath={`/r6-${i}.png`} alt={`r6-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<LegacyNoun imgPath="/r6.png" alt="r6" />)).not.toThrow();
    }
  });

  it('round-6 30 different alt values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<LegacyNoun imgPath="/r6.png" alt={`r6-a-${i}`} />);
      unmount();
    }
  });

  it('round-6 all 500 imgs render', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <LegacyNoun key={i} imgPath="/r6.png" alt={`r6-${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(500);
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<LegacyNoun imgPath="/r7.png" alt="r7" />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <LegacyNoun key={i} imgPath="/r7.png" alt={`r7-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<LegacyNoun imgPath="/r7.png" alt="r7" />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<LegacyNoun imgPath="/r7.png" alt="r7" />);
      unmount();
    }
  });

  it('round-7 500 img instances render', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <LegacyNoun key={i} imgPath="/r7.png" alt={`r7-${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(500);
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<LegacyNoun imgPath="/r8.png" alt="r8" />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <LegacyNoun key={i} imgPath="/r8.png" alt={`r8-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<LegacyNoun imgPath="/r8.png" alt="r8" />)).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<LegacyNoun imgPath="/r8.png" alt="r8" />);
      unmount();
    }
  });

  it('round-8 500 img instances render', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <LegacyNoun key={i} imgPath="/r8.png" alt={`r8-${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(500);
  });
});
