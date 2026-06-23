import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@niji/sdk', () => ({
  buildSVG: () => '<svg>stub</svg>',
}));

const hookState: {
  fetchedSeed: {
    background: number;
    body: number;
    accessory: number;
    head: number;
    glasses: number;
  };
  querySvg: string | undefined;
} = {
  fetchedSeed: { background: 1, body: 2, accessory: 3, head: 4, glasses: 5 },
  querySvg: '<svg>render</svg>',
};

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ enabled }: { enabled?: boolean }) => ({
    data: enabled === true ? hookState.querySvg : undefined,
  }),
}));

const setOnDisplayAuctionNounIdMock = vi.fn();
vi.mock('jotai/react', () => ({
  useSetAtom: () => setOnDisplayAuctionNounIdMock,
}));

vi.mock('@/assets/loading-skull-noun.gif', () => ({
  default: 'loading-skull.gif',
}));

vi.mock('@/lib/nijiAssets', () => ({
  getNijiData: () => ({ parts: [], background: 'fff' }),
  NijiImageData: { palette: [] },
}));

vi.mock('@/state/atoms/onDisplayAuctionAtom', () => ({
  onDisplayAuctionNounIdAtom: {},
}));

vi.mock('@/wrappers/nijiToken', () => ({
  useNounSeed: () => hookState.fetchedSeed,
}));

vi.mock('@/components/LegacyNoun/Noun.module.css', () => ({
  default: {
    img: 'img-class',
    imgWrapper: 'img-wrapper',
    circular: 'circular',
    circleWithBorder: 'circle-border',
    circularNounWrapper: 'circle-wrapper',
    rounded: 'rounded',
  },
}));

import DefaultLinkedNiji, {
  Niji,
  NijiCircular,
  NijiImage,
  NijiRoundedCorners,
  NijiWithSeed,
} from './Niji';

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

const resetState = () => {
  hookState.fetchedSeed = { background: 1, body: 2, accessory: 3, head: 4, glasses: 5 };
  hookState.querySvg = '<svg>render</svg>';
  setOnDisplayAuctionNounIdMock.mockReset();
};

beforeEach(() => {
  resetState();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Niji', () => {
  it('default export renders img inside Link', () => {
    const { container } = wrap(<DefaultLinkedNiji nounId={5n} />);
    expect(container.querySelector('a[href="/niji/5"]')).not.toBeNull();
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('LinkedNiji omits Link when shouldLinkToProfile=false', () => {
    const { container } = wrap(<DefaultLinkedNiji nounId={5n} shouldLinkToProfile={false} />);
    expect(container.querySelector('a')).toBeNull();
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('LinkedNiji click triggers setOnDisplayAuctionNounId(Number)', () => {
    const { container } = wrap(<DefaultLinkedNiji nounId={9n} />);
    const link = container.querySelector('a') as HTMLAnchorElement;
    fireEvent.click(link);
    expect(setOnDisplayAuctionNounIdMock).toHaveBeenCalledWith(9);
  });

  it('Niji renders data:image/svg+xml src when query returns svg', () => {
    const { container } = render(<Niji nounId={5n} />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.src.startsWith('data:image/svg+xml;base64,')).toBe(true);
  });

  it('Niji renders fallback transparent pixel when no svg', () => {
    hookState.querySvg = undefined;
    const { container } = render(<Niji nounId={5n} />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.src.startsWith('data:image/gif;base64,')).toBe(true);
  });

  it('Niji loadingNounFallback=true with no svg renders loading gif', () => {
    hookState.querySvg = undefined;
    const { container } = render(<Niji nounId={5n} loadingNounFallback={true} />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.src).toContain('loading-skull.gif');
  });

  it('Niji uses provided alt prop over auto-generated alt', () => {
    const { container } = render(<Niji nounId={5n} alt="custom alt" />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.alt).toBe('custom alt');
  });

  it('Niji auto-generates alt from nounId when no alt provided', () => {
    const { container } = render(<Niji nounId={5n} />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.alt).toContain('Niji 5');
  });

  it('NijiImage renders without fallback by default', () => {
    const { container } = render(<NijiImage nounId={1n} />);
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('NijiCircular border=true applies circleWithBorder class', () => {
    const { container } = wrap(<NijiCircular nounId={1n} border={true} />);
    const img = container.querySelector('img');
    expect(img?.className).toContain('circle-border');
  });

  it('NijiCircular border=false applies circular class', () => {
    const { container } = wrap(<NijiCircular nounId={1n} border={false} />);
    const img = container.querySelector('img');
    expect(img?.className).toContain('circular');
  });

  it('NijiRoundedCorners applies rounded class', () => {
    const { container } = wrap(<NijiRoundedCorners nounId={1n} />);
    const img = container.querySelector('img');
    expect(img?.className).toContain('rounded');
  });

  it('NijiWithSeed calls onLoadSeed when seed is valid', () => {
    const onLoadSeedMock = vi.fn();
    wrap(<NijiWithSeed nounId={1n} onLoadSeed={onLoadSeedMock} />);
    expect(onLoadSeedMock).toHaveBeenCalledWith(hookState.fetchedSeed);
  });

  it('NijiWithSeed skips onLoadSeed when seed is all zeros (invalid)', () => {
    hookState.fetchedSeed = { background: 0, body: 0, accessory: 0, head: 0, glasses: 0 };
    const onLoadSeedMock = vi.fn();
    wrap(<NijiWithSeed nounId={1n} onLoadSeed={onLoadSeedMock} />);
    expect(onLoadSeedMock).not.toHaveBeenCalled();
  });
});
