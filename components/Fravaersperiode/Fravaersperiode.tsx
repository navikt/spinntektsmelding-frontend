import { IArbeidsforhold, Periode } from '../../state/state';
import Heading3 from '../Heading3/Heading3';
import FravaerEnkeltperiode from './FravaerEnkeltperiode';

interface FravaersperiodeProps {
  perioder: Array<Periode>;
  arbeidsforhold: Array<IArbeidsforhold>;
  sammePeriodeForAlle: boolean;
  setSykemeldingFraDato: (dateValue: string, periodeId: string, arbeidsforholdId: string) => void;
  setSykemeldingTilDato: (dateValue: string, periodeId: string, arbeidsforholdId: string) => void;
  setSammeFravarePaaArbeidsforhold: (event: React.ChangeEvent<HTMLInputElement>, arbeidsforholdId: string) => void;
  clickSlettFravaersperiode: (event: React.MouseEvent<HTMLButtonElement>, periodeId: string) => void;
  clickLeggTilFravaersperiode: (event: React.MouseEvent<HTMLButtonElement>, arbeidsforholdId: string) => void;
  clickTilbakestillFravaersperiode: (event: React.MouseEvent<HTMLButtonElement>) => void;
  clickEndreFravaersperiode: (event: React.MouseEvent<HTMLButtonElement>, arbeidsforholdId: string) => void;
}

export default function Fravaersperiode({
  perioder,
  arbeidsforhold,
  sammePeriodeForAlle,
  setSykemeldingFraDato,
  setSykemeldingTilDato,
  clickSlettFravaersperiode,
  clickLeggTilFravaersperiode,
  clickTilbakestillFravaersperiode,
  setSammeFravarePaaArbeidsforhold,
  clickEndreFravaersperiode
}: FravaersperiodeProps) {
  if (!arbeidsforhold) return null;

  console.log(arbeidsforhold); // eslint-disable-line
  console.log(perioder); // eslint-disable-line

  return (
    <>
      <Heading3>Fraværsperiode</Heading3>
      <p>
        I følge sykmeldingen var den ansatte sykmeldt i perioden som er ferdigutfylt her. Endre fraværsperiode dersom
        den ansatte vært på jobb noen av dagene eller om den på annen måte ikke er korrekt. Du skal ikke ta med
        eventuelle egenmeldingsdager i dette steget.
      </p>
      {arbeidsforhold.map((forhold, forholdIndex) => (
        <FravaerEnkeltperiode
          perioder={perioder[forhold.arbeidsforholdId]}
          arbeidsforhold={forhold}
          setSykemeldingFraDato={setSykemeldingFraDato}
          setSykemeldingTilDato={setSykemeldingTilDato}
          clickLeggTilFravaersperiode={clickLeggTilFravaersperiode}
          clickSlettFravaersperiode={clickSlettFravaersperiode}
          clickTilbakestillFravaersperiode={clickTilbakestillFravaersperiode}
          harFlereArbeidsforhold={arbeidsforhold.length > 1}
          forsteArbeidsforhold={forholdIndex === 0}
          flereEnnToArbeidsforhold={arbeidsforhold.length > 2}
          setSammeFravarePaaArbeidsforhold={setSammeFravarePaaArbeidsforhold}
          clickEndreFravaersperiode={clickEndreFravaersperiode}
          sammePeriodeForAlle={sammePeriodeForAlle}
          key={forhold.arbeidsforholdId}
        />
      ))}
    </>
  );
}
