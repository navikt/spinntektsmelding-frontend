import { tidPeriode } from './finnBestemmendeFravaersdag';

function sorterFomSynkende<T extends tidPeriode>(a: T, b: T): number {
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
