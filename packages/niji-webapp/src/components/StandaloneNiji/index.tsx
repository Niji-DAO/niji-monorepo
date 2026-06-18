import { type FC, useEffect } from 'react';

import { buildSVG } from '@niji/sdk';
import Image from 'react-bootstrap/Image';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router';

import LegacyNoun from '@/components/LegacyNoun';
import { getNijiData, NijiImageData } from '@/lib/nijiAssets';
import { setOnDisplayAuctionNounId } from '@/state/slices/onDisplayAuction';
import { INounSeed, useNounSeed } from '@/wrappers/nijiToken';

import classes from './StandaloneNiji.module.css';

import nounClasses from '@/components/LegacyNoun/Noun.module.css';

interface StandaloneNijiProps {
  nounId: bigint;
}
interface StandaloneCircularNijiProps {
  nounId: bigint;
  border?: boolean;
}

interface StandaloneNijiWithSeedProps {
  nounId: bigint;
  onLoadSeed?: (seed: INounSeed) => void;
  shouldLinkToProfile: boolean;
}

export const getNiji = (nounId: string | bigint, seed: INounSeed) => {
  const id = nounId.toString();
  const name = `Niji ${id}`;
  const description = `Niji ${id} is a member of the Niji DAO`;
  const { parts, background } = getNijiData(seed);
  const image = `data:image/svg+xml;base64,${btoa(buildSVG(parts, NijiImageData.palette, background))}`;

  return {
    name,
    description,
    image,
  };
};

/**
 * @deprecated Use [Noun](../Noun.tsx) instead
 */
export const StandaloneNijiImage: FC<StandaloneNijiProps> = (props: StandaloneNijiProps) => {
  const { nounId } = props;
  const seed = useNounSeed(nounId);
  const niji = seed && getNiji(nounId, seed);

  return <Image src={niji ? niji.image : ''} fluid />;
};

/**
 * @deprecated Use [Noun](../Noun.tsx) instead
 */
const StandaloneNiji: FC<StandaloneNijiProps> = (props: StandaloneNijiProps) => {
  const { nounId } = props;
  const seed = useNounSeed(nounId);
  const niji = seed && getNiji(nounId, seed);

  const dispatch = useDispatch();

  const onClickHandler = () => {
    dispatch(setOnDisplayAuctionNounId(Number(nounId)));
  };

  return (
    <Link
      to={'/niji/' + nounId.toString()}
      className={classes.clickableNiji}
      onClick={onClickHandler}
    >
      <LegacyNoun imgPath={niji ? niji.image : ''} alt={niji ? niji.description : 'Niji'} />
    </Link>
  );
};

/**
 * @deprecated Use [Noun](../Noun.tsx) instead
 */
export const StandaloneNijiCircular: FC<StandaloneCircularNijiProps> = (
  props: StandaloneCircularNijiProps,
) => {
  const { nounId, border } = props;
  const seed = useNounSeed(nounId);
  const niji = seed && getNiji(nounId, seed);

  const dispatch = useDispatch();
  const onClickHandler = () => {
    dispatch(setOnDisplayAuctionNounId(Number(nounId)));
  };

  if (!seed || nounId == undefined)
    return <LegacyNoun imgPath="" alt="Niji" wrapperClassName={nounClasses.circularNounWrapper} />;

  return (
    <Link
      to={'/niji/' + nounId.toString()}
      className={classes.clickableNiji}
      onClick={onClickHandler}
    >
      <LegacyNoun
        imgPath={niji ? niji.image : ''}
        alt={niji ? niji.description : 'Niji'}
        wrapperClassName={nounClasses.circularNounWrapper}
        className={border === true ? nounClasses.circleWithBorder : nounClasses.circular}
      />
    </Link>
  );
};

/**
 * @deprecated Use [Noun](../Noun.tsx) instead
 */
export const StandaloneNijiRoundedCorners: FC<StandaloneNijiProps> = (
  props: StandaloneNijiProps,
) => {
  const { nounId } = props;
  const seed = useNounSeed(nounId);
  const niji = seed && getNiji(nounId, seed);

  const dispatch = useDispatch();
  const onClickHandler = () => {
    dispatch(setOnDisplayAuctionNounId(Number(nounId)));
  };

  return (
    <Link
      to={'/niji/' + nounId.toString()}
      className={classes.clickableNiji}
      onClick={onClickHandler}
    >
      <LegacyNoun
        imgPath={niji ? niji.image : ''}
        alt={niji ? niji.description : 'Niji'}
        className={nounClasses.rounded}
      />
    </Link>
  );
};

/**
 * @deprecated Use [Noun](../Noun.tsx) instead
 */
export const StandaloneNijiWithSeed: FC<StandaloneNijiWithSeedProps> = ({
  nounId,
  onLoadSeed,
  shouldLinkToProfile,
}: StandaloneNijiWithSeedProps) => {
  const dispatch = useDispatch();
  const seed = useNounSeed(nounId);
  const seedIsInvalid = Object.values(seed || {}).every(v => v === 0);

  useEffect(() => {
    if (seed && !seedIsInvalid && onLoadSeed) {
      onLoadSeed(seed);
    }
  }, [seed, seedIsInvalid, onLoadSeed]);

  if (!seed || seedIsInvalid || nounId == undefined || !onLoadSeed)
    return <LegacyNoun imgPath="" alt="Niji" />;

  const onClickHandler = () => {
    dispatch(setOnDisplayAuctionNounId(Number(nounId)));
  };

  const { image, description } = getNiji(nounId, seed);

  const niji = <LegacyNoun imgPath={image} alt={description} />;
  const nijiWithLink = (
    <Link
      to={'/niji/' + nounId.toString()}
      className={classes.clickableNiji}
      onClick={onClickHandler}
    >
      {niji}
    </Link>
  );
  return shouldLinkToProfile ? nijiWithLink : niji;
};

export default StandaloneNiji;
