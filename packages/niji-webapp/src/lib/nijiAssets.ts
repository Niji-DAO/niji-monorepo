// 30MB niji-data-rle.json は main bundle から切り離し、 起動時 fetch で lazy 展開。
// public/niji-data-rle.json は predev / prebuild で niji-assets からコピー (package.json)。
// top-level await + ES2022 target により NijiImageData は同期 API のまま維持。
interface NijiImageDataShape {
  palette: string[];
  images: Record<string, { filename: string; data: string }[]>;
}

async function loadNijiData(): Promise<NijiImageDataShape> {
  // 31337 local dev では常に fresh fetch (fresh chain で compositeOrder が変わった時
  // browser disk cache の stale JSON を掴まないよう cache-control no-cache 強制)。
  const isLocalDev = import.meta.env.VITE_CHAIN_ID === '31337';
  const res = await fetch('/niji-data-rle.json', {
    cache: isLocalDev ? 'no-store' : 'default',
  });
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
// = [10, 9, 8, 7, 0, 5, 1, 6, 4, 11, 2, 3]、 NIJI_TRAITS[id] の name で表記したもの。
// 配列順 = SVG z-order (先頭が最背面、 末尾が最前面)。
// 少数 trait (special 2 / back 2 / choker 4 / ear 3) を後方配置、
// variation 豊富な trait (hair 235 / clothing 166 / hat 32 / leftHand 13) を前面配置し
// user 目視で「変化する印象」 を最大化。
const compositeOrder = [
  'solidBackground',
  'background',
  'backDecoration',
  'back',
  'special',
  'clothing',
  'choker',
  'ear',
  'hat',
  'hair',
  'headphone',
  'leftHand',
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
