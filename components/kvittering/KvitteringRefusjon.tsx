import lokalStyling from '../../pages/kvittering/Kvittering.module.css';
import { harGyldigeRefusjonEndringer } from '../../utils/harGyldigeRefusjonEndringer';
import { KvitteringVisning } from '../../utils/lagKvitteringVisning';
import FullLonnIArbeidsgiverperioden from '../FullLonnIArbeidsgiverperioden/FullLonnIArbeidsgiverperioden';
import Heading2 from '../Heading2/Heading2';
import LonnUnderSykefravaeret from '../LonnUnderSykefravaeret/LonnUnderSykefravaeret';
import Skillelinje from '../Skillelinje/Skillelinje';

interface KvitteringRefusjonProps {
  refusjon: KvitteringVisning['refusjon'];
  fullLonnIArbeidsgiverperioden?: KvitteringVisning['fullLonnIArbeidsgiverperioden'];
}

export default function KvitteringRefusjon({
  refusjon,
  fullLonnIArbeidsgiverperioden
}: Readonly<KvitteringRefusjonProps>) {
  return (
    <>
      <Skillelinje />
      <Heading2>Refusjon</Heading2>
      {fullLonnIArbeidsgiverperioden && (
        <>
          <div className={lokalStyling.uthevet}>
            Betaler arbeidsgiver ut full lønn til arbeidstaker i arbeidsgiverperioden?
          </div>
          <FullLonnIArbeidsgiverperioden lonnIPerioden={fullLonnIArbeidsgiverperioden} />
        </>
      )}
      <LonnUnderSykefravaeret
        loenn={refusjon.loenn}
        harRefusjonEndringer={harGyldigeRefusjonEndringer(refusjon.endringer) ? 'Ja' : 'Nei'}
        refusjonEndringer={refusjon.endringer}
      />
    </>
  );
}
