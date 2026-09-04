import { differenceInDays, formatISO9075, isBefore } from 'date-fns';
import differenceInBusinessDays from './differenceInBusinessDays';
import parseIsoDate from './parseIsoDate';
import sorterFomStigende from './sorterFomStigende';
import sorterFomSynkende from './sorterFomSynkende';
import { TidPeriode } from '../schema/TidPeriodeSchema';

type GyldigTidPeriode<T extends TidPeriode> = T & Required<Pick<TidPeriode, 'fom' | 'tom'>>;

function erGyldigTidPeriode<T extends TidPeriode>(periode: T): periode is GyldigTidPeriode<T> {
  return Boolean(periode.fom && periode.tom);
}

export function overlappendePeriode<T extends TidPeriode>(ene: T, andre: T): T | null {
  if (!ene || !andre) return null;
  if (!ene.tom || !ene.fom || !andre.tom || !andre.fom) return null;
  if (ene.tom < andre.fom || ene.fom > andre.tom) {
    return null;
  }

  const obj: T = {
    ...ene,
    fom: new Date(Math.min(ene.fom.getTime(), andre.fom.getTime())),
    tom: new Date(Math.max(ene.tom.getTime(), andre.tom.getTime()))
  };

  return obj;
}

export function tilstoetendePeriode<T extends TidPeriode>(ene: T, andre: T) {
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

export function tilstoetendePeriodeManuellJustering<T extends TidPeriode>(ene: T, andre: T): T | null {
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
 * med mindre de ikke starter etter dag 17, eller det er snakk om en delvis forespørsel
 */
function finnBestemmendeFravaersdag<T extends TidPeriode>(
  fravaerPerioder?: Array<T>,
  arbeidsgiverperiode?: Array<T>,
  forespurtBestemmendeFraværsdag?: string | Date,
  arbeidsgiverKanFlytteBFD?: boolean,
  erBegrensetForespoersel?: boolean
): string | undefined {
  const gyldigeFravaerPerioder = fravaerPerioder?.filter(erGyldigTidPeriode) ?? [];

  if (gyldigeFravaerPerioder.length === 0) {
    return undefined;
  }

  const sorterteSykmeldingPerioder = finnSammenhengendePeriode(gyldigeFravaerPerioder);

  if (erBegrensetForespoersel) {
    const sistePeriode = sorterteSykmeldingPerioder.at(-1);

    if (sistePeriode) {
      return formatISO9075(sistePeriode.fom as Date, {
        representation: 'date'
      });
    }
  }

  const sorterteArbeidsgiverperioder = (arbeidsgiverperiode ?? []).filter(erGyldigTidPeriode).sort(sorterFomSynkende);
  const sisteDagArbeidsgiverperiode = sorterteArbeidsgiverperioder[0]?.tom;

  let perioderEtterAgp = [];
  if (sisteDagArbeidsgiverperiode) {
    perioderEtterAgp = sorterteSykmeldingPerioder.map((periode) => ({
      ...periode,
      fom: new Date(Math.max(periode.fom!.getTime(), sisteDagArbeidsgiverperiode.getTime())),
      tom: new Date(Math.max(periode.tom!.getTime(), sisteDagArbeidsgiverperiode.getTime()))
    }));
  } else {
    perioderEtterAgp = sorterteSykmeldingPerioder;
  }
  if (
    sisteDagArbeidsgiverperiode &&
    differenceInBusinessDays(perioderEtterAgp[0].fom!, sisteDagArbeidsgiverperiode) <= 1
  ) {
    perioderEtterAgp[0].fom = sisteDagArbeidsgiverperiode;
  }

  const agpOgSykPerioder = finnSammenhengendePeriode(
    perioderEtterAgp.concat(sorterteArbeidsgiverperioder).filter(erGyldigTidPeriode)
  );

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
    bestemmendeFravaersdag = formatISO9075(agpOgSykPerioder.at(-1)!.fom as Date, {
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

export function finnSorterteUnikePerioder<T extends TidPeriode>(fravaerPerioder: Array<T>): Array<T> {
  const sorterteSykmeldingPerioder =
    Array.isArray(fravaerPerioder) && fravaerPerioder.length > 0 ? [...fravaerPerioder].sort(sorterFomStigende) : [];

  return sorterteSykmeldingPerioder;
}

function slaaSammenPerioder<T extends TidPeriode>(
  sykmeldingsperioder: Array<T>,
  slaaSammen: (aktivPeriode: T, periode: T) => T | null
): Array<T> {
  return finnSorterteUnikePerioder(sykmeldingsperioder).reduce<Array<T>>((sammenhengendePerioder, periode) => {
    const aktivPeriode = sammenhengendePerioder.at(-1);

    if (!aktivPeriode) {
      sammenhengendePerioder.push(periode);
      return sammenhengendePerioder;
    }

    const oppdatertPeriode = slaaSammen(aktivPeriode, periode);

    if (oppdatertPeriode) {
      sammenhengendePerioder[sammenhengendePerioder.length - 1] = oppdatertPeriode;
    } else {
      sammenhengendePerioder.push(periode);
    }

    return sammenhengendePerioder;
  }, []);
}

export function finnSammenhengendePeriode<T extends TidPeriode>(sykmeldingsperioder: Array<T>): Array<T> {
  return slaaSammenPerioder(
    sykmeldingsperioder,
    (aktivPeriode, periode) => overlappendePeriode(aktivPeriode, periode) ?? tilstoetendePeriode(aktivPeriode, periode)
  );
}

export function joinPerioderMedOverlapp<T extends TidPeriode>(sykmeldingsperioder: T[]) {
  const mergedSykmeldingsperioder = slaaSammenPerioder(sykmeldingsperioder, overlappendePeriode);
  const tilstoetendeSykmeldingsperioder = mergedSykmeldingsperioder.slice(0, 1);
  return { mergedSykmeldingsperioder, tilstoetendeSykmeldingsperioder };
}
