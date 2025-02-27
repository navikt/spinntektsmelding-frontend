import { useEffect } from 'react';
import useBoundStore from '../../state/useBoundStore';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import EgenmeldingLoader from '../Egenmelding/EgenmeldingLoader';
import Heading3 from '../Heading3/Heading3';
import FravaerEnkeltAnsattforhold from './FravaerEnkeltAnsattforhold';
import { finnFravaersperioder } from '../../state/useEgenmeldingStore';
import finnAktiveFravaersperioder from '../../utils/finnAktiveFravaersperioder';

interface FravaersperiodeProps {
  lasterData?: boolean;
  setIsDirtyForm: (dirty: boolean) => void;
  skjemastatus?: SkjemaStatus;
  selvbestemtInnsending?: boolean;
}

export default function Fravaersperiode({
  lasterData,
  skjemastatus,
  setIsDirtyForm,
  selvbestemtInnsending
}: Readonly<FravaersperiodeProps>) {
  const fravaerPerioder = useBoundStore((state) => state.fravaersperioder);
  const leggTilFravaersperiode = useBoundStore((state) => state.leggTilFravaersperiode);
  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const sykOgEgenmeldingPerioder = finnFravaersperioder(egenmeldingsperioder ?? [], fravaerPerioder);
  const perioderTilBruk = finnAktiveFravaersperioder(sykOgEgenmeldingPerioder);
  const sisteAktivePeriode = perioderTilBruk?.[perioderTilBruk.length - 1];

  useEffect(() => {
    if (skjemastatus === SkjemaStatus.SELVBESTEMT && (!fravaerPerioder || fravaerPerioder.length < 1)) {
      leggTilFravaersperiode();
    }
  }, [fravaerPerioder, skjemastatus, leggTilFravaersperiode]);

  return (
    <>
      <Heading3>Sykmeldingsperiode</Heading3>

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
