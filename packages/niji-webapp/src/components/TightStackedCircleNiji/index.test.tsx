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
});
