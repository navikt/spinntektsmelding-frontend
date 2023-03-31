import { LonnISykefravaeret, RefusjonskravetOpphoerer } from '../state/state';
import { ValiderResultat } from '../utils/useValiderInntektsmelding';

export enum LonnUnderSykefravaeretFeilkode {
  LONN_UNDER_SYKEFRAVAERET_MANGLER = 'LONN_UNDER_SYKEFRAVAERET_MANGLER',
  LONN_UNDER_SYKEFRAVAERET_BELOP = 'LONN_UNDER_SYKEFRAVAERET_BELOP',
  LONN_UNDER_SYKEFRAVAERET_SLUTTDATO = 'LONN_UNDER_SYKEFRAVAERET_SLUTTDATO',
  LONN_UNDER_SYKEFRAVAERET_SLUTTDATO_VELG = 'LONN_UNDER_SYKEFRAVAERET_SLUTTDATO_VELG'
}

export default function validerLonnUnderSykefravaeret(
  lonnUS?: LonnISykefravaeret,
  refusjonskravetOpphoerer?: RefusjonskravetOpphoerer
): Array<ValiderResultat> {
  let errorStatus: Array<ValiderResultat> = [];

  if (!lonnUS) {
    errorStatus.push({
      code: LonnUnderSykefravaeretFeilkode.LONN_UNDER_SYKEFRAVAERET_MANGLER,
      felt: 'lus-radio'
    });
  } else {
    if (lonnUS.status === 'Ja') {
      validerBelop(lonnUS, errorStatus);
      validerStatus(refusjonskravetOpphoerer, errorStatus);
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
  if (refusjonskravetOpphoerer?.status === 'Ja' && !refusjonskravetOpphoerer?.opphorsdato) {
    errorStatus.push({
      code: LonnUnderSykefravaeretFeilkode.LONN_UNDER_SYKEFRAVAERET_SLUTTDATO,
      felt: 'lus-sluttdato'
    });
  }
}

function validerBelop(lonnUS: LonnISykefravaeret, errorStatus: ValiderResultat[]) {
  if (typeof lonnUS.belop === 'undefined') {
    errorStatus.push({
      code: LonnUnderSykefravaeretFeilkode.LONN_UNDER_SYKEFRAVAERET_BELOP,
      felt: 'lus-input'
    });
  }
}
