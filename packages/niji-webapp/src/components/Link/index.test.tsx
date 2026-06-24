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
});
