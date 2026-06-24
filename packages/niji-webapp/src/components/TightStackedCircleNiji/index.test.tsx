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
});
