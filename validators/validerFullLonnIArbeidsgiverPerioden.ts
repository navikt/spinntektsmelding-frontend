import { LonnIArbeidsgiverperioden } from '../state/state';
import { ValiderResultat } from '../utils/validerInntektsmelding';

export enum FullLonnIArbeidsgiverPerioden {
  MANGLER_VALG_AV_LONN_I_ARBEIDSGIVERPERIODEN = 'MANGLER_VALG_AV_LONN_I_ARBEIDSGIVERPERIODEN',
  MANGLER_BEGRUNNELSE_LONN_I_ARBEIDSGIVERPERIODEN = 'MANGLER_BEGRUNNELSE_LONN_I_ARBEIDSGIVERPERIODEN'
}

export default function validerFullLonnIArbeidsgiverPerioden(lonn: LonnIArbeidsgiverperioden): Array<ValiderResultat> {
  const feilkoder: Array<ValiderResultat> = [];
  if (!lonn.status) {
    feilkoder.push({
      felt: '',
      code: FullLonnIArbeidsgiverPerioden.MANGLER_VALG_AV_LONN_I_ARBEIDSGIVERPERIODEN,
      text: 'Valg av lønn i arbeidsgiverperioden må fylles ut'
    });
  }

  if (lonn.status === 'Nei' && (!lonn.begrunnelse || lonn.begrunnelse.length === 0)) {
    feilkoder.push({
      felt: 'agp.redusertLoennIAgp.begrunnelse',
      code: FullLonnIArbeidsgiverPerioden.MANGLER_BEGRUNNELSE_LONN_I_ARBEIDSGIVERPERIODEN,
      text: 'Begrunnelse for redusert utbetaling i arbeidsgiverperioden må fylles ut'
    });
  }

  if (lonn.status === 'Nei' && !lonn.utbetalt) {
    feilkoder.push({
      felt: 'agp.redusertLoennIAgp.beloep',
      code: FullLonnIArbeidsgiverPerioden.MANGLER_BEGRUNNELSE_LONN_I_ARBEIDSGIVERPERIODEN,
      text: 'Beløp utbetalt i arbeidsgiverperioden må fylles ut.'
    });
  }
  return feilkoder;
}
