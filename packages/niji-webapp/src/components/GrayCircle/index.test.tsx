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
});
