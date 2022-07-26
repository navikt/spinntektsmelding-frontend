import { LonnISykefravaeret, RefusjonskravetOpphoerer } from '../state/state';
import { ValiderResultat } from '../utils/submitInntektsmelding';

export enum LonnUnderSykefravaeretFeilkode {
  LONN_UNDER_SYKEFRAVAERET_MANGLER = 'LONN_UNDER_SYKEFRAVAERET_MANGLER',
  LONN_UNDER_SYKEFRAVAERET_BELOP = 'LONN_UNDER_SYKEFRAVAERET_BELOP',
  LONN_UNDER_SYKEFRAVAERET_SLUTTDATO = 'LONN_UNDER_SYKEFRAVAERET_SLUTTDATO',
  LONN_UNDER_SYKEFRAVAERET_SLUTTDATO_VELG = 'LONN_UNDER_SYKEFRAVAERET_SLUTTDATO_VELG'
}

export default function validerLonnUnderSykefravaeret(
  lonnUS?: { [key: string]: LonnISykefravaeret },
  aktiveArbeidsforholdId?: Array<string>,
  refusjonskravetOpphoerer?: { [key: string]: RefusjonskravetOpphoerer }
): Array<ValiderResultat> {
  let errorStatus: Array<ValiderResultat> = [];

  if (!aktiveArbeidsforholdId) {
    return [
      {
        code: LonnUnderSykefravaeretFeilkode.LONN_UNDER_SYKEFRAVAERET_MANGLER,
        felt: 'lus-radio-ukjent'
      }
    ];
  }

  if (!lonnUS) {
    errorStatus = aktiveArbeidsforholdId.map((forholdId) => ({
      code: LonnUnderSykefravaeretFeilkode.LONN_UNDER_SYKEFRAVAERET_MANGLER,
      felt: 'lus-radio-' + forholdId
    }));
  } else {
    aktiveArbeidsforholdId.forEach((forholdId) => {
      if (!lonnUS[forholdId]) {
        errorStatus.push({
          code: LonnUnderSykefravaeretFeilkode.LONN_UNDER_SYKEFRAVAERET_MANGLER,
          felt: 'lus-radio-' + forholdId
        });
      } else {
        if (lonnUS[forholdId].status === 'Ja') {
          validerBelop(lonnUS, forholdId, errorStatus);

          validerStatus(refusjonskravetOpphoerer, forholdId, errorStatus);
        }
      }
    });
  }

  return errorStatus;
}
function validerStatus(
  refusjonskravetOpphoerer: { [key: string]: RefusjonskravetOpphoerer } | undefined,
  forholdId: string,
  errorStatus: ValiderResultat[]
) {
  if (!refusjonskravetOpphoerer?.[forholdId]?.status) {
    errorStatus.push({
      code: LonnUnderSykefravaeretFeilkode.LONN_UNDER_SYKEFRAVAERET_SLUTTDATO_VELG,
      felt: 'lus-sluttdato-velg-' + forholdId
    });
  } else {
    validerJaStatusMedDato(refusjonskravetOpphoerer, forholdId, errorStatus);
  }
}

function validerJaStatusMedDato(
  refusjonskravetOpphoerer: { [key: string]: RefusjonskravetOpphoerer },
  forholdId: string,
  errorStatus: ValiderResultat[]
) {
  if (refusjonskravetOpphoerer?.[forholdId].status === 'Ja' && !refusjonskravetOpphoerer?.[forholdId].opphorsdato) {
    errorStatus.push({
      code: LonnUnderSykefravaeretFeilkode.LONN_UNDER_SYKEFRAVAERET_SLUTTDATO,
      felt: 'lus-sluttdato-' + forholdId
    });
  }
}

function validerBelop(
  lonnUS: { [key: string]: LonnISykefravaeret },
  forholdId: string,
  errorStatus: ValiderResultat[]
) {
  if (!lonnUS[forholdId].belop) {
    errorStatus.push({
      code: LonnUnderSykefravaeretFeilkode.LONN_UNDER_SYKEFRAVAERET_BELOP,
      felt: 'lus-input-' + forholdId
    });
  }
}
