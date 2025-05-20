import { TidPeriodeSchema } from '../schema/TidPeriodeSchema';

function sorterFomSynkende<T extends TidPeriodeSchema>(a: T, b: T): number {
  if (!a.fom || !b.fom) {
    return 0;
  }
  if (a.fom < b.fom) {
    return 1;
  } else if (a.fom > b.fom) {
    return -1;
  }
  return 0;
}

export default sorterFomSynkende;
