import { differenceInCalendarDays } from 'date-fns';

export interface SammenslaattPeriode {
  fom: Date;
  tom: Date;
  id: string;
  periode?: { fom: Date; tom: Date; id: string }[];
}

export default function slaaSammenPerioder(perioder: { fom: Date; tom: Date; id: string }[]): SammenslaattPeriode[] {
  const perioderSorted = [...perioder].sort((a, b) => (a.fom > b.fom ? -1 : 1));
  const sammenslaattePerioder = perioderSorted.reduce((acc, periode) => {
    if (acc.length === 0) {
      acc.push({ ...periode });
      return acc;
    }
    let last = acc[acc.length - 1];
    if (acc[acc.length - 1]?.periode) {
      last = acc[acc.length - 1].periode![acc[acc.length - 1].periode!.length - 1];
    }
    if (Math.abs(differenceInCalendarDays(last.fom, periode.tom)) < 16) {
      if (!acc[acc.length - 1].periode) {
        acc[acc.length - 1].periode = [{ ...last }, { ...periode }];
      } else acc[acc.length - 1].periode!.push(periode);
    } else {
      acc.push({ ...periode });
    }

    return acc;
  }, [] as SammenslaattPeriode[]);

  const gruppertePerioder = sammenslaattePerioder.map((periode) => {
    if (!periode.periode) {
      return {
        ...periode
      };
    }
    const sortertePerioder = [...periode.periode].sort((a, b) => (a.fom < b.fom ? -1 : 1));
    const tom = sortertePerioder[sortertePerioder.length - 1].tom;
    const fom = sortertePerioder[0].fom;
    return {
      ...periode,
      tom,
      fom,
      periode: sortertePerioder
    };
  });

  return gruppertePerioder;
}
