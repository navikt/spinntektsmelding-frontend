import { ValiderResultat } from '../utils/submitInntektsmelding';
import { BruttoinntektFeilkode } from './validerBruttoinntekt';

export default function validerProsentInntekt(
  aktuelleArbeidsforholdId?: Array<string>,
  bruttoInntekt?: number,
  inntektsprosent?: { [key: string]: number }
): Array<ValiderResultat> {
  const valideringstatus: Array<ValiderResultat> = [];

  if (aktuelleArbeidsforholdId && bruttoInntekt && inntektsprosent) {
    const sumInntekt = aktuelleArbeidsforholdId.reduce(
      (previous, current) => previous + (inntektsprosent[current] || 0),
      0
    );

    if (sumInntekt > bruttoInntekt) {
      valideringstatus.push({
        felt: `bruttoinntekt-endringsbelop-${aktuelleArbeidsforholdId[0]}`,
        code: BruttoinntektFeilkode.SUM_LAVERE_ENN_INNTEKT
      });
    }
  }
  return valideringstatus;
}
