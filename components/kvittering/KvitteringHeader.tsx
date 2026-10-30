import ButtonEndre from '../ButtonEndre';
import Heading2 from '../Heading2/Heading2';

interface KvitteringHeaderProps {
  onEndre: () => void;
}

export default function KvitteringHeader({ onEndre }: Readonly<KvitteringHeaderProps>) {
  return (
    <div className='page-kvittering-header'>
      <Heading2>Kvittering - innsendt inntektsmelding</Heading2>
      <div className='page-content-header-extra'>
        <ButtonEndre onClick={onEndre} />
      </div>
    </div>
  );
}
