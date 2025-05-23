import { LonnISykefravaeret } from '../state/state';
import { ValiderResultat } from '../utils/validerInntektsmelding';

export enum LonnUnderSykefravaeretFeilkode {
  LONN_UNDER_SYKEFRAVAERET_MANGLER = 'LONN_UNDER_SYKEFRAVAERET_MANGLER',
  LONN_UNDER_SYKEFRAVAERET_BELOP = 'LONN_UNDER_SYKEFRAVAERET_BELOP',
  LONN_UNDER_SYKEFRAVAERET_SLUTTDATO = 'LONN_UNDER_SYKEFRAVAERET_SLUTTDATO',
  LONN_UNDER_SYKEFRAVAERET_SLUTTDATO_VELG = 'LONN_UNDER_SYKEFRAVAERET_SLUTTDATO_VELG',
  BELOP_OVERSTIGER_BRUTTOINNTEKT = 'BELOP_OVERSTIGER_BRUTTOINNTEKT'
}

export default function validerLonnUnderSykefravaeret(
  refusjon?: LonnISykefravaeret,
  bruttoInntekt?: number
): Array<ValiderResultat> {
  let errorStatus: Array<ValiderResultat> = [];

  if (!refusjon?.status) {
    errorStatus.push({
      code: LonnUnderSykefravaeretFeilkode.LONN_UNDER_SYKEFRAVAERET_MANGLER,
      felt: 'lus-radio'
    });
  } else if (refusjon.status === 'Ja') {
    validerBelop(refusjon, errorStatus);
    validerMaksimaltBelop(refusjon, bruttoInntekt, errorStatus);
  }

  return errorStatus;
}

function validerBelop(refusjon: LonnISykefravaeret, errorStatus: ValiderResultat[]) {
  if (typeof refusjon.beloep === 'undefined' || refusjon.beloep === null) {
    errorStatus.push({
      code: LonnUnderSykefravaeretFeilkode.LONN_UNDER_SYKEFRAVAERET_BELOP,
      felt: 'refusjon.beloepPerMaaned'
    });
  }
}

function validerMaksimaltBelop(
  refusjon: LonnISykefravaeret,
  bruttoInntekt: number | undefined,
  errorStatus: ValiderResultat[]
) {
  if (refusjon.beloep && bruttoInntekt && bruttoInntekt < refusjon.beloep) {
    errorStatus.push({
      code: LonnUnderSykefravaeretFeilkode.BELOP_OVERSTIGER_BRUTTOINNTEKT,
      felt: 'refusjon.beloepPerMaaned'
    });
  }
}
