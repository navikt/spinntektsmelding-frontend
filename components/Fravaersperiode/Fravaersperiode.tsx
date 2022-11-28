import useBoundStore from '../../state/useBoundStore';
import Heading3 from '../Heading3/Heading3';
import FravaerEnkeltAnsattforhold from './FravaerEnkeltAnsattforhold';

export default function Fravaersperiode() {
  const fravaersperioder = useBoundStore((state) => state.fravaersperioder);

  if (!fravaersperioder) return null;

  return (
    <>
      <Heading3>Sykmeldingsperiode</Heading3>
      <p>
        I følge sykmeldingen var den ansatte syk i perioden som er ferdig utfylt. Endre kun perioden dersom den ansatte
        ble helt friskmeldt. Hvis den ansatte er har jobbet gradert i perioden skal du ikke å endre noe.
      </p>

      <FravaerEnkeltAnsattforhold />
    </>
  );
}
