import { LonnIArbeidsgiverperioden } from '../state/state';
import { ValiderResultat } from '../utils/submitInntektsmelding';

export enum FullLonnIArbeidsgiverPerioden {
  MANGLER_VALG_AV_LONN_I_ARBEIDSGIVERPERIODEN = 'MANGLER_VALG_AV_LONN_I_ARBEIDSGIVERPERIODEN',
  MANGLER_BEGRUNNELSE_LONN_I_ARBEIDSGIVERPERIODEN = 'MANGLER_BEGRUNNELSE_LONN_I_ARBEIDSGIVERPERIODEN'
}

export default function validerFullLonnIArbeidsgiverPerioden(lonn: LonnIArbeidsgiverperioden): Array<ValiderResultat> {
  let feilkoder: Array<ValiderResultat> = [];
  if (!lonn.status) {
    feilkoder.push({
      felt: '',
      code: FullLonnIArbeidsgiverPerioden.MANGLER_VALG_AV_LONN_I_ARBEIDSGIVERPERIODEN
    });
  }

  if (lonn.status === 'Nei' && (!lonn.begrunnelse || lonn.begrunnelse.length === 0)) {
    feilkoder.push({
      felt: '',
      code: FullLonnIArbeidsgiverPerioden.MANGLER_BEGRUNNELSE_LONN_I_ARBEIDSGIVERPERIODEN
    });
  }
  return feilkoder;
}
