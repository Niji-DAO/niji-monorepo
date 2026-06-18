import { FC, HTMLAttributes, useState, useEffect } from 'react';

import { buildSVG } from '@niji/sdk';
import { useQuery } from '@tanstack/react-query';

import loadingNoun from '@/assets/loading-skull-noun.gif';
import { getNijiData, NijiImageData } from '@/lib/nijiAssets';
import { INounSeed, useNounSeed } from '@/wrappers/nijiToken';

export interface NijiProps extends HTMLAttributes<HTMLImageElement> {
  nounId?: bigint;
  seed?: INounSeed;
  loadingNounFallback?: boolean;
  minFallbackDuration?: number;
}

const fallbackTransparentPixel =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

export const Niji: FC<NijiProps> = ({
  nounId,
  seed: providedSeed,
  loadingNounFallback,
  minFallbackDuration = 0,
  ...props
}) => {
  const [shouldShowFallback, setShouldShowFallback] = useState(false);
  const [fallbackStartTime, setFallbackStartTime] = useState<number | null>(null);
  const fetchedSeed = useNounSeed(nounId ?? 0n);

  const seed = providedSeed ?? (nounId !== undefined ? fetchedSeed : undefined);

  const { data: svg } = useQuery({
    queryKey: ['niji-svg', seed] as const,
    queryFn: () => {
      const { parts, background } = getNijiData(seed!);
      return buildSVG(parts, NijiImageData.palette, background);
    },
    enabled: !!seed,
  });

  // Handle fallback timing logic
  useEffect(() => {
    if (!svg && loadingNounFallback === true && !shouldShowFallback && fallbackStartTime == null) {
      // Start showing fallback and record start time
      setShouldShowFallback(true);
      setFallbackStartTime(Date.now());
    } else if (svg !== undefined && shouldShowFallback && fallbackStartTime != null) {
      // SVG is ready, check if minimum duration has passed
      const elapsed = Date.now() - fallbackStartTime;
      if (elapsed >= minFallbackDuration) {
        // Minimum duration passed, hide fallback immediately
        setShouldShowFallback(false);
        setFallbackStartTime(null);
      } else {
        // Wait for remaining time before hiding fallback
        const remainingTime = minFallbackDuration - elapsed;
        const timeoutId = setTimeout(() => {
          setShouldShowFallback(false);
          setFallbackStartTime(null);
        }, remainingTime);
        return () => clearTimeout(timeoutId);
      }
    } else if (loadingNounFallback !== true && shouldShowFallback) {
      // Fallback disabled, reset state
      setShouldShowFallback(false);
      setFallbackStartTime(null);
    }
  }, [svg, loadingNounFallback, shouldShowFallback, fallbackStartTime, minFallbackDuration]);

  if (shouldShowFallback) return <img {...props} src={loadingNoun} />;

  return (
    <img
      {...props}
      src={svg ? `data:image/svg+xml;base64,${btoa(svg)}` : fallbackTransparentPixel}
    />
  );
};
