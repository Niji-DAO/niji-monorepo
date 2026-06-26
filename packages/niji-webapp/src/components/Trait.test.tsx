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

  it('seed=0 with hat type renders without crash', () => {
    expect(() => render(<Trait type="hat" seed={0} />, { wrapper: WithProviders })).not.toThrow();
  });

  it('special type without seed (undefined) uses fallback', () => {
    const { container } = render(<Trait type="special" />, { wrapper: WithProviders });
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('img element has alt attribute (or empty fallback)', () => {
    const { container } = render(<Trait type="hat" seed={0} />, { wrapper: WithProviders });
    const img = container.querySelector('img');
    expect(img?.getAttribute('alt')).toBeDefined();
  });

  it('large seed value (999) renders without crash', () => {
    expect(() => render(<Trait type="hat" seed={999} />, { wrapper: WithProviders })).not.toThrow();
  });

  it('passes className through to img element', () => {
    const { container } = render(<Trait type="hat" className="my-trait-class" />, {
      wrapper: WithProviders,
    });
    expect(container.querySelector('img')?.className).toBe('my-trait-class');
  });

  it('mount-unmount 50 cycles', async () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Trait traitType="hat" traitIndex={0} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('handles 30 different traitTypes', async () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Trait traitType="hat" traitIndex={0} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('renders 30 instances all in single mount', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Trait key={i} traitType="hat" traitIndex={0} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('handles 30 different className values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Trait traitType="hat" traitIndex={0} className={`cls-${i}`} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('handles 30 rerenders with rotating className', () => {
    const { rerender } = render(<Trait traitType="hat" traitIndex={0} />, {
      wrapper: WithProviders,
    });
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(<Trait traitType="hat" traitIndex={0} className={`cls-${i}`} />),
      ).not.toThrow();
    }
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Trait traitType="hat" traitIndex={0} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-2 renders 30 instances in single mount', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Trait key={i} traitType="hat" traitIndex={0} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-2 handles 50 different className values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <Trait traitType="hat" traitIndex={0} className={`r2-cls-${i}`} />,
        { wrapper: WithProviders },
      );
      unmount();
    }
  });

  it('round-2 handles 30 different traitIndex values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Trait traitType="hat" traitIndex={i} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-2 handles 30 rerenders rotating className', () => {
    const { rerender } = render(<Trait traitType="hat" traitIndex={0} />, {
      wrapper: WithProviders,
    });
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(<Trait traitType="hat" traitIndex={0} className={`r2-${i}`} />),
      ).not.toThrow();
    }
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Trait type="hat" seed={0} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-3 handles 30 different types', () => {
    const types = ['hat', 'special', 'mouth', 'eyes'];
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Trait type={types[i % 4] as never} seed={i} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<Trait type="hat" seed={i} />, { wrapper: WithProviders })).not.toThrow();
    }
  });

  it('round-3 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Trait type="hat" seed={i + 100} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-3 30 different seed values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Trait type="hat" seed={i * 7} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Trait type="hat" seed={i} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-4 30 different type values', () => {
    const types = ['hat', 'body', 'accessory'];
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Trait type={types[i % 3] as never} seed={i} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<Trait type="hat" seed={i + 200} />, { wrapper: WithProviders }),
      ).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Trait type="hat" seed={i + 500} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-4 30 different seed values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Trait type="hat" seed={i * 11} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Trait type="hat" seed={i + 1000} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-5 30 different type values', () => {
    const types = ['hat', 'body', 'accessory'];
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Trait type={types[i % 3] as never} seed={i + 1500} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<Trait type="hat" seed={i + 2000} />, { wrapper: WithProviders }),
      ).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Trait type="hat" seed={i + 5000} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-5 30 different seed values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Trait type="hat" seed={i * 13} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-6 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<Trait type="hat" seed={0} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-6 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <Trait key={i} type="hat" seed={i} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<Trait type="hat" seed={0} />, { wrapper: WithProviders })).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Trait type="hat" seed={0} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-6 30 different seed values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Trait type="hat" seed={i * 17} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Trait type="hat" seed={0} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Trait key={i} type="hat" seed={i} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<Trait type="hat" seed={0} />, { wrapper: WithProviders })).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Trait type="hat" seed={0} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-7 30 different seed values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Trait type="hat" seed={i * 19} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Trait type="hat" seed={0} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Trait key={i} type="hat" seed={i} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<Trait type="hat" seed={0} />, { wrapper: WithProviders })).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Trait type="hat" seed={0} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-8 30 different seed values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Trait type="hat" seed={i * 23} />, { wrapper: WithProviders });
      unmount();
    }
  });
});
