import { addDays, differenceInCalendarDays } from 'date-fns';
import { Periode } from '../state/state';
import {
  finnSorterteUnikePerioder,
  overlappendePeriode,
  tilstoetendePeriode,
  tilstoetendePeriodeManuellJustering
} from './finnBestemmendeFravaersdag';

export const finnPeriodeMedAntallDager = (perioder: Array<Periode>, antallDager: number) => {
  let dagerTotalt = 0;
  const arbPeriode: Array<Periode> = [];

  perioder.forEach((periode) => {
    if (dagerTotalt < antallDager && periode?.fom && periode?.tom) {
      const dagerTilNaa = differenceInCalendarDays(periode.tom, periode.fom) + dagerTotalt + 1;
      if (dagerTilNaa < antallDager) {
        arbPeriode.push(periode);
      } else {
        arbPeriode.push({
          fom: periode.fom,
          tom: addDays(periode.fom, antallDager - 1 - dagerTotalt),
          id: periode.id
        });
      }
      dagerTotalt = dagerTilNaa;
      return;
    }
    return arbPeriode;
  });
  return arbPeriode;
};

const finnArbeidsgiverperiode = (fravaerPerioder: Array<Periode>): Array<Periode> => {
  const tilstotendePerioder = finnSammenhengendePeriode(fravaerPerioder);

  return finnPeriodeMedAntallDager(tilstotendePerioder, 16);
};

export const finnSammenhengendePeriode = (fravaersperioder: Array<Periode>): Array<Periode> => {
  const sorterteSykemeldingsperioder = finnSorterteUnikePerioder(fravaersperioder);

  const mergedSykemeldingsperioder = [sorterteSykemeldingsperioder[0]];

  sorterteSykemeldingsperioder.forEach((periode) => {
    const aktivPeriode = mergedSykemeldingsperioder[mergedSykemeldingsperioder.length - 1];
    const oppdatertPeriode = overlappendePeriode(aktivPeriode, periode);

    if (oppdatertPeriode) {
      mergedSykemeldingsperioder[mergedSykemeldingsperioder.length - 1] = oppdatertPeriode;
    } else {
      mergedSykemeldingsperioder.push(periode);
    }
  });

  const tilstotendeSykemeldingsperioder = [mergedSykemeldingsperioder[0]];
  mergedSykemeldingsperioder.forEach((periode) => {
    const aktivPeriode = tilstotendeSykemeldingsperioder[tilstotendeSykemeldingsperioder.length - 1];
    const oppdatertPeriode = tilstoetendePeriode(aktivPeriode, periode);

    if (oppdatertPeriode) {
      tilstotendeSykemeldingsperioder[tilstotendeSykemeldingsperioder.length - 1] = oppdatertPeriode;
    } else {
      tilstotendeSykemeldingsperioder.push(periode);
    }
  });

  return tilstotendeSykemeldingsperioder;
};

export const finnSammenhengendePeriodeManuellJustering = (fravaersperioder: Array<Periode>): Array<Periode> => {
  const sorterteSykemeldingsperioder = finnSorterteUnikePerioder(fravaersperioder);

  const mergedSykemeldingsperioder = [sorterteSykemeldingsperioder[0]];

  sorterteSykemeldingsperioder.forEach((periode) => {
    const aktivPeriode = mergedSykemeldingsperioder[mergedSykemeldingsperioder.length - 1];
    const oppdatertPeriode = overlappendePeriode(aktivPeriode, periode);

    if (oppdatertPeriode) {
      mergedSykemeldingsperioder[mergedSykemeldingsperioder.length - 1] = oppdatertPeriode;
    } else {
      mergedSykemeldingsperioder.push(periode);
    }
  });

  const tilstotendeSykemeldingsperioder = [mergedSykemeldingsperioder[0]];
  mergedSykemeldingsperioder.forEach((periode) => {
    const aktivPeriode = tilstotendeSykemeldingsperioder[tilstotendeSykemeldingsperioder.length - 1];
    const oppdatertPeriode = tilstoetendePeriodeManuellJustering(aktivPeriode, periode);

    if (oppdatertPeriode) {
      tilstotendeSykemeldingsperioder[tilstotendeSykemeldingsperioder.length - 1] = oppdatertPeriode;
    } else {
      tilstotendeSykemeldingsperioder.push(periode);
    }
  });

  return tilstotendeSykemeldingsperioder;
};

export default finnArbeidsgiverperiode;
