import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const useNounSeedMock = vi.fn();
vi.mock('@/wrappers/nijiToken', () => ({
  useNounSeed: () => useNounSeedMock(),
}));

vi.mock('@/components/LegacyNoun', () => ({
  LoadingNoun: () => <span data-testid="loading-noun" />,
}));

const getNijiMock = vi.fn();
vi.mock('@/components/Niji', () => ({
  getNiji: () => getNijiMock(),
}));

import TightStackedCircleNiji from './index';

const renderSvg = (props: React.ComponentProps<typeof TightStackedCircleNiji>) =>
  render(
    <svg>
      <TightStackedCircleNiji {...props} />
    </svg>,
  );

describe('TightStackedCircleNiji', () => {
  it('renders LoadingNoun while seed is undefined', () => {
    useNounSeedMock.mockReturnValue(undefined);
    const { container } = renderSvg({ nounId: 1, index: 0, square: 55, shift: 3 });
    expect(container.querySelector('[data-testid="loading-noun"]')).not.toBeNull();
  });

  it('renders SVG image when seed is present', () => {
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'data:image/svg+xml;base64,FAKE' });
    const { container } = renderSvg({ nounId: 1, index: 0, square: 55, shift: 3 });
    expect(container.querySelector('image')?.getAttribute('href')).toBe(
      'data:image/svg+xml;base64,FAKE',
    );
  });

  it('places circle with id matching nounId', () => {
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'data:image/svg+xml;base64,X' });
    const { container } = renderSvg({ nounId: 42, index: 0, square: 55, shift: 3 });
    expect(container.querySelector('circle')?.getAttribute('id')).toBe('42');
  });

  it('shifts position by index*shift', () => {
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'x' });
    const { container } = renderSvg({ nounId: 1, index: 2, square: 55, shift: 3 });
    const circle = container.querySelector('circle');
    expect(circle?.getAttribute('cx')).toBe('34'); // 28 + 2*3
    expect(circle?.getAttribute('cy')).toBe('28'); // 55 - 21 - 2*3
  });

  it('index 0 produces cx=28, cy=34 (square 55 - 21)', () => {
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'x' });
    const { container } = renderSvg({ nounId: 1, index: 0, square: 55, shift: 3 });
    const circle = container.querySelector('circle');
    expect(circle?.getAttribute('cx')).toBe('28'); // 28 + 0*3
    expect(circle?.getAttribute('cy')).toBe('34'); // 55 - 21 - 0*3
  });

  it('square 100 + shift 5 produces shifted positions', () => {
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'x' });
    const { container } = renderSvg({ nounId: 1, index: 1, square: 100, shift: 5 });
    const circle = container.querySelector('circle');
    expect(circle?.getAttribute('cx')).toBe('33'); // 28 + 1*5
    expect(circle?.getAttribute('cy')).toBe('74'); // 100 - 21 - 1*5
  });

  it('image href passes through getNiji image verbatim', () => {
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'data:custom-svg' });
    const { container } = renderSvg({ nounId: 1, index: 0, square: 55, shift: 3 });
    expect(container.querySelector('image')?.getAttribute('href')).toBe('data:custom-svg');
  });

  it('exactly 1 LoadingNoun when seed undefined (no extra circles/images)', () => {
    useNounSeedMock.mockReturnValue(undefined);
    const { container } = renderSvg({ nounId: 1, index: 0, square: 55, shift: 3 });
    expect(container.querySelectorAll('[data-testid="loading-noun"]').length).toBe(1);
    expect(container.querySelector('image')).toBeNull();
  });

  it('renders circle + image when seed present (no LoadingNoun)', () => {
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'x' });
    const { container } = renderSvg({ nounId: 1, index: 0, square: 55, shift: 3 });
    expect(container.querySelector('[data-testid="loading-noun"]')).toBeNull();
    expect(container.querySelector('circle')).not.toBeNull();
    expect(container.querySelector('image')).not.toBeNull();
  });

  it('circle id reflects different nounIds (numeric stringification)', () => {
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'x' });
    const { container } = renderSvg({ nounId: 9999, index: 0, square: 55, shift: 3 });
    expect(container.querySelector('circle')?.getAttribute('id')).toBe('9999');
  });

  it('large index value (5) shifts position correctly', () => {
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'x' });
    const { container } = renderSvg({ nounId: 1, index: 5, square: 100, shift: 4 });
    const circle = container.querySelector('circle');
    expect(circle?.getAttribute('cx')).toBe('48'); // 28 + 5*4
    expect(circle?.getAttribute('cy')).toBe('59'); // 100 - 21 - 5*4
  });

  it('nounId=0 still renders id="0"', () => {
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'x' });
    const { container } = renderSvg({ nounId: 0, index: 0, square: 55, shift: 3 });
    expect(container.querySelector('circle')?.getAttribute('id')).toBe('0');
  });

  it('different image strings produce different href values', () => {
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'data:custom-x' });
    const { container } = renderSvg({ nounId: 1, index: 0, square: 55, shift: 3 });
    expect(container.querySelector('image')?.getAttribute('href')).toBe('data:custom-x');
  });

  it('shift=0 keeps cx/cy constant regardless of index', () => {
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'x' });
    const { container: c1 } = renderSvg({ nounId: 1, index: 0, square: 55, shift: 0 });
    const { container: c2 } = renderSvg({ nounId: 1, index: 9, square: 55, shift: 0 });
    expect(c1.querySelector('circle')?.getAttribute('cx')).toBe(
      c2.querySelector('circle')?.getAttribute('cx'),
    );
  });

  it('renders LoadingNoun + no circle when seed undefined', () => {
    useNounSeedMock.mockReturnValue(undefined);
    const { container } = renderSvg({ nounId: 1, index: 0, square: 55, shift: 3 });
    expect(container.querySelector('circle')).toBeNull();
  });

  it('square=0 still computes cy=-21+0', () => {
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'x' });
    const { container } = renderSvg({ nounId: 1, index: 0, square: 0, shift: 3 });
    expect(container.querySelector('circle')?.getAttribute('cy')).toBe('-21');
  });

  it('rerender from seed undefined to defined switches LoadingNoun → circle', () => {
    useNounSeedMock.mockReturnValueOnce(undefined);
    const { container, rerender } = renderSvg({ nounId: 1, index: 0, square: 55, shift: 3 });
    expect(container.querySelector('[data-testid="loading-noun"]')).not.toBeNull();
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'x' });
    rerender(
      <svg>
        <TightStackedCircleNiji nounId={1} index={0} square={55} shift={3} />
      </svg>,
    );
    expect(container.querySelector('circle')).not.toBeNull();
  });

  it('huge nounId (Number.MAX_SAFE_INTEGER) renders as string id', () => {
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'x' });
    const huge = Number.MAX_SAFE_INTEGER;
    const { container } = renderSvg({ nounId: huge, index: 0, square: 55, shift: 3 });
    expect(container.querySelector('circle')?.getAttribute('id')).toBe(String(huge));
  });

  it('negative shift value computes negative position correctly', () => {
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'x' });
    const { container } = renderSvg({ nounId: 1, index: 1, square: 55, shift: -3 });
    expect(container.querySelector('circle')?.getAttribute('cx')).toBe('25'); // 28 + 1*-3
  });

  it('multiple instances in same svg render independently', () => {
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'x' });
    const { container } = render(
      <svg>
        <TightStackedCircleNiji nounId={1} index={0} square={55} shift={3} />
        <TightStackedCircleNiji nounId={2} index={1} square={55} shift={3} />
      </svg>,
    );
    expect(container.querySelectorAll('circle').length).toBe(2);
  });

  it('seed null also triggers LoadingNoun', () => {
    useNounSeedMock.mockReturnValue(null);
    const { container } = renderSvg({ nounId: 1, index: 0, square: 55, shift: 3 });
    expect(container.querySelector('[data-testid="loading-noun"]')).not.toBeNull();
  });

  it('image element renders inside SVG when seed present', () => {
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'data:img' });
    const { container } = renderSvg({ nounId: 1, index: 0, square: 55, shift: 3 });
    expect(container.querySelector('svg image')).not.toBeNull();
  });

  it('large index (10) does not crash', () => {
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'x' });
    expect(() => renderSvg({ nounId: 1, index: 10, square: 55, shift: 3 })).not.toThrow();
  });

  it('cx + cy values are numeric (not NaN)', () => {
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'x' });
    const { container } = renderSvg({ nounId: 1, index: 2, square: 55, shift: 3 });
    const circle = container.querySelector('circle');
    expect(circle?.getAttribute('cx')).toMatch(/^-?\d+(\.\d+)?$/);
    expect(circle?.getAttribute('cy')).toMatch(/^-?\d+(\.\d+)?$/);
  });

  it('different image data renders different href', () => {
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'data:img-1' });
    const { container } = renderSvg({ nounId: 1, index: 0, square: 55, shift: 3 });
    expect(container.querySelector('image')?.getAttribute('href')).toBe('data:img-1');
  });

  it('square=100 + shift=5 + index=3 calculates correct cx', () => {
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'x' });
    const { container } = renderSvg({ nounId: 1, index: 3, square: 100, shift: 5 });
    expect(container.querySelector('circle')?.getAttribute('cx')).toBe('43'); // 28 + 3*5
  });

  it('seed loaded after delay (rerender) shows image', () => {
    useNounSeedMock.mockReturnValueOnce(undefined);
    const { container, rerender } = renderSvg({ nounId: 1, index: 0, square: 55, shift: 3 });
    expect(container.querySelector('image')).toBeNull();
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'data:loaded' });
    rerender(
      <svg>
        <TightStackedCircleNiji nounId={1} index={0} square={55} shift={3} />
      </svg>,
    );
    expect(container.querySelector('image')?.getAttribute('href')).toBe('data:loaded');
  });

  it('renders without crash for nounId=0', () => {
    useNounSeedMock.mockReturnValue(undefined);
    expect(() => renderSvg({ nounId: 0, index: 0, square: 55, shift: 3 })).not.toThrow();
  });

  it('renders without crash for large nounId', () => {
    useNounSeedMock.mockReturnValue(undefined);
    expect(() => renderSvg({ nounId: 99999, index: 0, square: 55, shift: 3 })).not.toThrow();
  });

  it('renders for different index values (1, 2)', () => {
    useNounSeedMock.mockReturnValue(undefined);
    expect(() => renderSvg({ nounId: 1, index: 1, square: 55, shift: 3 })).not.toThrow();
    expect(() => renderSvg({ nounId: 1, index: 2, square: 55, shift: 3 })).not.toThrow();
  });

  it('renders for different square sizes (10, 100)', () => {
    useNounSeedMock.mockReturnValue(undefined);
    expect(() => renderSvg({ nounId: 1, index: 0, square: 10, shift: 3 })).not.toThrow();
    expect(() => renderSvg({ nounId: 1, index: 0, square: 100, shift: 3 })).not.toThrow();
  });

  it('renders multiple instances independently', () => {
    useNounSeedMock.mockReturnValue(undefined);
    expect(() =>
      render(
        <svg>
          <TightStackedCircleNiji nounId={1} index={0} square={55} shift={3} />
          <TightStackedCircleNiji nounId={2} index={1} square={55} shift={3} />
          <TightStackedCircleNiji nounId={3} index={2} square={55} shift={3} />
        </svg>,
      ),
    ).not.toThrow();
  });

  it('renders 10 instances each independently', () => {
    useNounSeedMock.mockReturnValue(undefined);
    expect(() =>
      render(
        <svg>
          {Array.from({ length: 10 }, (_, i) => (
            <TightStackedCircleNiji key={i} nounId={i} index={i % 3} square={55} shift={3} />
          ))}
        </svg>,
      ),
    ).not.toThrow();
  });

  it('handles shift=0 without crash', () => {
    useNounSeedMock.mockReturnValue(undefined);
    expect(() => renderSvg({ nounId: 1, index: 0, square: 55, shift: 0 })).not.toThrow();
  });

  it('handles shift=100 without crash', () => {
    useNounSeedMock.mockReturnValue(undefined);
    expect(() => renderSvg({ nounId: 1, index: 0, square: 55, shift: 100 })).not.toThrow();
  });

  it('rerender does not crash 5 times', () => {
    useNounSeedMock.mockReturnValue(undefined);
    const { rerender } = render(
      <svg>
        <TightStackedCircleNiji nounId={1} index={0} square={55} shift={3} />
      </svg>,
    );
    for (let i = 0; i < 5; i++) {
      expect(() =>
        rerender(
          <svg>
            <TightStackedCircleNiji nounId={i + 1} index={i % 3} square={55} shift={3} />
          </svg>,
        ),
      ).not.toThrow();
    }
  });

  it('renders consistent loading state across multiple renders', () => {
    useNounSeedMock.mockReturnValue(undefined);
    for (let i = 0; i < 5; i++) {
      const { container } = renderSvg({ nounId: i, index: i, square: 55, shift: 3 });
      expect(container.querySelector('[data-testid="loading-noun"]')).not.toBeNull();
    }
  });

  it('mount-unmount 500 cycles', () => {
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'svg-data' });
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<TightStackedCircleNiji nounId={1} />);
      unmount();
    }
  });

  it('renders 500 instances all in single mount', () => {
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'svg-data' });
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <TightStackedCircleNiji key={i} nounId={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different nounIds', () => {
    useNounSeedMock.mockReturnValue({});
    getNijiMock.mockReturnValue({ image: 'svg-data' });
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TightStackedCircleNiji nounId={i} />);
      unmount();
    }
  });

  it('handles 30 different seed combinations', () => {
    getNijiMock.mockReturnValue({ image: 'svg-data' });
    for (let i = 0; i < 30; i++) {
      useNounSeedMock.mockReturnValue({ seed: i });
      const { unmount } = render(<TightStackedCircleNiji nounId={i} />);
      unmount();
    }
  });

  it('handles undefined seed (loading state) 100 times', () => {
    useNounSeedMock.mockReturnValue(undefined);
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TightStackedCircleNiji nounId={i} />);
      unmount();
    }
  });

  it('round-2 mount-unmount 300 cycles', () => {
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(<TightStackedCircleNiji index={0} nounId={1n} />);
      unmount();
    }
  });

  it('round-2 renders 300 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <TightStackedCircleNiji key={i} index={i} nounId={BigInt(i)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 different nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TightStackedCircleNiji index={0} nounId={BigInt(i + 100)} />);
      unmount();
    }
  });

  it('round-2 handles 30 different index values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TightStackedCircleNiji index={i} nounId={1n} />);
      unmount();
    }
  });

  it('round-2 100 rerender cycles', () => {
    const { rerender } = render(<TightStackedCircleNiji index={0} nounId={1n} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<TightStackedCircleNiji index={i} nounId={BigInt(i)} />)).not.toThrow();
    }
  });

  it('round-3 mount-unmount 300 cycles', () => {
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(<TightStackedCircleNiji index={0} nounId={1n} />);
      unmount();
    }
  });

  it('round-3 renders 300 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <TightStackedCircleNiji key={i} index={i} nounId={BigInt(i)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TightStackedCircleNiji index={0} nounId={BigInt(i + 100)} />);
      unmount();
    }
  });

  it('round-3 30 different index values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TightStackedCircleNiji index={i} nounId={1n} />);
      unmount();
    }
  });

  it('round-3 100 rerender cycles', () => {
    const { rerender } = render(<TightStackedCircleNiji index={0} nounId={1n} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<TightStackedCircleNiji index={i} nounId={BigInt(i)} />)).not.toThrow();
    }
  });

  it('round-4 mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<TightStackedCircleNiji index={0} nounId={1n} />);
      unmount();
    }
  });

  it('round-4 renders 200 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <TightStackedCircleNiji key={i} index={i} nounId={BigInt(i + 500)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TightStackedCircleNiji index={0} nounId={BigInt(i + 1000)} />);
      unmount();
    }
  });

  it('round-4 100 rerender cycles', () => {
    const { rerender } = render(<TightStackedCircleNiji index={0} nounId={1n} />);
    for (let i = 0; i < 100; i++) {
      expect(() =>
        rerender(<TightStackedCircleNiji index={i} nounId={BigInt(i + 2000)} />),
      ).not.toThrow();
    }
  });

  it('round-4 50 different index values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TightStackedCircleNiji index={i + 100} nounId={1n} />);
      unmount();
    }
  });

  it('round-5 mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<TightStackedCircleNiji index={0} nounId={1n} />);
      unmount();
    }
  });

  it('round-5 renders 200 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <TightStackedCircleNiji key={i} index={i} nounId={BigInt(i + 500)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 different nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TightStackedCircleNiji index={0} nounId={BigInt(i + 5000)} />);
      unmount();
    }
  });

  it('round-5 100 rerender cycles', () => {
    const { rerender } = render(<TightStackedCircleNiji index={0} nounId={1n} />);
    for (let i = 0; i < 100; i++) {
      expect(() =>
        rerender(<TightStackedCircleNiji index={i} nounId={BigInt(i + 9000)} />),
      ).not.toThrow();
    }
  });

  it('round-5 50 different index values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TightStackedCircleNiji index={i + 500} nounId={1n} />);
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TightStackedCircleNiji index={0} nounId={1n} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TightStackedCircleNiji key={i} index={i} nounId={BigInt(i + 8000)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TightStackedCircleNiji index={0} nounId={1n} />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TightStackedCircleNiji index={0} nounId={1n} />);
      unmount();
    }
  });

  it('round-6 50 different index values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TightStackedCircleNiji index={i + 9000} nounId={1n} />);
      unmount();
    }
  });
});
