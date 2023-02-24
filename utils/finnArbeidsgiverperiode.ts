import { addDays, differenceInCalendarDays } from 'date-fns';
import { Periode } from '../state/state';
import { finnSorterteUnikePerioder, overlappendePeriode, tilstoetendePeriode } from './finnBestemmendeFravaersdag';

const finn16dager = (perioder: Array<Periode>) => {
  let dagerTotalt = 0;
  const arbPeriode: Array<Periode> = [];

  perioder.forEach((periode) => {
    if (dagerTotalt < 15) {
      const dagerTilNaa = differenceInCalendarDays(periode.tom!, periode.fom!) + dagerTotalt;
      dagerTotalt = dagerTilNaa;
      if (dagerTilNaa < 15) {
        arbPeriode.push(periode);
      } else {
        arbPeriode.push({
          fom: periode.fom,
          tom: addDays(periode.fom!, 15 - (dagerTotalt - dagerTilNaa)),
          id: periode.id
        });
      }
      return;
    }
    return arbPeriode;
  });
  return arbPeriode;
};

const finnArbeidsgiverperiode = (fravaersperioder: Array<Periode>): Array<Periode> => {
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

  return finn16dager(tilstotendeSykemeldingsperioder);
};

export default finnArbeidsgiverperiode;
