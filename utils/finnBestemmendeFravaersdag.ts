import { compareAsc, formatISO9075 } from 'date-fns';
import { Periode } from '../state/state';
import differenceInBusinessDays from './differenceInBusinessDays';
import parseIsoDate from './parseIsoDate';

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
  arbeidsgiverperiode?: Array<Periode>,
  forespurtBestemmendeFraværsdag?: string | Date
): string | undefined => {
  if (!fravaersperioder || !fravaersperioder?.[0]?.fom) {
    return undefined;
  }

  if (typeof forespurtBestemmendeFraværsdag === 'string') {
    forespurtBestemmendeFraværsdag = parseIsoDate(forespurtBestemmendeFraværsdag);
  }

  const filtrertePerioder = fravaersperioder.filter((periode) => periode.fom && periode.tom);

  const sorterteSykemeldingsperioder = finnSorterteUnikePerioder(filtrertePerioder);
  const sorterteArbeidsgiverperioder = arbeidsgiverperiode ? finnSorterteUnikePerioder(arbeidsgiverperiode) : [];

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

  // const bestemmendeFravaersdag = hvemDatoErStorst(bestemmendeFravaersdagFraFravaer, forsteDagArbeidsgiverperiode)
  //   ? bestemmendeFravaersdagFraFravaer
  //   : forsteDagArbeidsgiverperiode;

  // if (forespurtBestemmendeFraværsdag) {
  //   const forespurtBestemmendeFravaersdagErStorst = hvemDatoErStorst(
  //     bestemmendeFravaersdag,
  //     forespurtBestemmendeFraværsdag
  //   )
  //     ? forespurtBestemmendeFraværsdag
  //     : bestemmendeFravaersdag;
  //   return formatISO9075(forespurtBestemmendeFravaersdagErStorst as Date, {
  //     representation: 'date'
  //   });
  // }

  // Fjerne overlappende perioder mellom frværsperioder og arbeidsgiverperioder. Hvis det er overlappende perioder, så er det arbeidsgiverperioden som er bestemmende

  const samletSykePeriode = tilstotendeSykemeldingsperioder.map((periode) => {
    const arbeidsgiverperiode = sorterteArbeidsgiverperioder.find((ap) => {
      return (
        periode.fom &&
        periode.tom &&
        ap.fom &&
        ap.tom &&
        ((periode.fom < ap.fom && periode.fom > ap.tom) || (periode.tom > ap.fom && periode.tom < ap.tom))
      );
    });
    if (arbeidsgiverperiode) {
      return {
        fom: arbeidsgiverperiode.fom,
        tom: arbeidsgiverperiode.tom,
        id: arbeidsgiverperiode.id
      };
    } else {
      return {
        fom: periode.fom,
        tom: periode.tom,
        id: periode.id
      };
    }
  });

  const samletPeriode = finnSorterteUnikePerioder([...samletSykePeriode, ...sorterteArbeidsgiverperioder]);

  console.log('sorterteArbeidsgiverperioder', sorterteArbeidsgiverperioder);
  console.log('samletPeriode', samletPeriode);

  const nyPeriode: Periode[] = [samletPeriode[0]] as Periode[];
  samletPeriode.forEach((periode) => {
    const aktivPeriode = nyPeriode[nyPeriode.length - 1];
    const oppdatertPeriode = tilstoetendePeriode(aktivPeriode, periode);

    if (oppdatertPeriode) {
      nyPeriode[nyPeriode.length - 1] = oppdatertPeriode;
    } else {
      nyPeriode.push(periode);
    }
  });

  console.log('nyPeriode', nyPeriode);

  const bestemmendeFravaersdagFraFravaer =
    nyPeriode[nyPeriode.length - 1].fom !== undefined ? nyPeriode[nyPeriode.length - 1].fom : undefined;

  const bestemmendeFravaersdag = bestemmendeFravaersdagFraFravaer;

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
