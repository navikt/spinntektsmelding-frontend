import { compareAsc, formatISO9075 } from 'date-fns';
import { Periode } from '../state/state';
import differenceInBusinessDays from './differenceInBusinessDays';
import parseIsoDate from './parseIsoDate';

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

  const sorterteSykmeldingsperioder = finnSorterteUnikePerioder(filtrertePerioder);
  const sorterteArbeidsgiverperioder = arbeidsgiverperiode ? finnSorterteUnikePerioder(arbeidsgiverperiode) : [];

  const mergedSykmeldingsperioder = [sorterteSykmeldingsperioder[0]];

  sorterteSykmeldingsperioder.forEach((periode, index) => {
    if (index > 0) {
      const aktivPeriode = mergedSykmeldingsperioder[mergedSykmeldingsperioder.length - 1];
      const oppdatertPeriode = overlappendePeriode(aktivPeriode, periode);

      if (oppdatertPeriode) {
        mergedSykmeldingsperioder[mergedSykmeldingsperioder.length - 1] = oppdatertPeriode;
      } else {
        mergedSykmeldingsperioder.push(periode);
      }
    }
  });

  const tilstotendeSykmeldingsperioder = [mergedSykmeldingsperioder[0]];
  mergedSykmeldingsperioder.forEach((periode) => {
    const aktivPeriode = tilstotendeSykmeldingsperioder[tilstotendeSykmeldingsperioder.length - 1];
    const oppdatertPeriode = tilstoetendePeriode(aktivPeriode, periode);

    if (oppdatertPeriode) {
      tilstotendeSykmeldingsperioder[tilstotendeSykmeldingsperioder.length - 1] = oppdatertPeriode;
    } else {
      tilstotendeSykmeldingsperioder.push(periode);
    }
  });

  // Fjerne overlappende perioder mellom fraværperioder og arbeidsgiverperioder. Hvis det er overlappende perioder, så er det arbeidsgiverperioden som er bestemmende

  const samletSykePeriode = erstattPerioderSomHarBlittEndretAvArbeidsgiverperioder(
    tilstotendeSykmeldingsperioder,
    sorterteArbeidsgiverperioder
  );

  const samletPeriode = finnSorterteUnikePerioder([...samletSykePeriode, ...sorterteArbeidsgiverperioder]);

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

  const bestemmendeFravaersdag =
    nyPeriode[nyPeriode.length - 1].fom !== undefined ? nyPeriode[nyPeriode.length - 1].fom : undefined;

  if (bestemmendeFravaersdag !== undefined) {
    return formatISO9075(bestemmendeFravaersdag, {
      representation: 'date'
    });
  }
};

export default finnBestemmendeFravaersdag;

function erstattPerioderSomHarBlittEndretAvArbeidsgiverperioder(
  tilstotendeSykmeldingsperioder: Periode[],
  sorterteArbeidsgiverperioder: Periode[]
) {
  return tilstotendeSykmeldingsperioder.map((periode) => {
    const arbeidsgiverperiode = sorterteArbeidsgiverperioder.find((ap) => {
      return (
        periode.fom &&
        periode.tom &&
        ap.fom &&
        ap.tom &&
        ((periode.fom < ap.fom && periode.tom > ap.fom) ||
          (periode.fom < ap.tom && periode.tom > ap.tom) ||
          (periode.tom < ap.fom && periode.tom > ap.tom) ||
          (periode.tom > ap.fom && periode.tom < ap.tom))
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
}

export function finnSorterteUnikePerioder(fravaersperioder: Periode[]): Array<Periode> {
  const sorterteSykmeldingsperioder = [...fravaersperioder].sort((a, b) => {
    return compareAsc(a.fom || new Date(), b.fom || new Date());
  });

  return finnUnikePerioder(sorterteSykmeldingsperioder);
}

function finnUnikePerioder(aktivePerioder: Array<Periode>): Array<Periode> {
  const perioder: Array<Periode> = [aktivePerioder[0]];

  aktivePerioder.forEach((periode, index) => {
    if (index > 0) {
      if (periode.fom !== perioder[perioder.length - 1].fom && periode.tom !== perioder[perioder.length - 1].tom) {
        perioder.push(periode);
      }
    }
  });
  return perioder;
}
