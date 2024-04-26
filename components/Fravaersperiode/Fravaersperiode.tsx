import { useEffect } from 'react';
import useBoundStore from '../../state/useBoundStore';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import EgenmeldingLoader from '../Egenmelding/EgenmeldingLoader';
import Heading3 from '../Heading3/Heading3';
import FravaerEnkeltAnsattforhold from './FravaerEnkeltAnsattforhold';
import { finnPeriodeMedAntallDager, finnSammenhengendePeriode } from '../../utils/finnArbeidsgiverperiode';
import { Periode } from '../../state/state';
import { finnFravaersperioder } from '../../state/useEgenmeldingStore';

interface FravaersperiodeProps {
  lasterData?: boolean;
  setIsDirtyForm: (dirty: boolean) => void;
  skjemastatus?: SkjemaStatus;
}

export default function Fravaersperiode({ lasterData, skjemastatus, setIsDirtyForm }: FravaersperiodeProps) {
  const finnPerioder = (perioder?: Periode[]) => {
    if (!perioder) return [];
    const sammenhengenePerioder = finnSammenhengendePeriode(perioder);
    const avgrensetPeriode = finnPeriodeMedAntallDager(sammenhengenePerioder, 17);
    return avgrensetPeriode;
  };

  const fravaerPerioder = useBoundStore((state) => state.fravaersperioder);
  const leggTilFravaersperiode = useBoundStore((state) => state.leggTilFravaersperiode);
  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const sykOgEgenmeldingPerioder = finnFravaersperioder(egenmeldingsperioder ?? [], fravaerPerioder);
  const perioderTilBruk = finnPerioder(sykOgEgenmeldingPerioder);
  const sisteAktivePeriode = perioderTilBruk?.[perioderTilBruk.length - 1];

  useEffect(() => {
    if (skjemastatus === SkjemaStatus.SELVBESTEMT && (!fravaerPerioder || fravaerPerioder.length < 1)) {
      leggTilFravaersperiode();
    }
  }, [fravaerPerioder, skjemastatus, leggTilFravaersperiode]);

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
          sisteAktivePeriode={sisteAktivePeriode}
          skjemastatus={skjemastatus}
          setIsDirtyForm={setIsDirtyForm}
        />
      )}
    </>
  );
}
