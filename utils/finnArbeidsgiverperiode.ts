import { addDays, compareAsc, differenceInCalendarDays, parseISO } from 'date-fns';
import { Periode } from '../state/state';
import { overlappendePeriode, tilstoetendePeriode } from './finnBestemmendeFravaersdag';

const finn16dager = (perioder: Array<Periode>) => {
  let dagerTotalt = 0;
  const arbPeriode: Array<Periode> = [];
  perioder.forEach((periode) => {
    if (dagerTotalt < 15) {
      const dagerTilNaa = differenceInCalendarDays(periode.tom as Date, periode.fom as Date) + dagerTotalt;
      if (dagerTilNaa < 15) {
        arbPeriode.push(periode);
      } else {
        arbPeriode.push({ fom: periode.fom, tom: addDays(periode.fom as Date, 15 - dagerTotalt), id: periode.id });
      }
      return;
    }
    return arbPeriode;
  });
  return arbPeriode;
};

const finnArbeidsgiverperiode = (fravaersperioder: Array<Periode>): Array<Periode> => {
  const aktivePerioder = fravaersperioder
    .map((fravaer) => ({ fom: fravaer.fom, tom: fravaer.tom }))
    .map((element) => JSON.stringify(element));

  const unikeSykmeldingsperioder: Array<Periode> = [...new Set([...aktivePerioder])]
    .map((periode) => JSON.parse(periode))
    .map((periode) => ({
      fom: parseISO(periode.fom),
      tom: parseISO(periode.tom),
      id: periode.id
    }));

  const sorterteSykemeldingsperioder = [...unikeSykmeldingsperioder].sort((a, b) => {
    return compareAsc(a.fom || new Date(), b.fom || new Date());
  });

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

  return finn16dager(tilstotendeSykemeldingsperioder);
};

export default finnArbeidsgiverperiode;
