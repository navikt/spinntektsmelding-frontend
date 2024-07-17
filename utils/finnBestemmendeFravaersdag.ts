import { compareAsc, compareDesc, differenceInDays, formatISO9075, isAfter, isBefore, isEqual } from 'date-fns';
import { Periode } from '../state/state';
import differenceInBusinessDays from './differenceInBusinessDays';
import parseIsoDate from './parseIsoDate';
import { finnSammenhengendePeriode, finnSammenhengendePeriodeManuellJustering } from './finnArbeidsgiverperiode';
import finnAktiveFravaersperioder from './finnAktiveFravaersperioder';
import { TDateISODate } from '../state/MottattData';

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
  arbeidsgiverKanFlytteBFD?: boolean,
  mottattBestemmendeFravaersdag?: TDateISODate,
  mottattEksternBestemmendeFravaersdag?: TDateISODate,
  laastTilMottattPeriode?: boolean
): string | undefined => {
  if (laastTilMottattPeriode && mottattBestemmendeFravaersdag) {
    if (!mottattEksternBestemmendeFravaersdag) return mottattBestemmendeFravaersdag;
    if (isBefore(parseIsoDate(mottattBestemmendeFravaersdag), parseIsoDate(mottattEksternBestemmendeFravaersdag))) {
      return mottattBestemmendeFravaersdag as string;
    } else {
      return mottattEksternBestemmendeFravaersdag as string;
    }
  }

  if (!fravaersperioder?.[0]?.fom) {
    return undefined;
  }

  // if (!arbeidsgiverKanFlytteBFD) {
  //   if (typeof forespurtBestemmendeFraværsdag === 'string') {
  //     forespurtBestemmendeFraværsdag = parseIsoDate(forespurtBestemmendeFraværsdag);
  //   }
  //   if (forespurtBestemmendeFraværsdag) {
  //     return formatISO9075(forespurtBestemmendeFraværsdag as Date, {
  //       representation: 'date'
  //     });
  //   }
  // }

  const sorterteSykemeldingsperioder = finnSammenhengendePeriode(
    finnSorterteUnikePerioder(fravaersperioder.filter((periode) => periode.fom && periode.tom))
  );

  const aktuelleFravaersperioder = finnAktiveFravaersperioder(sorterteSykemeldingsperioder);

  if (!arbeidsgiverperiode?.[0]?.fom) {
    return formatISO9075(aktuelleFravaersperioder[aktuelleFravaersperioder.length - 1]?.fom!, {
      representation: 'date'
    });
  }

  const sortertArbeidsgiverperiode =
    arbeidsgiverperiode && arbeidsgiverperiode.length > 0
      ? arbeidsgiverperiode
          .toSorted((a, b) => compareDesc(a.fom || new Date(), b.fom || new Date()))
          .filter((periode) => periode.fom && periode.tom)
      : [];

  const muligeFravaersperioder = sorterteSykemeldingsperioder.map((periode) => {
    const tmpPeriode = {
      fom: periode.fom,
      tom: periode.tom,
      id: periode.id
    };

    if (isBefore(tmpPeriode.fom as Date, sortertArbeidsgiverperiode[0].fom as Date)) {
      tmpPeriode.fom = sortertArbeidsgiverperiode[0].fom;
    }

    if (isBefore(tmpPeriode.tom as Date, sortertArbeidsgiverperiode[0].fom as Date)) {
      tmpPeriode.fom = sortertArbeidsgiverperiode[0].fom;
    }

    return tmpPeriode;
  });

  const sortertePerioder = finnSorterteUnikePerioder(
    sortertArbeidsgiverperiode
      .concat(muligeFravaersperioder)
      .toSorted((a, b) => compareDesc(a.fom || new Date(), b.fom || new Date()))
  );

  const sammenhengendeAgp = finnAktiveFravaersperioder(finnSammenhengendePeriodeManuellJustering(sortertePerioder));

  const overskytendeFravaersperioder =
    arbeidsgiverperiode && aktuelleFravaersperioder
      ? aktuelleFravaersperioder.filter((periode) => {
          if (!periode.fom) return false;
          if (!sammenhengendeAgp?.[sammenhengendeAgp.length - 1]?.fom) {
            return false;
          }
          return (
            isBefore(periode.fom, sammenhengendeAgp[sammenhengendeAgp.length - 1].fom) &&
            isAfter(periode.tom, sammenhengendeAgp[sammenhengendeAgp.length - 1].tom)
          );
        })
      : [];

  const dagerEtterAgp = finnSammenhengendePeriodeManuellJustering(
    sammenhengendeAgp.concat(overskytendeFravaersperioder).toSorted((a, b) => compareAsc(a.fom, b.fom))
  );

  let bestemmendeFravaersdag = dagerEtterAgp[dagerEtterAgp.length - 1].fom;

  if (isBefore(bestemmendeFravaersdag as Date, sammenhengendeAgp[0].fom as Date)) {
    bestemmendeFravaersdag = sammenhengendeAgp[0].fom;
  }

  if (!arbeidsgiverKanFlytteBFD) {
    if (typeof forespurtBestemmendeFraværsdag === 'string') {
      forespurtBestemmendeFraværsdag = parseIsoDate(forespurtBestemmendeFraværsdag);
    }
    const tidligsteBFD = finnTidligsteDato([bestemmendeFravaersdag, forespurtBestemmendeFraværsdag]);

    return formatISO9075(tidligsteBFD as Date, {
      representation: 'date'
    });
  }

  return formatISO9075(bestemmendeFravaersdag as Date, {
    representation: 'date'
  });

  function finnTidligsteDato(datoer: Array<Date | undefined>) {
    return datoer.reduce((acc, dato) => {
      if (!dato) return acc;
      if (!acc) return dato;
      return dato < acc ? dato : acc;
    }, undefined);
  }
};

export default finnBestemmendeFravaersdag;

export function finnSorterteUnikePerioder(fravaersperioder: Periode[]) {
  const sorterteSykemeldingsperioder = fravaersperioder.toSorted((a, b) => {
    return compareAsc(a.fom || new Date(), b.fom || new Date());
  });

  const unikeSykmeldingsperioder: Array<Periode> = finnUnikePerioder(sorterteSykemeldingsperioder);
  return unikeSykmeldingsperioder;
}

function finnUnikePerioder(aktivePerioder: Array<Periode>): Array<Periode> {
  const perioder: Array<Periode> = [aktivePerioder[0]];

  aktivePerioder.forEach((periode, index) => {
    const perioderIndex = perioder.length - 1;
    if (index > 0) {
      if (
        perioder[perioderIndex] &&
        !isEqual(periode.fom!, perioder[perioderIndex].fom!) &&
        !isEqual(periode.tom!, perioder[perioderIndex].tom!)
      ) {
        perioder.push(periode);
      }
    }
  });
  return perioder;
}
