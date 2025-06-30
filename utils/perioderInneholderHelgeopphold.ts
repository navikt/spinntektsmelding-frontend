import { differenceInDays } from 'date-fns/differenceInDays';
import { Periode } from '../state/state';
import sorterFomStigende from './sorterFomStigende';

const perioderInneholderHelgeopphold = (perioder: Periode[]) => {
  if (!perioder || perioder.length === 0) return false;
  const problem = perioder.find((p) => !p.fom || !p.tom);
  if (problem) return false;

  const sortertePerioder = [...perioder].sort(sorterFomStigende);
  for (let index = 1; index < sortertePerioder.length; index++) {
    const forrigePeriode = sortertePerioder[index - 1];
    const periode = sortertePerioder[index];

    if (!forrigePeriode?.tom || !periode?.fom) break;

    if (
      differenceInDays(periode.fom, forrigePeriode.tom) > 1 &&
      differenceInDays(periode.fom, forrigePeriode.tom) <= 3 &&
      [1, 0].includes(periode.fom?.getDay()) &&
      [5, 6].includes(forrigePeriode.tom.getDay())
    ) {
      return true;
    }
  }
  return false;
};

export default perioderInneholderHelgeopphold;
