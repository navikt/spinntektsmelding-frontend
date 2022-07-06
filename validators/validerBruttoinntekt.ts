import { Inntekt } from '../state/state';
import { ValiderResultat } from '../utils/submitInntektsmelding';

export enum BruttoinntektFeilkode {
  OK = 'OK',
  BRUTTOINNTEKT_MANGLER = 'BRUTTOINNTEKT_MANGLER',
  INNTEKT_MANGLER = 'INNTEKT_MANGLER',
  ENDRINGSAARSAK_MANGLER = 'ENDRINGSAARSAK_MANGLER',
  IKKE_BEKREFTET = 'IKKE_BEKREFTET'
}

export default function validerBruttoinntekt(bruttoinntekt?: Inntekt): Array<ValiderResultat> {
  const valideringstatus: Array<ValiderResultat> = [];

  if (!bruttoinntekt) {
    valideringstatus.push({
      felt: 'bruttoinntekt',
      code: BruttoinntektFeilkode.INNTEKT_MANGLER
    });
  } else {
    if (!bruttoinntekt.bekreftet) {
      valideringstatus.push({
        felt: 'bruttoinntektbekreft',
        code: BruttoinntektFeilkode.IKKE_BEKREFTET
      });
    }

    if (!bruttoinntekt.bruttoInntekt) {
      valideringstatus.push({
        felt: 'bruttoinntekt',
        code: BruttoinntektFeilkode.BRUTTOINNTEKT_MANGLER
      });
    }

    if (!bruttoinntekt.endringsaarsak || bruttoinntekt.endringsaarsak === '') {
      valideringstatus.push({
        felt: 'bruttoinntekt',
        code: BruttoinntektFeilkode.ENDRINGSAARSAK_MANGLER
      });
    }
  }

  return valideringstatus;
}
