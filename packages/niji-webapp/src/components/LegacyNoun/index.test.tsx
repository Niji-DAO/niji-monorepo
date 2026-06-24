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
});
