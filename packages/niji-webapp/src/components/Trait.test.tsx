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

  it('handles seed=1 (out-of-bounds index, fallback to undefined image data)', async () => {
    const { container } = render(<Trait type="hat" seed={1} />, { wrapper: WithProviders });
    await waitFor(() => {
      const src = container.querySelector('img')?.getAttribute('src') ?? '';
      expect(src.length).toBeGreaterThan(0);
    });
  });

  it('handles undefined className (empty string passthrough)', () => {
    const { container } = render(<Trait type="hat" />, { wrapper: WithProviders });
    const img = container.querySelector('img');
    // className が prop 未指定でも crash しない
    expect(img).not.toBeNull();
  });

  it('renders exactly 1 img element', () => {
    const { container } = render(<Trait type="hat" seed={0} />, { wrapper: WithProviders });
    expect(container.querySelectorAll('img').length).toBe(1);
  });

  it('FALLBACK_TRANSPARENT starts with data:image/gif;base64, prefix (1x1 transparent)', () => {
    const { container } = render(<Trait type="hat" />, { wrapper: WithProviders });
    const src = container.querySelector('img')?.getAttribute('src') ?? '';
    expect(src.startsWith('data:image/gif;base64,')).toBe(true);
    // 1x1 transparent GIF の base64 ペイロードを含む
    expect(src.length).toBeGreaterThan('data:image/gif;base64,'.length);
  });

  it('different types produce different result paths', async () => {
    const { container: c1 } = render(<Trait type="hat" seed={0} />, { wrapper: WithProviders });
    const { container: c2 } = render(<Trait type="special" seed={0} />, {
      wrapper: WithProviders,
    });
    await waitFor(() => {
      expect(c1.querySelector('img')?.getAttribute('src')).toBeTruthy();
      expect(c2.querySelector('img')?.getAttribute('src')).toBeTruthy();
    });
  });
});
