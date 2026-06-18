import { StandaloneNijiImage } from '@/components/StandaloneNiji';

import classes from './CandidateSponsors.module.css';

type CandidateSponsorImageProps = {
  nounId: bigint;
};

const CandidateSponsorImage = ({ nounId }: CandidateSponsorImageProps) => (
  <div className={classes.sponsorAvatar}>
    <StandaloneNijiImage nounId={nounId} />
  </div>
);

export default CandidateSponsorImage;
