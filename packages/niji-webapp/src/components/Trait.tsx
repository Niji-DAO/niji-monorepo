import { FC, HTMLAttributes } from 'react';

import { buildSVG } from '@niji/sdk';
import { useQuery } from '@tanstack/react-query';

import { NijiImageData } from '@/lib/nijiAssets';
import { INounSeed } from '@/wrappers/nijiToken';

export interface TraitProps extends HTMLAttributes<HTMLImageElement> {
  type: keyof INounSeed;
  seed?: number;
}

const fallbackTransparentPixel =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

export const Trait: FC<TraitProps> = ({ type, seed, ...props }) => {
  const { data: svg } = useQuery({
    queryKey: ['trait-svg', type, seed] as const,
    queryFn: () => {
      const image = NijiImageData.images[type][seed!];
      return image?.data
        ? buildSVG([image], NijiImageData.palette, undefined)
        : buildSVG([], NijiImageData.palette, undefined);
    },
    enabled: seed !== undefined,
  });

  return (
    <img
      {...props}
      src={svg ? `data:image/svg+xml;base64,${btoa(svg)}` : fallbackTransparentPixel}
    />
  );
};
