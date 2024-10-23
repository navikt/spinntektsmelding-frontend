import { Periode } from '../state/state';
import { ValiderResultat } from '../utils/validerInntektsmelding';

import {
  feilRekkefoelgeFomTom,
  forMangeDagerIPerioden,
  manglerFomMenIkkeTomMedEnRad,
  manglerFomOgIkkeBareEnRad,
  manglerTomMenIkkeFomMedEnRad,
  manglerTomOgIkkeBareEnRad
} from './validerPeriodeFravaer';

export enum PeriodeEgenmeldingFeilkode {
  MANGLER_PERIODE = 'MANGLER_PERIODE'
}

export default function validerPeriodeEgenmelding(perioder: Array<Periode>, prefix: string): Array<ValiderResultat> {
  let feilkoder: Array<ValiderResultat> = [];
  if (!perioder || perioder.length < 1) {
    feilkoder.push({
      felt: 'backend',
      code: PeriodeEgenmeldingFeilkode.MANGLER_PERIODE
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
    });
  }

  return feilkoder;
}
