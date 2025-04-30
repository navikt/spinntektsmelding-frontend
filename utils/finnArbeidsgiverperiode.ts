import { addDays, differenceInCalendarDays } from 'date-fns';

import {
  finnSorterteUnikePerioder,
  overlappendePeriode,
  tilstoetendePeriode,
  tilstoetendePeriodeManuellJustering
} from './finnBestemmendeFravaersdag';
import { tidPeriode } from '../schema/tidPeriode';

function finnPeriodeMedAntallDager<T extends tidPeriode>(perioder: Array<T>, antallDager: number) {
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

function finnArbeidsgiverperiode<T extends tidPeriode>(fravaerPerioder: Array<T>): Array<T> {
  const tilstoetendePerioder = finnSammenhengendePeriode(fravaerPerioder);

  return finnPeriodeMedAntallDager(tilstoetendePerioder, 16);
}

export function finnSammenhengendePeriode<T extends tidPeriode>(fravaersperioder: Array<T>): Array<T> {
  const { mergedSykmeldingsperioder, tilstoetendeSykmeldingsperioder } = joinPerioderMedOverlapp(fravaersperioder);
  mergedSykmeldingsperioder.forEach((periode) => {
    const aktivPeriode = tilstoetendeSykmeldingsperioder[tilstoetendeSykmeldingsperioder.length - 1];
    const oppdatertPeriode = tilstoetendePeriode(aktivPeriode, periode);

    if (oppdatertPeriode) {
      tilstoetendeSykmeldingsperioder[tilstoetendeSykmeldingsperioder.length - 1] = oppdatertPeriode;
    } else {
      tilstoetendeSykmeldingsperioder.push(periode);
    }
  });

  return tilstoetendeSykmeldingsperioder;
}

export function finnSammenhengendePeriodeManuellJustering<T extends tidPeriode>(fravaersperioder: Array<T>): Array<T> {
  const { mergedSykmeldingsperioder, tilstoetendeSykmeldingsperioder } = joinPerioderMedOverlapp(fravaersperioder);
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

function joinPerioderMedOverlapp<T extends tidPeriode>(fravaersperioder: T[]) {
  const sorterteSykmeldingsperioder = finnSorterteUnikePerioder(fravaersperioder);

  const mergedSykmeldingsperioder = [sorterteSykmeldingsperioder[0]];

  sorterteSykmeldingsperioder.forEach((periode) => {
    const aktivPeriode = mergedSykmeldingsperioder[mergedSykmeldingsperioder.length - 1];
    const oppdatertPeriode = overlappendePeriode(aktivPeriode, periode);

    if (oppdatertPeriode) {
      mergedSykmeldingsperioder[mergedSykmeldingsperioder.length - 1] = oppdatertPeriode;
    } else {
      mergedSykmeldingsperioder.push(periode);
    }
  });

  const tilstoetendeSykmeldingsperioder = [mergedSykmeldingsperioder[0]];
  return { mergedSykmeldingsperioder, tilstoetendeSykmeldingsperioder };
}
