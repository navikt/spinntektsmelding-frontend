import { KvitteringVisning } from '../../utils/lagKvitteringVisning';
import BortfallNaturalytelser from '../BortfallNaturalytelser/BortfallNaturalytelser';
import Heading2 from '../Heading2/Heading2';
import Skillelinje from '../Skillelinje/Skillelinje';

interface KvitteringNaturalytelserProps {
  tittel: string;
  naturalytelser: KvitteringVisning['naturalytelser'];
}

export default function KvitteringNaturalytelser({ tittel, naturalytelser }: Readonly<KvitteringNaturalytelserProps>) {
  return (
    <>
      <Skillelinje />
      <Heading2>{tittel}</Heading2>
      <BortfallNaturalytelser ytelser={naturalytelser} />
    </>
  );
}
