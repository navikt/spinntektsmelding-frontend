import { LonnISykefravaeret } from '../state/state';
import { ValiderResultat } from '../utils/validerInntektsmelding';

export enum FullLonnISykefravaeret {
  MANGLER_VALG_AV_LONN_I_SYKEFRAVAERET = 'MANGLER_VALG_AV_LONN_I_SYKEFRAVAERET',
  MANGLER_BELOP_LONN_I_SYKEFRAVAERET = 'MANGLER_BELOP_LONN_I_SYKEFRAVAERET'
}

export default function validerLonnISykefravaeret(lonn: LonnISykefravaeret): Array<ValiderResultat> {
  const feilkoder: Array<ValiderResultat> = [];
  if (!lonn) {
    feilkoder.push({
      code: FullLonnISykefravaeret.MANGLER_VALG_AV_LONN_I_SYKEFRAVAERET,
      felt: ''
    });
    return feilkoder;
  }

  if (!lonn.status) {
    feilkoder.push({
      felt: '',
      code: FullLonnISykefravaeret.MANGLER_VALG_AV_LONN_I_SYKEFRAVAERET
    });
  }

  if (lonn.status === 'Ja' && (!lonn.beloep || lonn.beloep === 0)) {
    feilkoder.push({
      felt: '',
      code: FullLonnISykefravaeret.MANGLER_BELOP_LONN_I_SYKEFRAVAERET
    });
  }
  return feilkoder;
}
