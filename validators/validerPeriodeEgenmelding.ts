import { Periode } from '../state/state';
import { ValiderResultat } from '../utils/useValiderInntektsmelding';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';

export enum PeriodeFeilkode {
  OK = 'OK',
  MANGLER_PERIODE = 'MANGLER_PERIODE',
  MANGLER_TIL = 'MANGLER_TIL',
  MANGLER_FRA = 'MANGLER_FRA',
  TIL_FOR_FRA = 'TIL_FOR_FRA',
  FOR_MANGE_DAGER_MELLOM = 'FOR_MANGE_DAGER_MELLOM',
  FOR_MANGE_DAGER_I_PERIODE = 'FOR_MANGE_DAGER_I_PERIODE'
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

    perioder.forEach((periode, index) => {
      const manglerFomEllerTomMenIkkeBegge = !!periode.tom !== !!periode.fom;
      manglerFomOgIkkeBareEnRad(periode, tomPeriode, feilkoder);

      manglerTomOgIkkeBareEnRad(periode, tomPeriode, feilkoder);

      manglerTomMenIkkeFomMedEnRad(tomPeriode, manglerFomEllerTomMenIkkeBegge, periode, feilkoder);

      manglerFomMenIkkeTomMedEnRad(tomPeriode, manglerFomEllerTomMenIkkeBegge, periode, feilkoder);

      feilRekkefoelgeFomTom(periode, feilkoder);

      if (Math.abs(differenceInCalendarDays(periode.tom as Date, periode.fom as Date)) >= 16) {
        feilkoder.push({
          felt: `egenmeldingsperiode-feil`,
          code: PeriodeFeilkode.FOR_MANGE_DAGER_I_PERIODE
        });
      }

      if (index > 0) {
        if (Math.abs(differenceInCalendarDays(periode.fom as Date, perioder[index - 1].tom as Date)) >= 16) {
          feilkoder.push({
            felt: `egenmeldingsperiode-feil`,
            code: PeriodeFeilkode.FOR_MANGE_DAGER_MELLOM
          });
        }
      }
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
