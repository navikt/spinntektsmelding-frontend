import { compareAsc, formatISO9075, parseISO } from 'date-fns';
import { MottattPeriode } from '../state/MottattData';
import { Periode } from '../state/state';
import differenceInBusinessDays from './differenceInBusinessDays';
export interface FravaersPeriode {
  fom: Date;
  tom: Date;
}

export const overlappendePeriode = (ene: Periode, andre: Periode) => {
  if (!ene.tom || !ene.fom || !andre.tom || !andre.fom) return null;
  if (ene.tom < andre.fom || ene.fom > andre.tom) {
    return null;
  }

  const obj: Periode = {
    fom: ene.fom > andre.fom ? andre.fom : ene.fom,
    tom: ene.tom > andre.tom ? ene.tom : andre.tom,
    id: ene.id
  };

  return obj;
};

export const tilstoetendePeriode = (ene: Periode, andre: Periode) => {
  if (ene.tom === andre.tom && ene.fom === andre.fom) {
    return ene;
  }

  if (!ene.fom || !ene.tom || !andre.fom || !andre.tom) return null;

  if (differenceInBusinessDays(andre.fom, ene.tom, { includeStartDate: false, includeEndDate: false }) <= 0) {
    const obj: Periode = {
      fom: ene.fom,
      tom: andre.tom,
      id: ene.id
    };

    return obj;
  }

  return null;
};

const finnBestemmendeFravaersdag = (fravaersperioder: Array<MottattPeriode> | Array<Periode>): string | undefined => {
  if (!fravaersperioder) {
    return undefined;
  }

  const aktivePerioder = fravaersperioder
    // .map((fravaer) => ({ fom: fravaer.fom, tom: fravaer.tom }))
    .map((element) => JSON.stringify(element));

  const sorterteSykemeldingsperioder = finnSorterteUnikePerioder(aktivePerioder);

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

  if (typeof tilstotendeSykemeldingsperioder[tilstotendeSykemeldingsperioder.length - 1].fom === 'string') {
    return tilstotendeSykemeldingsperioder[tilstotendeSykemeldingsperioder.length - 1].fom as unknown as string;
  }

  if (tilstotendeSykemeldingsperioder[tilstotendeSykemeldingsperioder.length - 1].fom !== undefined) {
    return formatISO9075(tilstotendeSykemeldingsperioder[tilstotendeSykemeldingsperioder.length - 1].fom as Date, {
      representation: 'date'
    });
  }
};

export default finnBestemmendeFravaersdag;

export function finnSorterteUnikePerioder(aktivePerioder: string[]) {
  const unikeSykmeldingsperioder: Array<Periode> = finnUnikePerioder(aktivePerioder);

  const sorterteSykemeldingsperioder = [...unikeSykmeldingsperioder].sort((a, b) => {
    return compareAsc(a.fom || new Date(), b.fom || new Date());
  });
  return sorterteSykemeldingsperioder;
}

function finnUnikePerioder(aktivePerioder: string[]): Periode[] {
  return [...new Set([...aktivePerioder])]
    .map((periode) => JSON.parse(periode))
    .map((periode) => {
      if (typeof periode.fom === 'string') {
        return {
          fom: parseISO(periode.fom),
          tom: parseISO(periode.tom),
          id: periode.id
        };
      } else {
        return {
          fom: periode.fom,
          tom: periode.tom,
          id: periode.id
        };
      }
    });
}
