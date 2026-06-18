import { NijiImageData, humanizeTraitKey } from '@/lib/nijiAssets';
import { INounSeed } from '@/wrappers/nijiToken';

const capitalizeWords = (s: string): string =>
  s.replace(/\b\w/g, char => char.toUpperCase()).replace(/-/g, ' ');

export const traitName = (type: keyof INounSeed, seed: number) => {
  const filename = NijiImageData.images[type][seed]?.filename;

  if (filename === undefined) {
    return humanizeTraitKey(type);
  }

  return capitalizeWords(
    filename.includes('-') ? filename.slice(filename.indexOf('-') + 1) : filename,
  );
};
