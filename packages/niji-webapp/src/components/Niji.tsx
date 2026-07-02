import { FC, ImgHTMLAttributes, useEffect, useState } from 'react';

import { buildSVG } from '@niji/sdk';
import { useQuery } from '@tanstack/react-query';
import { useSetAtom } from 'jotai/react';
import { Link } from 'react-router';

import loadingNoun from '@/assets/loading-skull-noun.gif';
import { getNijiData, NijiImageData } from '@/lib/nijiAssets';
import { onDisplayAuctionNounIdAtom } from '@/state/atoms/onDisplayAuctionAtom';
import { INounSeed, useNounSeed } from '@/wrappers/nijiToken';

import nounClasses from '@/components/LegacyNoun/Noun.module.css';

export interface NijiProps extends ImgHTMLAttributes<HTMLImageElement> {
  nounId?: bigint;
  seed?: INounSeed;
  loadingNounFallback?: boolean;
  minFallbackDuration?: number;
}

interface LinkedNijiProps extends NijiProps {
  nounId: bigint;
  wrapperClassName?: string;
  shouldLinkToProfile?: boolean;
}

interface NijiCircularProps extends LinkedNijiProps {
  border?: boolean;
}

interface NijiWithSeedProps extends LinkedNijiProps {
  onLoadSeed?: (seed: INounSeed) => void;
}

type NijiImageProps = NijiProps & {
  nounId: bigint;
};

const fallbackTransparentPixel =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

const joinClassNames = (...classNames: Array<string | undefined>) =>
  classNames.filter(Boolean).join(' ');

const isValidSeed = (seed?: INounSeed) => !!seed && Object.values(seed).some(value => value !== 0);

const buildNijiImage = (seed: INounSeed) => {
  const { parts, background } = getNijiData(seed);
  return `data:image/svg+xml;base64,${btoa(buildSVG(parts, NijiImageData.palette, background))}`;
};

const getNijiAlt = (nounId?: bigint) =>
  nounId !== undefined ? `Niji ${nounId.toString()} is a member of the Niji DAO` : 'Niji';

export const getNiji = (nounId: string | bigint, seed: INounSeed) => {
  const id = nounId.toString();

  return {
    name: `Niji ${id}`,
    description: `Niji ${id} is a member of the Niji DAO`,
    image: buildNijiImage(seed),
  };
};

export const Niji: FC<NijiProps> = ({
  nounId,
  seed: providedSeed,
  loadingNounFallback,
  minFallbackDuration = 0,
  alt,
  ...props
}) => {
  const [shouldShowFallback, setShouldShowFallback] = useState(false);
  const [fallbackStartTime, setFallbackStartTime] = useState<number | null>(null);
  const fetchedSeed = useNounSeed(nounId ?? 0n);

  const seed = providedSeed ?? (nounId !== undefined ? fetchedSeed : undefined);

  const { data: svg } = useQuery({
    // seed object を JSON stringify で primitive 化 (deep compare を強制)、
    // nounId も明示 append で「別 Niji の同 seed 偶発一致」 でも別 cache 化する。
    queryKey: [
      'niji-svg',
      nounId?.toString() ?? 'no-id',
      seed ? JSON.stringify(seed) : 'no-seed',
    ] as const,
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

  if (shouldShowFallback)
    return <img {...props} alt={alt ?? getNijiAlt(nounId)} src={loadingNoun} />;

  return (
    <img
      {...props}
      alt={alt ?? getNijiAlt(nounId)}
      src={svg ? `data:image/svg+xml;base64,${btoa(svg)}` : fallbackTransparentPixel}
    />
  );
};

const LinkedNiji: FC<LinkedNijiProps> = ({
  nounId,
  wrapperClassName,
  className,
  shouldLinkToProfile = true,
  loadingNounFallback = true,
  alt,
  ...props
}) => {
  const setOnDisplayAuctionNounId = useSetAtom(onDisplayAuctionNounIdAtom);

  const image = (
    <div className={joinClassNames(nounClasses.imgWrapper, wrapperClassName)}>
      <Niji
        {...props}
        nounId={nounId}
        alt={alt ?? getNijiAlt(nounId)}
        className={joinClassNames(nounClasses.img, className)}
        loadingNounFallback={loadingNounFallback}
      />
    </div>
  );

  if (!shouldLinkToProfile) {
    return image;
  }

  const onClickHandler = () => {
    setOnDisplayAuctionNounId(Number(nounId));
  };

  return (
    <Link to={`/niji/${nounId.toString()}`} onClick={onClickHandler}>
      {image}
    </Link>
  );
};

export const NijiImage: FC<NijiImageProps> = ({
  nounId,
  loadingNounFallback = false,
  ...props
}) => <Niji nounId={nounId} loadingNounFallback={loadingNounFallback} {...props} />;

export const NijiCircular: FC<NijiCircularProps> = ({
  border,
  wrapperClassName,
  className,
  ...props
}) => (
  <LinkedNiji
    {...props}
    wrapperClassName={joinClassNames(nounClasses.circularNounWrapper, wrapperClassName)}
    className={joinClassNames(
      border ? nounClasses.circleWithBorder : nounClasses.circular,
      className,
    )}
  />
);

export const NijiRoundedCorners: FC<LinkedNijiProps> = ({ className, ...props }) => (
  <LinkedNiji {...props} className={joinClassNames(nounClasses.rounded, className)} />
);

export const NijiWithSeed: FC<NijiWithSeedProps> = ({
  nounId,
  onLoadSeed,
  seed: providedSeed,
  shouldLinkToProfile = true,
  ...props
}) => {
  const fetchedSeed = useNounSeed(nounId);
  const seed = providedSeed ?? fetchedSeed;

  useEffect(() => {
    if (!seed || !isValidSeed(seed) || !onLoadSeed) return;
    onLoadSeed(seed);
  }, [seed, onLoadSeed]);

  return (
    <LinkedNiji {...props} nounId={nounId} seed={seed} shouldLinkToProfile={shouldLinkToProfile} />
  );
};

const DefaultLinkedNiji: FC<LinkedNijiProps> = props => <LinkedNiji {...props} />;

export default DefaultLinkedNiji;
