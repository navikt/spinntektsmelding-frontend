import { useEffect } from 'react';
import useBoundStore from '../../state/useBoundStore';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import EgenmeldingLoader from '../Egenmelding/EgenmeldingLoader';
import Heading3 from '../Heading3/Heading3';
import FravaerEnkeltAnsattforhold from './FravaerEnkeltAnsattforhold';
import { finnFravaersperioder } from '../../state/useEgenmeldingStore';
import finnAktiveFravaersperioder from '../../utils/finnAktiveFravaersperioder';
import parseIsoDate from '../../utils/parseIsoDate';

interface FravaersperiodeProps {
  lasterData?: boolean;
  setIsDirtyForm: (dirty: boolean) => void;
  skjemastatus?: SkjemaStatus;
  selvbestemtInnsending?: boolean;
  perioder?: { fom: string; tom: string }[];
}

export default function Fravaersperiode({
  lasterData,
  skjemastatus,
  setIsDirtyForm,
  selvbestemtInnsending,
  perioder
}: Readonly<FravaersperiodeProps>) {
  const formatertePerioder = perioder
    ? perioder?.map((periode) => ({
        fom: parseIsoDate(periode.fom),
        tom: parseIsoDate(periode.tom),
        id: periode.fom + periode.tom
      }))
    : undefined;
  const fravaerPerioder = useBoundStore((state) => state.fravaersperioder);
  const leggTilFravaersperiode = useBoundStore((state) => state.leggTilFravaersperiode);
  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const sykOgEgenmeldingPerioder = finnFravaersperioder(
    egenmeldingsperioder ?? [],
    formatertePerioder ?? fravaerPerioder
  );
  const perioderTilBruk = finnAktiveFravaersperioder(sykOgEgenmeldingPerioder);
  const sisteAktivePeriode = perioderTilBruk?.[perioderTilBruk.length - 1];

  console.log('Fravaersperiode.tsx', {
    lasterData,
    skjemastatus,
    setIsDirtyForm,
    selvbestemtInnsending,
    sykOgEgenmeldingPerioder
  });
  useEffect(() => {
    if (skjemastatus === SkjemaStatus.SELVBESTEMT && (!fravaerPerioder || fravaerPerioder.length < 1)) {
      leggTilFravaersperiode();
    }
  }, [fravaerPerioder, skjemastatus, leggTilFravaersperiode]);

  return (
    <>
      <Heading3>Sykmelding</Heading3>
      <p>
        {!selvbestemtInnsending && (
          <>
            I følge sykmeldingen var den ansatte syk i perioden som er ferdig utfylt. Sykmeldingsperioden brukes sammen
            med eventuelle egenmeldinger til å beregne arbeidsgiverperioden.
          </>
        )}
        {selvbestemtInnsending && (
          <>
            Dere har angitt sykmeldingsperiode vist under. Hvis dere har angitt feil periode eller vil legge til flere
            sykmeldingsperioder, må dere opprette dette skjema igjen.
          </>
        )}
      </p>

      {lasterData && <EgenmeldingLoader />}
      {!lasterData && (
        <FravaerEnkeltAnsattforhold
          fravaerPerioder={formatertePerioder ?? fravaerPerioder}
          sisteAktivePeriode={sisteAktivePeriode}
          skjemastatus={skjemastatus}
          setIsDirtyForm={setIsDirtyForm}
        />
      )}
    </>
  );
}
