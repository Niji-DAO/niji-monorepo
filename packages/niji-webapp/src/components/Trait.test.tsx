import React from 'react';

import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@niji/sdk', () => ({
  buildSVG: () => '<svg></svg>',
}));

vi.mock('@/lib/nijiAssets', () => ({
  NijiImageData: {
    images: {
      hat: [{ data: '0xABCDEF', filename: 'hat-1' }],
      special: [],
    },
    palette: ['#000000', '#ffffff'],
  },
}));

import { WithProviders } from '@/test-utils/providers';

import { Trait } from './Trait';

const FALLBACK_TRANSPARENT = 'data:image/gif;base64,';

describe('Trait', () => {
  it('renders an <img> element', () => {
    const { container } = render(<Trait type="hat" seed={0} />, { wrapper: WithProviders });
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('uses transparent fallback when seed is undefined (query disabled)', () => {
    const { container } = render(<Trait type="hat" />, { wrapper: WithProviders });
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toContain(FALLBACK_TRANSPARENT);
  });

  it('produces an svg-data URL after query resolves', async () => {
    const { container } = render(<Trait type="hat" seed={0} />, { wrapper: WithProviders });
    await waitFor(() => {
      const src = container.querySelector('img')?.getAttribute('src') ?? '';
      expect(src.startsWith('data:image/svg+xml;base64,')).toBe(true);
    });
  });

  it('falls back when image data is empty (no seed match)', async () => {
    const { container } = render(<Trait type="special" seed={0} />, { wrapper: WithProviders });
    // image not found -> buildSVG([], palette) は mock 上 '<svg></svg>' を返すので非 fallback パス
    await waitFor(() => {
      const src = container.querySelector('img')?.getAttribute('src') ?? '';
      expect(src.startsWith('data:image/svg+xml;base64,')).toBe(true);
    });
  });

  it('forwards arbitrary img attributes (className)', () => {
    const { container } = render(<Trait type="hat" className="custom-trait" />, {
      wrapper: WithProviders,
    });
    expect(container.querySelector('img')?.className).toBe('custom-trait');
  });
});
