import { differenceInDays } from 'date-fns';
import { TDateISODate } from '../schema/ForespurtDataSchema';

const getEgenmeldingsperioderFromSykmelding = (sykmeldingsperiode: any) => {
  return sykmeldingsperiode
    .flatMap((periode: any) => {
      const sorterteEgenmeldingsdager =
        Array.isArray(periode.egenmeldingsdagerFraSykmelding) && periode.egenmeldingsdagerFraSykmelding.length > 0
          ? [...periode.egenmeldingsdagerFraSykmelding].sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
          : [];
      const egenmeldingsperiode = sorterteEgenmeldingsdager.reduce(
        (accumulator: any, currentValue: any) => {
          const tom = new Date(currentValue);
          const currentTom = new Date(accumulator[accumulator.length - 1].tom);

          if (differenceInDays(tom, currentTom) <= 1) {
            accumulator[accumulator.length - 1].tom = currentValue as TDateISODate;
          } else {
            accumulator.push({ fom: currentValue as TDateISODate, tom: currentValue as TDateISODate });
          }
          return accumulator;
        },
        [
          {
            fom: sorterteEgenmeldingsdager[0] as TDateISODate,
            tom: sorterteEgenmeldingsdager[0] as TDateISODate
          }
        ]
      );
      return egenmeldingsperiode;
    })
    .filter((element: any) => !!element.fom && !!element.tom);
};

export default getEgenmeldingsperioderFromSykmelding;
