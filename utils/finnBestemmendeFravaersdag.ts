import { compareAsc, compareDesc, differenceInDays, formatISO9075, isBefore } from 'date-fns';
import differenceInBusinessDays from './differenceInBusinessDays';
import parseIsoDate from './parseIsoDate';
import { finnSammenhengendePeriode } from './finnArbeidsgiverperiode';
import { TDateISODate } from '../state/MottattData';

export type tidPeriode = {
  fom?: Date;
  tom?: Date;
};

export function overlappendePeriode<T extends tidPeriode>(ene: T, andre: T): T | null {
  if (!ene || !andre) return null;
  if (!ene.tom || !ene.fom || !andre.tom || !andre.fom) return null;
  if (ene.tom < andre.fom || ene.fom > andre.tom) {
    return null;
  }

  const obj: T = {
    ...ene,
    fom: ene.fom > andre.fom ? andre.fom : ene.fom,
    tom: ene.tom > andre.tom ? ene.tom : andre.tom
  };

  return obj;
}

export function tilstoetendePeriode<T extends tidPeriode>(ene: T, andre: T) {
  if (!ene || !andre) return null;
  if (ene.tom === andre.tom && ene.fom === andre.fom) {
    return ene;
  }

  if (!ene.fom || !ene.tom || !andre.fom || !andre.tom) return null;

  if (differenceInBusinessDays(andre.fom, ene.tom, { includeStartDate: false, includeEndDate: false }) <= 0) {
    const obj: T = {
      ...ene,
      fom: ene.fom,
      tom: andre.tom
    };

    return obj;
  }

  return null;
}

export function tilstoetendePeriodeManuellJustering<T extends tidPeriode>(ene: T, andre: T): T | null {
  if (!ene || !andre) return null;
  if (ene.tom === andre.tom && ene.fom === andre.fom) {
    return ene;
  }

  if (!ene.fom || !ene.tom || !andre.fom || !andre.tom) return null;

  if (differenceInDays(andre.fom, ene.tom) <= 1) {
    const obj: T = {
      ...ene,
      fom: ene.fom,
      tom: andre.tom
    };

    return obj;
  }

  return null;
}

/******
 * Funksjonen finner bestemmende fraværsdag for gitte fraværsperiode.
 * Hvis det er flere perioder vil fom for den siste perioden være bestemmende.
 * Perioder som starter etter arbeidsgiverperioden (16 første dagene) vil ikke bli tatt med i beregningen,
 * med mindre de ikke stater etter dag 17
 */
function finnBestemmendeFravaersdag<T extends tidPeriode>(
  fravaerPerioder?: Array<T>,
  arbeidsgiverperiode?: Array<T>,
  forespurtBestemmendeFraværsdag?: string | Date,
  arbeidsgiverKanFlytteBFD?: boolean,
  mottattBestemmendeFravaersdag?: TDateISODate,
  mottattEksternBestemmendeFravaersdag?: TDateISODate,
  laastTilMottattPeriode?: boolean
): string | undefined {
  if (laastTilMottattPeriode && mottattBestemmendeFravaersdag) {
    if (!mottattEksternBestemmendeFravaersdag) return mottattBestemmendeFravaersdag;
    if (isBefore(parseIsoDate(mottattBestemmendeFravaersdag)!, parseIsoDate(mottattEksternBestemmendeFravaersdag)!)) {
      return mottattBestemmendeFravaersdag;
    } else {
      return mottattEksternBestemmendeFravaersdag;
    }
  }

  if (!fravaerPerioder || !fravaerPerioder[0] || !fravaerPerioder?.[0]?.fom) {
    return undefined;
  }

  const sorterteSykmeldingPerioder = finnSammenhengendePeriode(
    finnSorterteUnikePerioder(fravaerPerioder.filter((periode) => periode.fom && periode.tom))
  );

  const sisteDagArbeidsgiverperiode =
    arbeidsgiverperiode && arbeidsgiverperiode.length > 0
      ? arbeidsgiverperiode?.toSorted((a, b) => compareDesc(a.fom || new Date(), b.fom || new Date()))[0].tom
      : undefined;

  let perioderEtterAgp = [];
  if (sisteDagArbeidsgiverperiode) {
    perioderEtterAgp = sorterteSykmeldingPerioder.map((periode) => ({
      ...periode,
      fom: periode.fom! < sisteDagArbeidsgiverperiode ? sisteDagArbeidsgiverperiode : periode.fom,
      tom: periode.tom! < sisteDagArbeidsgiverperiode ? sisteDagArbeidsgiverperiode : periode.tom
    }));
  } else {
    perioderEtterAgp = sorterteSykmeldingPerioder;
  }
  if (
    arbeidsgiverperiode &&
    arbeidsgiverperiode.length > 0 &&
    differenceInBusinessDays(perioderEtterAgp[0].fom!, arbeidsgiverperiode[arbeidsgiverperiode.length - 1].tom!) <= 1
  ) {
    perioderEtterAgp[0].fom = arbeidsgiverperiode[arbeidsgiverperiode.length - 1].tom;
  }

  const agpOgSykPerioder = finnSammenhengendePeriode(
    finnSorterteUnikePerioder(
      perioderEtterAgp.concat(arbeidsgiverperiode ?? []).filter((periode) => periode.fom && periode.tom)
    )
  ).filter((periode) => periode?.fom && periode?.tom);

  let antallDager = 0;
  let bestemmendeFravaersdag = '';
  let laasResultat = false;

  agpOgSykPerioder.forEach((element) => {
    antallDager += differenceInDays(element.tom!, element.fom!) + 1;

    if (antallDager > 16) {
      if (!laasResultat) {
        bestemmendeFravaersdag = formatISO9075(element.fom as Date, {
          representation: 'date'
        });
        laasResultat = true;
      }
    }
  });

  if (antallDager <= 16) {
    bestemmendeFravaersdag = formatISO9075(agpOgSykPerioder[agpOgSykPerioder.length - 1].fom as Date, {
      representation: 'date'
    });
  }

  if (!arbeidsgiverKanFlytteBFD) {
    if (typeof forespurtBestemmendeFraværsdag === 'string') {
      forespurtBestemmendeFraværsdag = parseIsoDate(forespurtBestemmendeFraværsdag);
    }
    if (
      forespurtBestemmendeFraværsdag &&
      isBefore(forespurtBestemmendeFraværsdag, parseIsoDate(bestemmendeFravaersdag)!)
    ) {
      return formatISO9075(forespurtBestemmendeFraværsdag, {
        representation: 'date'
      });
    }
  }

  return bestemmendeFravaersdag;
}

export default finnBestemmendeFravaersdag;

export function finnSorterteUnikePerioder<T extends tidPeriode>(fravaerPerioder: Array<T>): Array<T> {
  const sorterteSykmeldingPerioder = fravaerPerioder.toSorted((a, b) => {
    return compareAsc(a.fom || new Date(), b.fom || new Date());
  });

  return sorterteSykmeldingPerioder;
}
