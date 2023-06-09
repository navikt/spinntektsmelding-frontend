import { compareAsc, formatISO9075 } from 'date-fns';
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

const finnBestemmendeFravaersdag = (
  fravaersperioder?: Array<Periode>,
  arbeidsgiverperiode?: Array<Periode>
): string | undefined => {
  if (!fravaersperioder || !fravaersperioder?.[0]?.fom) {
    return undefined;
  }

  const sorterteSykemeldingsperioder = finnSorterteUnikePerioder(fravaersperioder);

  const mergedSykemeldingsperioder = [sorterteSykemeldingsperioder[0]];

  sorterteSykemeldingsperioder.forEach((periode, index) => {
    if (index > 0) {
      const aktivPeriode = mergedSykemeldingsperioder[mergedSykemeldingsperioder.length - 1];
      const oppdatertPeriode = overlappendePeriode(aktivPeriode, periode);

      if (oppdatertPeriode) {
        mergedSykemeldingsperioder[mergedSykemeldingsperioder.length - 1] = oppdatertPeriode;
      } else {
        mergedSykemeldingsperioder.push(periode);
      }
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

  const bestemmendeFravaersdagFraFravaer =
    tilstotendeSykemeldingsperioder[tilstotendeSykemeldingsperioder.length - 1].fom !== undefined
      ? tilstotendeSykemeldingsperioder[tilstotendeSykemeldingsperioder.length - 1].fom
      : undefined;

  const bestemmendeFravaersdag = hvemDatoErStorst(
    bestemmendeFravaersdagFraFravaer,
    arbeidsgiverperiode ? arbeidsgiverperiode[0]?.fom : undefined
  )
    ? bestemmendeFravaersdagFraFravaer
    : arbeidsgiverperiode[0]?.fom || undefined;

  if (bestemmendeFravaersdag !== undefined) {
    return formatISO9075(bestemmendeFravaersdag, {
      representation: 'date'
    });
  }
};

export default finnBestemmendeFravaersdag;

export function finnSorterteUnikePerioder(fravaersperioder: Periode[]) {
  const sorterteSykemeldingsperioder = [...fravaersperioder].sort((a, b) => {
    return compareAsc(a.fom || new Date(), b.fom || new Date());
  });

  const unikeSykmeldingsperioder: Array<Periode> = finnUnikePerioder(sorterteSykemeldingsperioder);
  return unikeSykmeldingsperioder;
}

function finnUnikePerioder(aktivePerioder: Array<Periode>): Array<Periode> {
  const perioder: Array<Periode> = [aktivePerioder[0]];

  aktivePerioder.forEach((periode, index) => {
    if (index > 0) {
      if (periode.fom !== perioder[index - 1].fom && periode.tom !== perioder[index - 1].tom) {
        perioder.push(periode);
      }
    }
  });
  return perioder;
}

function hvemDatoErStorst(bestemmende?: Date, arbeidsgiverperiode?: Date): boolean {
  if (!bestemmende) {
    return true;
  }

  if (!arbeidsgiverperiode) {
    return true;
  }
  return bestemmende > arbeidsgiverperiode;
}
