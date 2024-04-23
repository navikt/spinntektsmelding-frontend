import { compareAsc, compareDesc, differenceInDays, formatISO9075 } from 'date-fns';
import { Periode } from '../state/state';
import differenceInBusinessDays from './differenceInBusinessDays';
import parseIsoDate from './parseIsoDate';
import finnArbeidsgiverperiode, { finnSammenhengendePeriodeManuellJustering } from './finnArbeidsgiverperiode';

export interface FravaersPeriode {
  fom: Date;
  tom: Date;
}

export const overlappendePeriode = (ene: Periode, andre: Periode) => {
  if (!ene || !andre) return null;
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
  if (!ene || !andre) return null;
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

export const tilstoetendePeriodeManuellJustering = (ene: Periode, andre: Periode) => {
  if (!ene || !andre) return null;
  if (ene.tom === andre.tom && ene.fom === andre.fom) {
    return ene;
  }

  if (!ene.fom || !ene.tom || !andre.fom || !andre.tom) return null;

  if (differenceInDays(andre.fom, ene.tom) <= 1) {
    const obj: Periode = {
      fom: ene.fom,
      tom: andre.tom,
      id: ene.id
    };

    return obj;
  }

  return null;
};

/******
 * Funksjonen finner bestemmende fraværsdag for gitte fraværsperiode.
 * Hvis det er flere perioder vil fom for den siste perioden være bestemmende.
 * Perioder etter arbeidsgiverperioden (16 første dagene) vil ikke bli tatt med i beregningen.
 */
const finnBestemmendeFravaersdag = (
  fravaersperioder?: Array<Periode>,
  arbeidsgiverperiode?: Array<Periode>,
  forespurtBestemmendeFraværsdag?: string | Date,
  arbeidsgiverKanFlytteBFD?: boolean
): string | undefined => {
  if (!fravaersperioder || !fravaersperioder[0] || !fravaersperioder?.[0]?.fom) {
    return undefined;
  }

  const sortertArbeidsgiverperiode =
    arbeidsgiverperiode && arbeidsgiverperiode.length > 0
      ? [...arbeidsgiverperiode].sort((a, b) => compareDesc(a.fom || new Date(), b.fom || new Date()))
      : undefined;

  const sammenhengendeAgp = sortertArbeidsgiverperiode
    ? finnSammenhengendePeriodeManuellJustering(sortertArbeidsgiverperiode)
    : undefined;

  const sortertSammenhengendeAgp = sammenhengendeAgp
    ? [...sammenhengendeAgp].sort((a, b) => compareDesc(a.fom || new Date(), b.fom || new Date()))
    : undefined;

  if (typeof forespurtBestemmendeFraværsdag === 'string') {
    forespurtBestemmendeFraværsdag = parseIsoDate(forespurtBestemmendeFraværsdag);
  }

  const filtrertePerioder = fravaersperioder.filter((periode) => periode.fom && periode.tom);

  const tilstotendeSykemeldingsperioder = finnArbeidsgiverperiode(filtrertePerioder);

  const bestemmendeFravaersdagFraFravaer =
    tilstotendeSykemeldingsperioder[tilstotendeSykemeldingsperioder.length - 1]?.fom !== undefined
      ? tilstotendeSykemeldingsperioder[tilstotendeSykemeldingsperioder.length - 1].fom
      : undefined;

  const forsteDagArbeidsgiverperiode = sortertSammenhengendeAgp ? sortertSammenhengendeAgp[0]?.fom : undefined;

  let bestemmendeFravaersdag = bestemmendeFravaersdagFraFravaer;

  if (!arbeidsgiverKanFlytteBFD) {
    bestemmendeFravaersdag = hvemDatoErTidligst(bestemmendeFravaersdagFraFravaer, forsteDagArbeidsgiverperiode)
      ? bestemmendeFravaersdagFraFravaer
      : forsteDagArbeidsgiverperiode;
    if (forespurtBestemmendeFraværsdag) {
      const forespurtBestemmendeFravaersdagErStorst = hvemDatoErTidligst(
        bestemmendeFravaersdag,
        forespurtBestemmendeFraværsdag
      )
        ? forespurtBestemmendeFraværsdag
        : bestemmendeFravaersdag;

      return formatISO9075(forespurtBestemmendeFravaersdagErStorst as Date, {
        representation: 'date'
      });
    }
  }

  if (!sortertArbeidsgiverperiode) {
    return formatISO9075(bestemmendeFravaersdag as Date, {
      representation: 'date'
    });
  }

  if (forsteDagArbeidsgiverperiode !== undefined) {
    return formatISO9075(forsteDagArbeidsgiverperiode, {
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

function hvemDatoErTidligst(bestemmende?: Date, arbeidsgiverperiode?: Date): boolean {
  if (!bestemmende) {
    return true;
  }

  if (!arbeidsgiverperiode) {
    return true;
  }
  return bestemmende > arbeidsgiverperiode;
}
