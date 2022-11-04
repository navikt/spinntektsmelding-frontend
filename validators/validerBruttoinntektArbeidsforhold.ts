import { IArbeidsforhold } from '../state/state';
import { ValiderResultat } from '../utils/submitInntektsmelding';

export enum BruttoinntektArbeidsforholdFeilkode {
  OK = 'OK',
  BRUTTOINNTEKT_ARBEIDSFORHOLD_MANGLER = 'BRUTTOINNTEKT_ARBEIDSFORHOLD_MANGLER',
  INNTEKT_MANGLER = 'INNTEKT_MANGLER',
  ENDRINGSAARSAK_MANGLER = 'ENDRINGSAARSAK_MANGLER',
  IKKE_BEKREFTET = 'IKKE_BEKREFTET',
  SUM_LAVERE_ENN_INNTEKT = 'SUM_LAVERE_ENN_INNTEKT'
}

// `bruttoinntekt-endringsbelop-${forhold.arbeidsforholdId}`

export default function validerBruttoinntektArbeidsforhold(
  arbeidsforhold?: Array<IArbeidsforhold>,
  inntektsliste?: {
    [key: string]: number;
  },
  bruttoinntekt: number = 0
): Array<ValiderResultat> {
  const valideringstatus: Array<ValiderResultat> = [];

  if (!arbeidsforhold) {
    return valideringstatus;
  }

  const harFlereArbeidsforhold = arbeidsforhold.length > 1;

  if (!harFlereArbeidsforhold) {
    return [];
  }

  if (harFlereArbeidsforhold && !inntektsliste) {
    console.log('heia', inntektsliste);
    valideringstatus.push({
      felt: `bruttoinntekt-endringsbelop-${arbeidsforhold[0].arbeidsforholdId}`,
      code: BruttoinntektArbeidsforholdFeilkode.BRUTTOINNTEKT_ARBEIDSFORHOLD_MANGLER
    });
  }
  if (harFlereArbeidsforhold && inntektsliste && inntektsliste.length < 1) {
    console.log('neia', inntektsliste);

    valideringstatus.push({
      felt: `bruttoinntekt-endringsbelop-${arbeidsforhold[0].arbeidsforholdId}`,
      code: BruttoinntektArbeidsforholdFeilkode.BRUTTOINNTEKT_ARBEIDSFORHOLD_MANGLER
    });
  }

  if (inntektsliste) {
    const totalInntekt = Object.values(inntektsliste).reduce(
      (previousValue: number, currentValue: number) => previousValue + currentValue,
      0
    );

    if (totalInntekt > bruttoinntekt) {
      valideringstatus.push({
        felt: `bruttoinntekt-endringsbelop-${arbeidsforhold[0].arbeidsforholdId}`,
        code: BruttoinntektArbeidsforholdFeilkode.SUM_LAVERE_ENN_INNTEKT
      });
    }
  }
  return valideringstatus;
}
