// 30MB niji-data-rle.json は main bundle から切り離し、 起動時 fetch で lazy 展開。
// public/niji-data-rle.json は predev / prebuild で niji-assets からコピー (package.json)。
// top-level await + ES2022 target により NijiImageData は同期 API のまま維持。
interface NijiImageDataShape {
  palette: string[];
  images: Record<string, { filename: string; data: string }[]>;
}

async function loadNijiData(): Promise<NijiImageDataShape> {
  const res = await fetch('/niji-data-rle.json');
  if (!res.ok) throw new Error(`niji-data-rle.json fetch failed: ${res.status}`);
  return res.json();
}

const imageData: NijiImageDataShape = await loadNijiData();

export interface NijiSeed {
  special: number;
  choker: number;
  headphone: number;
  leftHand: number;
  hat: number;
  clothing: number;
  ear: number;
  back: number;
  backDecoration: number;
  background: number;
  solidBackground: number;
  hair: number;
}

export interface EncodedImage {
  filename: string;
  data: string;
}

export interface NijiData {
  parts: EncodedImage[];
  background?: string;
}

export const NijiImageData = imageData;

// SSOT — packages/niji-contracts/scripts/niji-encoder.ts の `NIJI_TRAITS` (id 0..11)。
// 順序が trait id の昇順 = NijiArt ストレージ index と一致する必要がある。
export const nijiTraitKeys = [
  'special',
  'choker',
  'headphone',
  'leftHand',
  'hat',
  'clothing',
  'ear',
  'back',
  'backDecoration',
  'background',
  'solidBackground',
  'hair',
] as const satisfies readonly (keyof NijiSeed)[];

// SSOT — packages/niji-contracts/scripts/niji-encoder.ts の `NIJI_COMPOSITE_ORDER`
// = [10, 9, 8, 7, 5, 1, 6, 4, 11, 2, 3, 0]、 NIJI_TRAITS[id] の name で表記したもの。
// 配列順 = SVG z-order (先頭が最背面、 末尾が最前面)。 contracts の NijiDescriptor
// と integer index <-> string name の表現が違うだけで意味は同じ。
// 完璧仕様 = 12 trait 全てを user が視認できる順序 (hair を hat の上に配置し隠蔽解消)。
const compositeOrder = [
  'solidBackground',
  'background',
  'backDecoration',
  'back',
  'clothing',
  'choker',
  'ear',
  'hat',
  'hair',
  'headphone',
  'leftHand',
  'special',
] as const satisfies readonly (keyof NijiSeed)[];

export const humanizeTraitKey = (key: keyof NijiSeed) => {
  switch (key) {
    case 'leftHand':
      return 'Left Hand';
    case 'backDecoration':
      return 'Back Decoration';
    case 'solidBackground':
      return 'Solid Background';
    default:
      return key.charAt(0).toUpperCase() + key.slice(1);
  }
};

export const getNijiData = (seed: NijiSeed): NijiData => ({
  parts: compositeOrder
    .map(key => NijiImageData.images[key][seed[key]])
    .filter((part): part is EncodedImage => part != null && typeof part.data === 'string'),
});

export const getRandomNijiSeed = (): NijiSeed => {
  return nijiTraitKeys.reduce(
    (acc, key) => {
      acc[key] = Math.floor(Math.random() * NijiImageData.images[key].length);
      return acc;
    },
    {} as Record<keyof NijiSeed, number>,
  ) as NijiSeed;
};
