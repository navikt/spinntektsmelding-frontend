import { LonnIArbeidsgiverperioden } from '../state/state';
import { ValiderResultat } from '../utils/useValiderInntektsmelding';

export enum LonnIArbeidsgiverperiodenFeilkode {
  LONN_I_ARBEIDSGIVERPERIODEN_MANGLER = 'LONN_I_ARBEIDSGIVERPERIODEN_MANGLER',
  LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE = 'LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE',
  LONN_I_ARBEIDSGIVERPERIODEN_BELOP = 'LONN_I_ARBEIDSGIVERPERIODEN_BELOP'
}

export default function validerLonnIArbeidsgiverperioden(lonnIAP?: LonnIArbeidsgiverperioden): Array<ValiderResultat> {
  let errorStatus: Array<ValiderResultat> = [];

  if (!lonnIAP) {
    errorStatus.push({
      code: LonnIArbeidsgiverperiodenFeilkode.LONN_I_ARBEIDSGIVERPERIODEN_MANGLER,
      felt: 'lia-radio'
    });
  } else {
    if (lonnIAP.status === 'Nei' && (!lonnIAP.begrunnelse || lonnIAP.begrunnelse?.length === 0)) {
      errorStatus.push({
        code: LonnIArbeidsgiverperiodenFeilkode.LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE,
        felt: 'lia-select'
      });
    }

    if (lonnIAP.status === 'Nei' && (!lonnIAP.utbetalt || lonnIAP.utbetalt <= 0)) {
      errorStatus.push({
        code: LonnIArbeidsgiverperiodenFeilkode.LONN_I_ARBEIDSGIVERPERIODEN_BELOP,
        felt: 'lus-uua-input'
      });
    }
  }

  return errorStatus;
}
