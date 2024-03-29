import { isValid } from 'date-fns';
import { Periode } from '../state/state';
import { ValiderResultat } from '../utils/validerInntektsmelding';

export enum PeriodeFeilkode {
  MANGLER_PERIODE = 'MANGLER_PERIODE',
  MANGLER_TIL = 'MANGLER_TIL',
  MANGLER_FRA = 'MANGLER_FRA',
  TIL_FOR_FRA = 'TIL_FOR_FRA'
}

export default function validerPeriode(perioder?: Array<Periode>, prefix?: string): Array<ValiderResultat> {
  let feilkoder: Array<ValiderResultat> = [];

  prefix = prefix ? `${prefix}-` : '';

  if (!perioder || perioder.length < 1) {
    feilkoder.push({
      felt: 'backend',
      code: PeriodeFeilkode.MANGLER_PERIODE
    });
  } else {
    perioder.forEach((periode) => {
      sjekkGyldigFom(periode, feilkoder, prefix);
      sjekkGyldigTom(periode, feilkoder, prefix);
      sjekkFomFoerTom(periode, feilkoder, prefix);
    });
  }

  return feilkoder;
}
function sjekkGyldigFom(periode: Periode, feilkoder: ValiderResultat[], prefix?: string) {
  if (!periode.fom || !isValid(periode.fom)) {
    feilkoder.push({
      felt: `${prefix}fom-${periode.id}`,
      code: PeriodeFeilkode.MANGLER_FRA
    });
  }
}

function sjekkFomFoerTom(periode: Periode, feilkoder: ValiderResultat[], prefix?: string) {
  if (periode.fom && periode.tom && periode.fom > periode.tom) {
    feilkoder.push({
      felt: `${prefix}fom-${periode.id}`,
      code: PeriodeFeilkode.TIL_FOR_FRA
    });
  }
}

function sjekkGyldigTom(periode: Periode, feilkoder: ValiderResultat[], prefix?: string) {
  if (!periode.tom || !isValid(periode.tom)) {
    feilkoder.push({
      felt: `${prefix}tom-${periode.id}`,
      code: PeriodeFeilkode.MANGLER_TIL
    });
  }
}
