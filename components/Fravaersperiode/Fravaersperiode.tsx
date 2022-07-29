import useFravaersperiodeStore from '../../state/useFravaersperiodeStore';
import { IArbeidsforhold } from '../../state/state';
import Heading3 from '../Heading3/Heading3';
import FravaerEnkeltperiode from './FravaerEnkeltperiode';

interface FravaersperiodeProps {
  arbeidsforhold?: Array<IArbeidsforhold>;
}

export default function Fravaersperiode({ arbeidsforhold }: FravaersperiodeProps) {
  const fravaersperiode = useFravaersperiodeStore((state) => state.fravaersperiode);

  if (!arbeidsforhold || !fravaersperiode) return null;

  console.log(arbeidsforhold); // eslint-disable-line
  console.log(fravaersperiode); // eslint-disable-line

  return (
    <>
      <Heading3>Fraværsperiode</Heading3>
      <p>
        I følge sykmeldingen var den ansatte sykmeldt i perioden som er ferdigutfylt her. Endre fraværsperiode dersom
        den ansatte vært på jobb noen av dagene eller om den på annen måte ikke er korrekt. Du skal ikke ta med
        eventuelle egenmeldingsdager i dette steget.
      </p>
      {arbeidsforhold
        .filter((forhold) => forhold.aktiv)
        .map((forhold, forholdIndex) => (
          <FravaerEnkeltperiode
            arbeidsforhold={forhold}
            harFlereArbeidsforhold={arbeidsforhold.length > 1}
            forsteArbeidsforhold={forholdIndex === 0}
            flereEnnToArbeidsforhold={arbeidsforhold.length > 2}
            key={forhold.arbeidsforholdId}
          />
        ))}
    </>
  );
}
