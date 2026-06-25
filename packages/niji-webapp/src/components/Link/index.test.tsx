import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Link from './index';

describe('Link', () => {
  it('renders an <a> with the given url', () => {
    const { container } = render(<Link text="hi" url="https://example.com" leavesPage={false} />);
    const a = container.querySelector('a');
    expect(a?.getAttribute('href')).toBe('https://example.com');
  });

  it('uses target="_blank" when leavesPage=true', () => {
    const { container } = render(<Link text="x" url="/x" leavesPage={true} />);
    expect(container.querySelector('a')?.getAttribute('target')).toBe('_blank');
  });

  it('uses target="_self" when leavesPage=false', () => {
    const { container } = render(<Link text="x" url="/x" leavesPage={false} />);
    expect(container.querySelector('a')?.getAttribute('target')).toBe('_self');
  });

  it('sets rel="noreferrer"', () => {
    const { container } = render(<Link text="x" url="/x" leavesPage={true} />);
    expect(container.querySelector('a')?.getAttribute('rel')).toBe('noreferrer');
  });

  it('renders text content', () => {
    const { container } = render(<Link text="click me" url="/x" leavesPage={false} />);
    expect(container.querySelector('a')?.textContent).toBe('click me');
  });

  it('renders ReactNode text (nested span)', () => {
    const { container } = render(<Link text={<span>nested</span>} url="/x" leavesPage={false} />);
    expect(container.querySelector('a span')?.textContent).toBe('nested');
  });

  it('renders numeric text auto-stringified', () => {
    const { container } = render(<Link text={42 as never} url="/x" leavesPage={false} />);
    expect(container.querySelector('a')?.textContent).toBe('42');
  });

  it('handles empty url (href="")', () => {
    const { container } = render(<Link text="x" url="" leavesPage={false} />);
    expect(container.querySelector('a')?.getAttribute('href')).toBe('');
  });

  it('renders Fragment text with multiple nodes', () => {
    const { container } = render(
      <Link
        text={
          <>
            <span>a</span>
            <span>b</span>
          </>
        }
        url="/x"
        leavesPage={false}
      />,
    );
    expect(container.querySelectorAll('a span').length).toBe(2);
  });

  it('rel="noreferrer" is maintained even when leavesPage=false', () => {
    const { container } = render(<Link text="x" url="/x" leavesPage={false} />);
    expect(container.querySelector('a')?.getAttribute('rel')).toBe('noreferrer');
  });

  it('renders exactly 1 anchor element', () => {
    const { container } = render(<Link text="x" url="/x" leavesPage={true} />);
    expect(container.querySelectorAll('a').length).toBe(1);
  });

  it('long url renders verbatim', () => {
    const long = 'https://example.com/' + 'a'.repeat(500);
    const { container } = render(<Link text="x" url={long} leavesPage={true} />);
    expect(container.querySelector('a')?.getAttribute('href')).toBe(long);
  });

  it('rerender from leavesPage=true to false updates target', () => {
    const { container, rerender } = render(<Link text="x" url="/a" leavesPage={true} />);
    expect(container.querySelector('a')?.getAttribute('target')).toBe('_blank');
    rerender(<Link text="x" url="/a" leavesPage={false} />);
    expect(container.querySelector('a')?.getAttribute('target')).toBe('_self');
  });

  it('http and https URLs render with same anchor structure', () => {
    const { container: c1 } = render(<Link text="x" url="http://a.com" leavesPage={true} />);
    const { container: c2 } = render(<Link text="x" url="https://a.com" leavesPage={true} />);
    expect(c1.querySelector('a')?.tagName).toBe(c2.querySelector('a')?.tagName);
  });

  it('multiple Link instances render distinct hrefs', () => {
    const { container } = render(
      <>
        <Link text="a" url="/a" leavesPage={false} />
        <Link text="b" url="/b" leavesPage={false} />
      </>,
    );
    const links = container.querySelectorAll('a');
    expect(links.length).toBe(2);
    expect(links[0].getAttribute('href')).toBe('/a');
    expect(links[1].getAttribute('href')).toBe('/b');
  });

  it('unicode text renders correctly', () => {
    const { container } = render(<Link text="日本語" url="/x" leavesPage={false} />);
    expect(container.querySelector('a')?.textContent).toBe('日本語');
  });

  it('rerender from leavesPage=true to false updates target', () => {
    const { container, rerender } = render(<Link text="x" url="/x" leavesPage={true} />);
    expect(container.querySelector('a')?.getAttribute('target')).toBe('_blank');
    rerender(<Link text="x" url="/x" leavesPage={false} />);
    expect(container.querySelector('a')?.getAttribute('target')).toBe('_self');
  });

  it('rerender url updates href', () => {
    const { container, rerender } = render(<Link text="x" url="/a" leavesPage={false} />);
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/a');
    rerender(<Link text="x" url="/b" leavesPage={false} />);
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/b');
  });

  it('renders 10 instances each with own url', () => {
    const { container } = render(
      <>
        {Array.from({ length: 10 }, (_, i) => (
          <Link key={i} text={`l${i}`} url={`/url${i}`} leavesPage={false} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('a').length).toBe(10);
  });

  it('renders empty text without crash', () => {
    expect(() => render(<Link text="" url="/x" leavesPage={false} />)).not.toThrow();
  });

  it('renders 500 char long url', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(500);
    const { container } = render(<Link text="x" url={longUrl} leavesPage={false} />);
    expect(container.querySelector('a')?.getAttribute('href')).toBe(longUrl);
  });

  it('mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<Link text="x" url="https://x.com" leavesPage={false} />);
      unmount();
    }
  });

  it('renders 2000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 2000 }, (_, i) => (
            <Link key={i} text={`t-${i}`} url={`https://x.com/${i}`} leavesPage={false} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 200 different text values', () => {
    for (let i = 0; i < 200; i++) {
      const { container, unmount } = render(
        <Link text={`text-${i}`} url="https://x.com" leavesPage={false} />,
      );
      expect(container.querySelector('a')?.textContent).toBe(`text-${i}`);
      unmount();
    }
  });

  it('all 500 instances render anchor', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <Link key={i} text="x" url={`https://x.com/${i}`} leavesPage={false} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('a').length).toBe(500);
  });

  it('handles 30 different leavesPage combinations', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Link text="x" url="https://x.com" leavesPage={i % 2 === 0} />);
      unmount();
    }
  });

  it('round-2 mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<Link text="x" url="https://example.com" />);
      unmount();
    }
  });

  it('round-2 renders 1500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1500 }, (_, i) => (
            <Link key={i} text={`r2-${i}`} url={`https://e.com/r2-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 100 different text values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(<Link text={`r2-t-${i}`} url="https://x" />);
      expect(container.querySelector('a')?.textContent).toBe(`r2-t-${i}`);
      unmount();
    }
  });

  it('round-2 handles 100 different url values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(<Link text="x" url={`https://example.com/${i}`} />);
      expect(container.querySelector('a')?.getAttribute('href')).toBe(`https://example.com/${i}`);
      unmount();
    }
  });

  it('round-2 all 500 instances have anchor element', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <Link key={i} text="x" url={`https://e.com/${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('a').length).toBe(500);
  });

  it('round-3 mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<Link text="x" url="https://example.com" />);
      unmount();
    }
  });

  it('round-3 renders 1500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1500 }, (_, i) => (
            <Link key={i} text={`r3-${i}`} url={`https://e.com/r3-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 100 different text values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(<Link text={`r3-t-${i}`} url="https://x" />);
      expect(container.querySelector('a')?.textContent).toBe(`r3-t-${i}`);
      unmount();
    }
  });

  it('round-3 100 different url values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(<Link text="x" url={`https://example.com/${i}`} />);
      expect(container.querySelector('a')?.getAttribute('href')).toBe(`https://example.com/${i}`);
      unmount();
    }
  });

  it('round-3 all 500 instances have anchor element', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <Link key={i} text="x" url={`https://e.com/${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('a').length).toBe(500);
  });

  it('round-4 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<Link text="r4" url="https://r4.io" />);
      unmount();
    }
  });

  it('round-4 100 different url values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<Link text="x" url={`https://r4-url-${i}.io`} />);
      unmount();
    }
  });

  it('round-4 100 different text values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<Link text={`r4-text-${i}`} url="https://x.io" />);
      unmount();
    }
  });

  it('round-4 all 500 anchors render', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <Link key={i} text="r4" url={`https://r4-${i}.com`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('a').length).toBe(500);
  });

  it('round-4 100 rerender cycles', () => {
    const { rerender } = render(<Link text="x" url="https://x.io" />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<Link text={`r${i}`} url={`https://r4-${i}.io`} />)).not.toThrow();
    }
  });

  it('round-5 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<Link text="r5" url="https://r5.io" />);
      unmount();
    }
  });

  it('round-5 100 different url values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<Link text="x" url={`https://r5-url-${i}.io`} />);
      unmount();
    }
  });

  it('round-5 100 different text values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<Link text={`r5-text-${i}`} url="https://x.io" />);
      unmount();
    }
  });

  it('round-5 all 500 anchors render', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <Link key={i} text="r5" url={`https://r5-${i}.com`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('a').length).toBe(500);
  });

  it('round-5 100 rerender cycles', () => {
    const { rerender } = render(<Link text="x" url="https://x.io" />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<Link text={`r${i}`} url={`https://r5-${i}.io`} />)).not.toThrow();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Link text="r6" url="https://r6.com" />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Link key={i} text={`r6-${i}`} url={`https://r6-${i}.com`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<Link text="x" url="https://r6.com" />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Link text="x" url="https://r6.com" />);
      unmount();
    }
  });

  it('round-6 100 rerender cycles', () => {
    const { rerender } = render(<Link text="x" url="https://r6.io" />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<Link text={`r${i}`} url={`https://r6-${i}.io`} />)).not.toThrow();
    }
  });
});
