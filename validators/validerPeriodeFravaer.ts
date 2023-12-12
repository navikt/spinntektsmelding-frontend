import { Periode } from '../state/state';
import { ValiderResultat } from '../utils/useValiderInntektsmelding';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';

export enum PeriodeFravaerFeilkode {
  OK = 'OK',
  MANGLER_PERIODE = 'MANGLER_PERIODE',
  MANGLER_TIL = 'MANGLER_TIL',
  MANGLER_FRA = 'MANGLER_FRA',
  TIL_FOR_FRA = 'TIL_FOR_FRA',
  FOR_MANGE_DAGER_MELLOM = 'FOR_MANGE_DAGER_MELLOM',
  FOR_MANGE_DAGER_I_PERIODE = 'FOR_MANGE_DAGER_I_PERIODE'
}

export default function validerPeriodeFravaer(perioder: Array<Periode>, prefix: string): Array<ValiderResultat> {
  let feilkoder: Array<ValiderResultat> = [];
  if (!perioder || perioder.length < 1) {
    feilkoder.push({
      felt: 'backend',
      code: PeriodeFravaerFeilkode.MANGLER_PERIODE
    });
  } else {
    const tomPeriode = perioder.length === 1;

    perioder.forEach((periode, index) => {
      const manglerFomEllerTomMenIkkeBegge = !!periode.tom !== !!periode.fom;
      manglerFomOgIkkeBareEnRad(periode, tomPeriode, feilkoder, prefix, index);

      manglerTomOgIkkeBareEnRad(periode, tomPeriode, feilkoder, prefix, index);

      manglerTomMenIkkeFomMedEnRad(tomPeriode, manglerFomEllerTomMenIkkeBegge, periode, feilkoder, prefix, index);

      manglerFomMenIkkeTomMedEnRad(tomPeriode, manglerFomEllerTomMenIkkeBegge, periode, feilkoder, prefix, index);

      feilRekkefoelgeFomTom(periode, feilkoder, prefix, index);

      forMangeDagerIPerioden(periode, feilkoder, prefix);

      if (index > 0) {
        if (Math.abs(differenceInCalendarDays(periode.fom as Date, perioder[index - 1].tom as Date)) > 16) {
          feilkoder.push({
            felt: `${prefix}-feil`,
            code: PeriodeFravaerFeilkode.FOR_MANGE_DAGER_MELLOM
          });
        }
      }
    });
  }

  return feilkoder;
}
export function forMangeDagerIPerioden(periode: Periode, feilkoder: ValiderResultat[], prefix: string) {
  if (Math.abs(differenceInCalendarDays(periode.tom as Date, periode.fom as Date)) >= 16) {
    feilkoder.push({
      felt: `${prefix}-feil`,
      code: PeriodeFravaerFeilkode.FOR_MANGE_DAGER_I_PERIODE
    });
  }
}

export function feilRekkefoelgeFomTom(periode: Periode, feilkoder: ValiderResultat[], prefix: string, index: number) {
  if (periode.fom && periode.tom && periode.fom > periode.tom) {
    feilkoder.push({
      felt: `${prefix}[${index}].fom`,
      code: PeriodeFravaerFeilkode.TIL_FOR_FRA
    });
  }
}

export function manglerFomMenIkkeTomMedEnRad(
  tomPeriode: boolean,
  manglerFomEllerTomMenIkkeBegge: boolean,
  periode: Periode,
  feilkoder: ValiderResultat[],
  prefix: string,
  index: number
) {
  if (tomPeriode && manglerFomEllerTomMenIkkeBegge && !periode.fom) {
    feilkoder.push({
      felt: `${prefix}[${index}].fom`,
      code: PeriodeFravaerFeilkode.MANGLER_FRA
    });
  }
}

export function manglerTomMenIkkeFomMedEnRad(
  tomPeriode: boolean,
  manglerFomEllerTomMenIkkeBegge: boolean,
  periode: Periode,
  feilkoder: ValiderResultat[],
  prefix: string,
  index: number
) {
  if (tomPeriode && manglerFomEllerTomMenIkkeBegge && !periode.tom) {
    feilkoder.push({
      felt: `${prefix}[${index}].tom`,
      code: PeriodeFravaerFeilkode.MANGLER_TIL
    });
  }
}

export function manglerTomOgIkkeBareEnRad(
  periode: Periode,
  tomPeriode: boolean,
  feilkoder: ValiderResultat[],
  prefix: string,
  index: number
) {
  if (!periode.tom && !tomPeriode) {
    feilkoder.push({
      felt: `${prefix}[${index}].tom`,
      code: PeriodeFravaerFeilkode.MANGLER_TIL
    });
  }
}

export function manglerFomOgIkkeBareEnRad(
  periode: Periode,
  tomPeriode: boolean,
  feilkoder: ValiderResultat[],
  prefix: string,
  index: number
) {
  if (!periode.fom && !tomPeriode) {
    feilkoder.push({
      felt: `${prefix}[${index}].fom`,
      code: PeriodeFravaerFeilkode.MANGLER_FRA
    });
  }
}
