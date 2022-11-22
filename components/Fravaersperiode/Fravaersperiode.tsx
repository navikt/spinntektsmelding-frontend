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
        I følge sykmeldingen var den ansatte sykmeldt i perioden som er ferdigutfylt her. Endre fraværsperiode dersom
        den ansatte vært på jobb noen av dagene eller om den på annen måte ikke er korrekt. Du skal ikke ta med
        eventuelle egenmeldingsdager i dette steget.
      </p>

      <FravaerEnkeltAnsattforhold />
    </>
  );
}
