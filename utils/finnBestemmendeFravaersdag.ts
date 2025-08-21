import { differenceInDays, formatISO9075, isBefore } from 'date-fns';
import differenceInBusinessDays from './differenceInBusinessDays';
import parseIsoDate from './parseIsoDate';
import sorterFomStigende from './sorterFomStigende';
import sorterFomSynkende from './sorterFomSynkende';
import { TDateISODate } from '../schema/ForespurtDataSchema';
import { TidPeriode } from '../schema/TidPeriodeSchema';

export function overlappendePeriode<T extends TidPeriode>(ene: T, andre: T): T | null {
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
 * med mindre de ikke stater etter dag 17, eller det er snakk om en delvis forespørsel
 */
function finnBestemmendeFravaersdag<T extends TidPeriode>(
  fravaerPerioder?: Array<T>,
  arbeidsgiverperiode?: Array<T>,
  forespurtBestemmendeFraværsdag?: string | Date,
  arbeidsgiverKanFlytteBFD?: boolean,
  mottattBestemmendeFravaersdag?: TDateISODate,
  mottattEksternInntektsdato?: TDateISODate,
  laastTilMottattPeriode?: boolean,
  erBegrensetForespoersel?: boolean
): string | undefined {
  if (laastTilMottattPeriode && mottattBestemmendeFravaersdag) {
    if (!mottattEksternInntektsdato) return mottattBestemmendeFravaersdag;
    if (isBefore(parseIsoDate(mottattBestemmendeFravaersdag)!, parseIsoDate(mottattEksternInntektsdato)!)) {
      return mottattBestemmendeFravaersdag;
    } else {
      return mottattEksternInntektsdato;
    }
  }

  if (!fravaerPerioder || !fravaerPerioder[0] || !fravaerPerioder?.[0]?.fom) {
    return undefined;
  }

  const sorterteSykmeldingPerioder = finnSammenhengendePeriode(
    finnSorterteUnikePerioder(fravaerPerioder.filter((periode) => periode.fom && periode.tom))
  );

  if (erBegrensetForespoersel) {
    const sistePeriode = sorterteSykmeldingPerioder[sorterteSykmeldingPerioder.length - 1];

    if (sistePeriode) {
      return formatISO9075(sistePeriode.fom as Date, {
        representation: 'date'
      });
    }
  }

  const sisteDagArbeidsgiverperiode =
    Array.isArray(arbeidsgiverperiode) && arbeidsgiverperiode.length > 0
      ? [...arbeidsgiverperiode].sort(sorterFomSynkende)[0].tom
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

export function finnSorterteUnikePerioder<T extends TidPeriode>(fravaerPerioder: Array<T>): Array<T> {
  const sorterteSykmeldingPerioder =
    Array.isArray(fravaerPerioder) && fravaerPerioder.length > 0 ? [...fravaerPerioder].sort(sorterFomStigende) : [];

  return sorterteSykmeldingPerioder;
}

export function finnSammenhengendePeriode<T extends TidPeriode>(sykmeldingsperioder: Array<T>): Array<T> {
  const { mergedSykmeldingsperioder, tilstoetendeSykmeldingsperioder } = joinPerioderMedOverlapp(sykmeldingsperioder);
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

export function joinPerioderMedOverlapp<T extends TidPeriode>(sykmeldingsperioder: T[]) {
  const sorterteSykmeldingsperioder = finnSorterteUnikePerioder(sykmeldingsperioder);

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
