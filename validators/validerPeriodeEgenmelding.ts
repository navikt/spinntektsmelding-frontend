import { Periode } from '../state/state';
import { ValiderResultat } from '../utils/useValiderInntektsmelding';

export enum PeriodeFeilkode {
  OK = 'OK',
  MANGLER_PERIODE = 'MANGLER_PERIODE',
  MANGLER_TIL = 'MANGLER_TIL',
  MANGLER_FRA = 'MANGLER_FRA',
  TIL_FOR_FRA = 'TIL_FOR_FRA'
}

export default function validerPeriodeEgenmelding(perioder: Array<Periode>): Array<ValiderResultat> {
  let feilkoder: Array<ValiderResultat> = [];
  if (!perioder || perioder.length < 1) {
    feilkoder.push({
      felt: 'backend',
      code: PeriodeFeilkode.MANGLER_PERIODE
    });
  } else {
    perioder.forEach((periode) => {
      if (!periode.fom) {
        feilkoder.push({
          felt: `fom-${periode.id}`,
          code: PeriodeFeilkode.MANGLER_FRA
        });
      }

      if (!periode.tom) {
        feilkoder.push({
          felt: `tom-${periode.id}`,
          code: PeriodeFeilkode.MANGLER_TIL
        });
      }

      if (periode.fom && periode.tom && periode.fom > periode.tom) {
        feilkoder.push({
          felt: `fom-${periode.id}`,
          code: PeriodeFeilkode.TIL_FOR_FRA
        });
      }
    });
  }

  return feilkoder;
}
