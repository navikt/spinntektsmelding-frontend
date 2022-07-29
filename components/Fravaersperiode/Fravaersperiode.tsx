import useFravaersperiodeStore from '../../state/useFravaersperiodeStore';
import { IArbeidsforhold } from '../../state/state';
import Heading3 from '../Heading3/Heading3';
import FravaerEnkeltAnsattforhold from './FravaerEnkeltAnsattforhold';
import useArbeidsforholdStore from '../../state/useArbeidsforholdStore';

export default function Fravaersperiode() {
  const fravaersperiode = useFravaersperiodeStore((state) => state.fravaersperiode);
  const arbeidsforhold: Array<IArbeidsforhold> | undefined = useArbeidsforholdStore((state) => state.arbeidsforhold);
  const aktiveArbeidsforhold = useArbeidsforholdStore((state) => state.aktiveArbeidsforhold);
  if (!arbeidsforhold || !fravaersperiode) return null;

  return (
    <>
      <Heading3>Fraværsperiode</Heading3>
      <p>
        I følge sykmeldingen var den ansatte sykmeldt i perioden som er ferdigutfylt her. Endre fraværsperiode dersom
        den ansatte vært på jobb noen av dagene eller om den på annen måte ikke er korrekt. Du skal ikke ta med
        eventuelle egenmeldingsdager i dette steget.
      </p>
      {aktiveArbeidsforhold().map((forhold: IArbeidsforhold, forholdIndex: number) => (
        <FravaerEnkeltAnsattforhold
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
