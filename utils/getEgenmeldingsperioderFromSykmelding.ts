import { differenceInDays } from 'date-fns';
import { TDateISODate } from '../schema/ForespurtDataSchema';

interface Egenmeldingsperiode {
  fom: TDateISODate;
  tom: TDateISODate;
}

interface Sykmeldingsperiode {
  egenmeldingsdagerFraSykmelding?: TDateISODate[];
}

const getEgenmeldingsperioderFromSykmelding = (sykmeldingsperiode: Sykmeldingsperiode[]) => {
  return sykmeldingsperiode
    .flatMap((periode: Sykmeldingsperiode) => {
      const sorterteEgenmeldingsdager =
        Array.isArray(periode.egenmeldingsdagerFraSykmelding) && periode.egenmeldingsdagerFraSykmelding.length > 0
          ? [...periode.egenmeldingsdagerFraSykmelding].sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
          : [];

      const startDato = sorterteEgenmeldingsdager[0];
      const egenmeldingsperiode = sorterteEgenmeldingsdager.reduce(
        (periode: Egenmeldingsperiode[], currentDate: TDateISODate) => {
          const tom = new Date(currentDate);
          const currentTom = new Date(periode[periode.length - 1].tom);

          if (differenceInDays(tom, currentTom) <= 1) {
            periode[periode.length - 1].tom = currentDate as TDateISODate;
          } else {
            periode.push({ fom: currentDate as TDateISODate, tom: currentDate as TDateISODate });
          }
          return periode;
        },
        [
          {
            fom: startDato,
            tom: startDato
          }
        ]
      );
      return egenmeldingsperiode;
    })
    .filter((periode: Egenmeldingsperiode) => !!periode.fom && !!periode.tom);
};

export default getEgenmeldingsperioderFromSykmelding;
