import useBoundStore from '../../state/useBoundStore';
import EgenmeldingLoader from '../Egenmelding/EgenmeldingLoader';
import Heading3 from '../Heading3/Heading3';
import FravaerEnkeltAnsattforhold from './FravaerEnkeltAnsattforhold';

interface FravaersperiodeProps {
  lasterData?: boolean;
  setIsDirtyForm: (dirty: boolean) => void;
}
export default function Fravaersperiode({ lasterData, setIsDirtyForm }: FravaersperiodeProps) {
  const fravaersperioder = useBoundStore((state) => state.fravaersperioder);
  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);

  const arbeidsgiverperioderMedData = arbeidsgiverperioder?.filter((periode) => periode?.fom && periode?.tom);

  const startSisteAktivePeriode = arbeidsgiverperioderMedData?.[arbeidsgiverperioderMedData.length - 1].tom;

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
          fravaersperioder={fravaersperioder}
          startSisteAktivePeriode={startSisteAktivePeriode}
          setIsDirtyForm={setIsDirtyForm}
        />
      )}
    </>
  );
}
