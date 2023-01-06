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
    const tomPeriode = perioder.length === 1;

    perioder.forEach((periode) => {
      const manglerFomEllerTomMenIkkeBegge = !!periode.tom !== !!periode.fom;
      manglerFomOgIkkeBareEnRad(periode, tomPeriode, feilkoder);

      manglerTomOgIkkeBareEnRad(periode, tomPeriode, feilkoder);

      manglerTomMenIkkeFomMedEnRad(tomPeriode, manglerFomEllerTomMenIkkeBegge, periode, feilkoder);

      manglerFomMenIkkeTomMedEnRad(tomPeriode, manglerFomEllerTomMenIkkeBegge, periode, feilkoder);

      feilRekkefoelgeFomTom(periode, feilkoder);
    });
  }

  return feilkoder;
}
function feilRekkefoelgeFomTom(periode: Periode, feilkoder: ValiderResultat[]) {
  if (periode.fom && periode.tom && periode.fom > periode.tom) {
    feilkoder.push({
      felt: `fom-${periode.id}`,
      code: PeriodeFeilkode.TIL_FOR_FRA
    });
  }
}

function manglerFomMenIkkeTomMedEnRad(
  tomPeriode: boolean,
  manglerFomEllerTomMenIkkeBegge: boolean,
  periode: Periode,
  feilkoder: ValiderResultat[]
) {
  if (tomPeriode && manglerFomEllerTomMenIkkeBegge && !periode.fom) {
    feilkoder.push({
      felt: `fom-${periode.id}`,
      code: PeriodeFeilkode.MANGLER_FRA
    });
  }
}

function manglerTomMenIkkeFomMedEnRad(
  tomPeriode: boolean,
  manglerFomEllerTomMenIkkeBegge: boolean,
  periode: Periode,
  feilkoder: ValiderResultat[]
) {
  if (tomPeriode && manglerFomEllerTomMenIkkeBegge && !periode.tom) {
    feilkoder.push({
      felt: `tom-${periode.id}`,
      code: PeriodeFeilkode.MANGLER_TIL
    });
  }
}

function manglerTomOgIkkeBareEnRad(periode: Periode, tomPeriode: boolean, feilkoder: ValiderResultat[]) {
  if (!periode.tom && !tomPeriode) {
    feilkoder.push({
      felt: `tom-${periode.id}`,
      code: PeriodeFeilkode.MANGLER_TIL
    });
  }
}

function manglerFomOgIkkeBareEnRad(periode: Periode, tomPeriode: boolean, feilkoder: ValiderResultat[]) {
  if (!periode.fom && !tomPeriode) {
    feilkoder.push({
      felt: `fom-${periode.id}`,
      code: PeriodeFeilkode.MANGLER_FRA
    });
  }
}
