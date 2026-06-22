import { NijiImage } from '@/components/Niji';

type CandidateSponsorImageProps = {
  nounId: bigint;
};

const CandidateSponsorImage = ({ nounId }: CandidateSponsorImageProps) => (
  <div className="h-8 w-8 [&_img]:block [&_img]:w-full [&_img]:rounded-full">
    <NijiImage nounId={nounId} />
  </div>
);

export default CandidateSponsorImage;
