import { Periode } from '../../state/state';
import useBoundStore from '../../state/useBoundStore';
import parseIsoDate from '../../utils/parseIsoDate';
import EgenmeldingLoader from '../Egenmelding/EgenmeldingLoader';
import Heading3 from '../Heading3/Heading3';
import FravaerEnkeltAnsattforhold from './FravaerEnkeltAnsattforhold';

interface FravaersperiodeProps {
  fravaersperioder: Array<Periode> | undefined;
  lasterData?: boolean;
}
export default function Fravaersperiode({ fravaersperioder, lasterData }: FravaersperiodeProps) {
  // const fravaersperioder = useBoundStore((state) => state.fravaersperioder);

  return (
    <>
      <Heading3>Sykmelding</Heading3>
      <p>
        I følge sykmeldingen var den ansatte syk i perioden som er ferdig utfylt. Sykmeldingsperioden brukes sammen med
        eventuelle egenmeldinger til å beregne arbeidsgiverperioden.
      </p>

      {lasterData && <EgenmeldingLoader />}
      {!lasterData && <FravaerEnkeltAnsattforhold fravaersperioder={fravaersperioder!} />}
    </>
  );
}
