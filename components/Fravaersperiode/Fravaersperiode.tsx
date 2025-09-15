import { useEffect } from 'react';
import useBoundStore from '../../state/useBoundStore';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import EgenmeldingLoader from '../Egenmelding/EgenmeldingLoader';
import { Heading3 } from '../Heading';
import FravaerEnkeltAnsattforhold from './FravaerEnkeltAnsattforhold';

interface FravaersperiodeProps {
  lasterData?: boolean;
  setIsDirtyForm: (dirty: boolean) => void;
  skjemastatus?: SkjemaStatus;
}

export default function Fravaersperiode({ lasterData, skjemastatus, setIsDirtyForm }: Readonly<FravaersperiodeProps>) {
  const fravaerPerioder = useBoundStore((state) => state.sykmeldingsperioder);
  const leggTilFravaersperiode = useBoundStore((state) => state.leggTilFravaersperiode);

  useEffect(() => {
    if (skjemastatus === SkjemaStatus.SELVBESTEMT && (!fravaerPerioder || fravaerPerioder.length < 1)) {
      leggTilFravaersperiode();
    }
  }, [fravaerPerioder, skjemastatus, leggTilFravaersperiode]);

  const fravaerPerioderErTom = !fravaerPerioder || fravaerPerioder.length === 0;
  return (
    <>
      <Heading3>Sykmeldingsperiode</Heading3>

      {lasterData && <EgenmeldingLoader />}
      {!lasterData && !fravaerPerioderErTom && (
        <FravaerEnkeltAnsattforhold
          fravaerPerioder={fravaerPerioder}
          skjemastatus={skjemastatus}
          setIsDirtyForm={setIsDirtyForm}
        />
      )}
    </>
  );
}
