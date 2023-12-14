import { useEffect } from 'react';
import useBoundStore from '../../state/useBoundStore';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import EgenmeldingLoader from '../Egenmelding/EgenmeldingLoader';
import Heading3 from '../Heading3/Heading3';
import FravaerEnkeltAnsattforhold from './FravaerEnkeltAnsattforhold';

interface FravaersperiodeProps {
  lasterData?: boolean;
  setIsDirtyForm: (dirty: boolean) => void;
  skjemastatus?: SkjemaStatus;
}

export default function Fravaersperiode({ lasterData, skjemastatus, setIsDirtyForm }: FravaersperiodeProps) {
  const fravaerPerioder = useBoundStore((state) => state.fravaersperioder);
  const leggTilFravaersperiode = useBoundStore((state) => state.leggTilFravaersperiode);
  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  const arbeidsgiverperioderMedData = arbeidsgiverperioder?.filter((periode) => periode?.fom && periode?.tom);
  const startSisteAktivePeriode = arbeidsgiverperioderMedData?.[arbeidsgiverperioderMedData.length - 1]?.tom;

  useEffect(() => {
    console.log('fravaerPerioder - useEffect', fravaerPerioder);
    if (skjemastatus === SkjemaStatus.BLANK && (!fravaerPerioder || fravaerPerioder.length === 0)) {
      console.log('fravaerPerioder - useEffect - treff', fravaerPerioder);
      leggTilFravaersperiode();
    }
  }, [fravaerPerioder, skjemastatus]);
  console.log('fravaerPerioder', fravaerPerioder, skjemastatus);

  return (
    <>
      <Heading3>Sykmelding</Heading3>
      <p>
        I følge sykmeldingen var den ansatte syk i perioden som er ferdig utfylt. Sykmeldingsperioden brukes sammen med
        eventuelle egenmeldinger til å beregne arbeidsgiverperioden.
      </p>

      {lasterData && <EgenmeldingLoader />}
      {!lasterData && (
        <FravaerEnkeltAnsattforhold
          fravaerPerioder={fravaerPerioder}
          startSisteAktivePeriode={startSisteAktivePeriode}
          skjemastatus={skjemastatus}
          setIsDirtyForm={setIsDirtyForm}
        />
      )}
    </>
  );
}
