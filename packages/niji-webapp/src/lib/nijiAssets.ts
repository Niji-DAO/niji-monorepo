import imageData from '../../../niji-assets/_archive/src/niji-data-rle.json';

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

const compositeOrder = [
  'solidBackground',
  'background',
  'backDecoration',
  'special',
  'leftHand',
  'back',
  'clothing',
  'choker',
  'ear',
  'hair',
  'hat',
  'headphone',
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
