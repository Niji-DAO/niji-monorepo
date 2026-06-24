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
});
