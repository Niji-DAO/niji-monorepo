import { NijiImage } from '@/components/Niji';

import classes from './CandidateSponsors.module.css';

type CandidateSponsorImageProps = {
  nounId: bigint;
};

const CandidateSponsorImage = ({ nounId }: CandidateSponsorImageProps) => (
  <div className={classes.sponsorAvatar}>
    <NijiImage nounId={nounId} />
  </div>
);

export default CandidateSponsorImage;
