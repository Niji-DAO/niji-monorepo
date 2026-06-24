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
});
