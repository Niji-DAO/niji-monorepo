import React from 'react';

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import NavBarLink from './index';

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('NavBarLink', () => {
  it('renders internal link <a> with to= path (no target)', () => {
    const { container } = wrap(<NavBarLink to="/foo">internal</NavBarLink>);
    const a = container.querySelector('a');
    expect(a?.getAttribute('href')).toBe('/foo');
    expect(a?.getAttribute('target')).toBe('');
  });

  it('renders external http link with target=_blank', () => {
    const { container } = wrap(<NavBarLink to="https://example.com">ext</NavBarLink>);
    const a = container.querySelector('a');
    expect(a?.getAttribute('target')).toBe('_blank');
  });

  it('renders children text', () => {
    const { container } = wrap(<NavBarLink to="/x">My Link</NavBarLink>);
    expect(container.querySelector('a')?.textContent).toBe('My Link');
  });

  it('merges custom className', () => {
    const { container } = wrap(
      <NavBarLink to="/x" className="extra">
        x
      </NavBarLink>,
    );
    expect(container.querySelector('a')?.className).toContain('extra');
  });

  it('renders nested ReactNode child', () => {
    const { container } = wrap(
      <NavBarLink to="/x">
        <span>nested</span>
      </NavBarLink>,
    );
    expect(container.querySelector('a span')?.textContent).toBe('nested');
  });

  it('renders numeric children as string', () => {
    const { container } = wrap(<NavBarLink to="/x">{42}</NavBarLink>);
    expect(container.querySelector('a')?.textContent).toBe('42');
  });

  it('renders Fragment children unwrapped', () => {
    const { container } = wrap(
      <NavBarLink to="/x">
        <>
          <span>a</span>
          <span>b</span>
        </>
      </NavBarLink>,
    );
    expect(container.querySelectorAll('span').length).toBe(2);
  });

  it('handles empty className prop', () => {
    const { container } = wrap(
      <NavBarLink to="/x" className="">
        x
      </NavBarLink>,
    );
    expect(container.querySelector('a')).not.toBeNull();
  });

  it('external https link with path preserves href', () => {
    const { container } = wrap(<NavBarLink to="https://example.com/foo/bar">ext</NavBarLink>);
    expect(container.querySelector('a')?.getAttribute('href')).toBe('https://example.com/foo/bar');
  });

  it('renders exactly 1 <a> element (no extras)', () => {
    const { container } = wrap(<NavBarLink to="/x">x</NavBarLink>);
    expect(container.querySelectorAll('a').length).toBe(1);
  });

  it('internal link uses default empty target', () => {
    const { container } = wrap(<NavBarLink to="/internal">x</NavBarLink>);
    expect(container.querySelector('a')?.getAttribute('target')).toBe('');
  });

  it('http (non-https) external link uses target=_blank', () => {
    const { container } = wrap(<NavBarLink to="http://example.com">x</NavBarLink>);
    expect(container.querySelector('a')?.getAttribute('target')).toBe('_blank');
  });

  it('rerender with new path updates href', () => {
    const { container, rerender } = wrap(<NavBarLink to="/a">x</NavBarLink>);
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/a');
    rerender(
      <MemoryRouter>
        <NavBarLink to="/b">x</NavBarLink>
      </MemoryRouter>,
    );
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/b');
  });

  it('long URL renders verbatim', () => {
    const long = 'https://example.com/' + 'x'.repeat(500);
    const { container } = wrap(<NavBarLink to={long}>x</NavBarLink>);
    expect(container.querySelector('a')?.getAttribute('href')).toBe(long);
  });

  it('multiple internal NavBarLink instances render distinct hrefs', () => {
    const { container } = wrap(
      <>
        <NavBarLink to="/a">A</NavBarLink>
        <NavBarLink to="/b">B</NavBarLink>
      </>,
    );
    const links = container.querySelectorAll('a');
    expect(links.length).toBe(2);
    expect(links[0].getAttribute('href')).toBe('/a');
    expect(links[1].getAttribute('href')).toBe('/b');
  });

  it('rerender from internal to external switches target', () => {
    const { container, rerender } = wrap(<NavBarLink to="/internal">x</NavBarLink>);
    expect(container.querySelector('a')?.getAttribute('target')).toBe('');
    rerender(
      <MemoryRouter>
        <NavBarLink to="https://example.com">x</NavBarLink>
      </MemoryRouter>,
    );
    expect(container.querySelector('a')?.getAttribute('target')).toBe('_blank');
  });

  it('unicode children render verbatim', () => {
    const { container } = wrap(<NavBarLink to="/x">日本語</NavBarLink>);
    expect(container.querySelector('a')?.textContent).toBe('日本語');
  });

  it('hash-only path (#fragment) treated as internal', () => {
    const { container } = wrap(<NavBarLink to="#section">jump</NavBarLink>);
    expect(container.querySelector('a')?.getAttribute('target')).toBe('');
  });

  it('relative path (./foo) treated as internal', () => {
    const { container } = wrap(<NavBarLink to="./foo">x</NavBarLink>);
    expect(container.querySelector('a')?.getAttribute('target')).toBe('');
  });

  it('5 instances render 5 links', () => {
    const { container } = wrap(
      <>
        <NavBarLink to="/a">A</NavBarLink>
        <NavBarLink to="/b">B</NavBarLink>
        <NavBarLink to="/c">C</NavBarLink>
        <NavBarLink to="/d">D</NavBarLink>
        <NavBarLink to="/e">E</NavBarLink>
      </>,
    );
    expect(container.querySelectorAll('a').length).toBe(5);
  });

  it('mixed internal + external links have correct target values', () => {
    const { container } = wrap(
      <>
        <NavBarLink to="/internal">int</NavBarLink>
        <NavBarLink to="https://example.com">ext</NavBarLink>
      </>,
    );
    const links = container.querySelectorAll('a');
    expect(links[0].getAttribute('target')).toBe('');
    expect(links[1].getAttribute('target')).toBe('_blank');
  });

  it('to="/" root path renders as internal link', () => {
    const { container } = wrap(<NavBarLink to="/">root</NavBarLink>);
    expect(container.querySelector('a')?.getAttribute('target')).toBe('');
  });

  it('rerender from external to internal updates target', () => {
    const { container, rerender } = wrap(<NavBarLink to="https://example.com">x</NavBarLink>);
    expect(container.querySelector('a')?.getAttribute('target')).toBe('_blank');
    rerender(
      <MemoryRouter>
        <NavBarLink to="/internal">x</NavBarLink>
      </MemoryRouter>,
    );
    expect(container.querySelector('a')?.getAttribute('target')).toBe('');
  });

  it('long external URL renders verbatim', () => {
    const longUrl = 'https://example.com/path/' + 'x'.repeat(300);
    const { container } = wrap(<NavBarLink to={longUrl}>x</NavBarLink>);
    expect(container.querySelector('a')?.getAttribute('href')).toBe(longUrl);
  });

  it('5 internal links render 5 anchors', () => {
    const { container } = wrap(
      <>
        <NavBarLink to="/a">A</NavBarLink>
        <NavBarLink to="/b">B</NavBarLink>
        <NavBarLink to="/c">C</NavBarLink>
        <NavBarLink to="/d">D</NavBarLink>
        <NavBarLink to="/e">E</NavBarLink>
      </>,
    );
    expect(container.querySelectorAll('a').length).toBe(5);
  });

  it('https:// prefix specifically triggers _blank', () => {
    const { container } = wrap(<NavBarLink to="https://test.io">x</NavBarLink>);
    expect(container.querySelector('a')?.getAttribute('target')).toBe('_blank');
  });
});
