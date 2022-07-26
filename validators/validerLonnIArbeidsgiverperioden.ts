import { LonnIArbeidsgiverperioden } from '../state/state';
import { ValiderResultat } from '../utils/submitInntektsmelding';

export enum LonnIArbeidsgiverperiodenFeilkode {
  LONN_I_ARBEIDSGIVERPERIODEN_MANGLER = 'LONN_I_ARBEIDSGIVERPERIODEN_MANGLER',
  LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE = 'LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE'
}

export default function validerLonnIArbeidsgiverperioden(
  lonnIAP?: { [key: string]: LonnIArbeidsgiverperioden },
  aktiveArbeidsforholdId?: Array<string>
): Array<ValiderResultat> {
  let errorStatus: Array<ValiderResultat> = [];

  if (!aktiveArbeidsforholdId) {
    return [
      {
        code: LonnIArbeidsgiverperiodenFeilkode.LONN_I_ARBEIDSGIVERPERIODEN_MANGLER,
        felt: 'lia-radio-ukjent'
      }
    ];
  }

  if (!lonnIAP) {
    errorStatus = aktiveArbeidsforholdId.map((forholdId) => ({
      code: LonnIArbeidsgiverperiodenFeilkode.LONN_I_ARBEIDSGIVERPERIODEN_MANGLER,
      felt: 'lia-radio-' + forholdId
    }));
  } else {
    aktiveArbeidsforholdId.forEach((forholdId) => {
      if (!lonnIAP[forholdId]) {
        errorStatus.push({
          code: LonnIArbeidsgiverperiodenFeilkode.LONN_I_ARBEIDSGIVERPERIODEN_MANGLER,
          felt: 'lia-radio-' + forholdId
        });
      } else {
        if (
          lonnIAP[forholdId].status === 'Nei' &&
          (!lonnIAP[forholdId].begrunnelse || lonnIAP[forholdId].begrunnelse?.length === 0)
        ) {
          errorStatus.push({
            code: LonnIArbeidsgiverperiodenFeilkode.LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE,
            felt: 'lia-select-' + forholdId
          });
        }
      }
    });
  }

  return errorStatus;
}
