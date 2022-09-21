import { format, isValid, parse } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Periode } from '../state/state';
import { ValiderResultat } from '../utils/submitInntektsmelding';

export enum PeriodeFeilkode {
  OK = 'OK',
  MANGLER_PERIODE = 'MANGLER_PERIODE',
  MANGLER_TIL = 'MANGLER_TIL',
  MANGLER_FRA = 'MANGLER_FRA',
  TIL_FOR_FRA = 'TIL_FOR_FRA'
}

export default function validerPeriode(perioder?: Array<Periode>): Array<ValiderResultat> {
  let feilkoder: Array<ValiderResultat> = [];
  if (!perioder || perioder.length < 1) {
    feilkoder.push({
      felt: 'backend',
      code: PeriodeFeilkode.MANGLER_PERIODE
    });
  } else {
    perioder.forEach((periode) => {
      if (!periode.fra || !isValid(periode.fra)) {
        feilkoder.push({
          felt: `fra-${periode.id}`,
          code: PeriodeFeilkode.MANGLER_FRA
        });
      }

      if (!periode.til || !isValid(periode.til)) {
        console.log('periode.til', periode.til); // eslint-disable-line
        feilkoder.push({
          felt: `til-${periode.id}`,
          code: PeriodeFeilkode.MANGLER_TIL
        });
      }

      if (periode.fra && periode.til && periode.fra > periode.til) {
        feilkoder.push({
          felt: `fra-${periode.id}`,
          code: PeriodeFeilkode.TIL_FOR_FRA
        });
      }
    });
  }

  return feilkoder;
}
