import { addDays, differenceInCalendarDays } from 'date-fns';

import {
  finnSammenhengendePeriode,
  joinPerioderMedOverlapp,
  tilstoetendePeriodeManuellJustering
} from './finnBestemmendeFravaersdag';
import { TidPeriode } from '../schema/TidPeriodeSchema';

function finnPeriodeMedAntallDager<T extends TidPeriode>(perioder: Array<T>, antallDager: number) {
  let dagerTotalt = 0;
  const arbPeriode: Array<T> = [];

  perioder.forEach((periode) => {
    if (dagerTotalt < antallDager && periode?.fom && periode?.tom) {
      const dagerTilNaa = differenceInCalendarDays(periode.tom, periode.fom) + dagerTotalt + 1;
      if (dagerTilNaa < antallDager) {
        arbPeriode.push(periode);
      } else {
        arbPeriode.push({
          ...periode,
          fom: periode.fom,
          tom: addDays(periode.fom, antallDager - 1 - dagerTotalt)
        });
      }
      dagerTotalt = dagerTilNaa;
      return;
    }
    return arbPeriode;
  });
  return arbPeriode;
}

function finnArbeidsgiverperiode<T extends TidPeriode>(fravaerPerioder: Array<T>): Array<T> {
  const tilstoetendePerioder = finnSammenhengendePeriode(fravaerPerioder);

  return finnPeriodeMedAntallDager(tilstoetendePerioder, 16);
}

export function finnSammenhengendePeriodeManuellJustering<T extends TidPeriode>(
  sykmeldingsperioder: Array<T>
): Array<T> {
  const { mergedSykmeldingsperioder, tilstoetendeSykmeldingsperioder } = joinPerioderMedOverlapp(sykmeldingsperioder);
  mergedSykmeldingsperioder.forEach((periode) => {
    const aktivPeriode = tilstoetendeSykmeldingsperioder[tilstoetendeSykmeldingsperioder.length - 1];
    const oppdatertPeriode = tilstoetendePeriodeManuellJustering(aktivPeriode, periode);

    if (oppdatertPeriode) {
      tilstoetendeSykmeldingsperioder[tilstoetendeSykmeldingsperioder.length - 1] = oppdatertPeriode;
    } else {
      tilstoetendeSykmeldingsperioder.push(periode);
    }
  });

  return tilstoetendeSykmeldingsperioder;
}

export default finnArbeidsgiverperiode;
