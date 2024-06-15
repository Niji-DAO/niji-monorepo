export interface NounSeed {
  background: number;
  backgroundDecoration: number;
  special: number;
  leftHand: number;
  back: number;
  ear: number;
  choker: number;
  clothe: number;
  hair: number;
  headphone: number;
  hat: number;
  backDecoration: number;
}

export interface EncodedImage {
  filename: string;
  data: string;
}

export interface NounData {
  parts: EncodedImage[];
  background: string;
}
