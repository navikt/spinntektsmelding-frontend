import { isValid } from 'date-fns';
import { Periode } from '../state/state';
import { ValiderResultat } from '../utils/useValiderInntektsmelding';

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
      sjekkGyldigFom(periode, feilkoder);
      sjekkGyldigTom(periode, feilkoder);
      sjekkFomFoerTom(periode, feilkoder);
    });
  }

  return feilkoder;
}
function sjekkGyldigFom(periode: Periode, feilkoder: ValiderResultat[]) {
  if (!periode.fom || !isValid(periode.fom)) {
    feilkoder.push({
      felt: `fom-${periode.id}`,
      code: PeriodeFeilkode.MANGLER_FRA
    });
  }
}

function sjekkFomFoerTom(periode: Periode, feilkoder: ValiderResultat[]) {
  if (periode.fom && periode.tom && periode.fom > periode.tom) {
    feilkoder.push({
      felt: `fom-${periode.id}`,
      code: PeriodeFeilkode.TIL_FOR_FRA
    });
  }
}

function sjekkGyldigTom(periode: Periode, feilkoder: ValiderResultat[]) {
  if (!periode.tom || !isValid(periode.tom)) {
    feilkoder.push({
      felt: `tom-${periode.id}`,
      code: PeriodeFeilkode.MANGLER_TIL
    });
  }
}
