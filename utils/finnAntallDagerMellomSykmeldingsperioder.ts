import { differenceInDays } from 'date-fns';
import { TidPeriode } from '../schema/TidPeriodeSchema';
import { finnSorterteUnikePerioder } from './finnBestemmendeFravaersdag';

export function finnAntallDagerMellomSykmeldingsperioder<T extends TidPeriode>(valgteUnikeSykepengePerioder: T[]) {
  const antallDagerMellomSykmeldingsperioder = valgteUnikeSykepengePerioder
    ? finnSorterteUnikePerioder(valgteUnikeSykepengePerioder).reduce((accumulator, currentValue, index, array) => {
        if (index === 0) {
          return 0;
        }
        if (!currentValue?.fom || !currentValue?.tom) {
          return accumulator;
        }
        const currentFom = currentValue.fom;
        const previousTom = array[index - 1].tom;

        const dagerMellom = differenceInDays(currentFom, previousTom!);
        return accumulator > dagerMellom ? accumulator : dagerMellom;
      }, 0)
    : 0;
  return antallDagerMellomSykmeldingsperioder;
}
