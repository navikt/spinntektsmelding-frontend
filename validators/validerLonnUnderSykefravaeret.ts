import { LonnISykefravaeret, RefusjonskravetOpphoerer } from '../state/state';
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
  refusjonskravetOpphoerer?: RefusjonskravetOpphoerer,
  bruttoInntekt?: number,
  innsendingEndring?: boolean
): Array<ValiderResultat> {
  let errorStatus: Array<ValiderResultat> = [];

  if (!refusjon) {
    errorStatus.push({
      code: LonnUnderSykefravaeretFeilkode.LONN_UNDER_SYKEFRAVAERET_MANGLER,
      felt: 'lus-radio'
    });
  } else {
    if (refusjon.status === 'Ja') {
      validerBelop(refusjon, errorStatus);
      validerStatus(refusjonskravetOpphoerer, errorStatus);
      if (!innsendingEndring) {
        validerMaksimaltBelop(refusjon, bruttoInntekt, errorStatus);
      }
    }
  }

  return errorStatus;
}

function validerStatus(refusjonskravetOpphoerer: RefusjonskravetOpphoerer | undefined, errorStatus: ValiderResultat[]) {
  if (!refusjonskravetOpphoerer?.status) {
    errorStatus.push({
      code: LonnUnderSykefravaeretFeilkode.LONN_UNDER_SYKEFRAVAERET_SLUTTDATO_VELG,
      felt: 'lus-sluttdato-velg'
    });
  } else {
    validerJaStatusMedDato(refusjonskravetOpphoerer, errorStatus);
  }
}

function validerJaStatusMedDato(refusjonskravetOpphoerer: RefusjonskravetOpphoerer, errorStatus: ValiderResultat[]) {
  if (refusjonskravetOpphoerer?.status === 'Ja' && !refusjonskravetOpphoerer?.opphoersdato) {
    errorStatus.push({
      code: LonnUnderSykefravaeretFeilkode.LONN_UNDER_SYKEFRAVAERET_SLUTTDATO,
      felt: 'lus-sluttdato'
    });
  }
}

function validerBelop(refusjon: LonnISykefravaeret, errorStatus: ValiderResultat[]) {
  if (typeof refusjon.beloep === 'undefined') {
    errorStatus.push({
      code: LonnUnderSykefravaeretFeilkode.LONN_UNDER_SYKEFRAVAERET_BELOP,
      felt: 'lus-input'
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
      felt: 'lus-input'
    });
  }
}
