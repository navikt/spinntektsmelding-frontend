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

export default function validerPeriodeEgenmelding(perioder: Array<Periode>, prefix: string): Array<ValiderResultat> {
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
      manglerFomOgIkkeBareEnRad(periode, tomPeriode, feilkoder, prefix);

      manglerTomOgIkkeBareEnRad(periode, tomPeriode, feilkoder, prefix);

      manglerTomMenIkkeFomMedEnRad(tomPeriode, manglerFomEllerTomMenIkkeBegge, periode, feilkoder, prefix);

      manglerFomMenIkkeTomMedEnRad(tomPeriode, manglerFomEllerTomMenIkkeBegge, periode, feilkoder, prefix);

      feilRekkefoelgeFomTom(periode, feilkoder, prefix);

      forMangeDagerIPerioden(periode, feilkoder, prefix);

      if (index > 0) {
        if (Math.abs(differenceInCalendarDays(periode.fom as Date, perioder[index - 1].tom as Date)) >= 16) {
          feilkoder.push({
            felt: `${prefix}-feil`,
            code: PeriodeFeilkode.FOR_MANGE_DAGER_MELLOM
          });
        }
      }
    });
  }

  return feilkoder;
}
function forMangeDagerIPerioden(periode: Periode, feilkoder: ValiderResultat[], prefix: string) {
  if (Math.abs(differenceInCalendarDays(periode.tom as Date, periode.fom as Date)) >= 16) {
    feilkoder.push({
      felt: `${prefix}-feil`,
      code: PeriodeFeilkode.FOR_MANGE_DAGER_I_PERIODE
    });
  }
}

function feilRekkefoelgeFomTom(periode: Periode, feilkoder: ValiderResultat[], prefix: string) {
  if (periode.fom && periode.tom && periode.fom > periode.tom) {
    feilkoder.push({
      felt: `${prefix}-fom-${periode.id}`,
      code: PeriodeFeilkode.TIL_FOR_FRA
    });
  }
}

function manglerFomMenIkkeTomMedEnRad(
  tomPeriode: boolean,
  manglerFomEllerTomMenIkkeBegge: boolean,
  periode: Periode,
  feilkoder: ValiderResultat[],
  prefix: string
) {
  if (tomPeriode && manglerFomEllerTomMenIkkeBegge && !periode.fom) {
    feilkoder.push({
      felt: `${prefix}-fom-${periode.id}`,
      code: PeriodeFeilkode.MANGLER_FRA
    });
  }
}

function manglerTomMenIkkeFomMedEnRad(
  tomPeriode: boolean,
  manglerFomEllerTomMenIkkeBegge: boolean,
  periode: Periode,
  feilkoder: ValiderResultat[],
  prefix: string
) {
  if (tomPeriode && manglerFomEllerTomMenIkkeBegge && !periode.tom) {
    feilkoder.push({
      felt: `${prefix}-tom-${periode.id}`,
      code: PeriodeFeilkode.MANGLER_TIL
    });
  }
}

function manglerTomOgIkkeBareEnRad(
  periode: Periode,
  tomPeriode: boolean,
  feilkoder: ValiderResultat[],
  prefix: string
) {
  if (!periode.tom && !tomPeriode) {
    feilkoder.push({
      felt: `${prefix}-tom-${periode.id}`,
      code: PeriodeFeilkode.MANGLER_TIL
    });
  }
}

function manglerFomOgIkkeBareEnRad(
  periode: Periode,
  tomPeriode: boolean,
  feilkoder: ValiderResultat[],
  prefix: string
) {
  if (!periode.fom && !tomPeriode) {
    feilkoder.push({
      felt: `${prefix}-fom-${periode.id}`,
      code: PeriodeFeilkode.MANGLER_FRA
    });
  }
}
