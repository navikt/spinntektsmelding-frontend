import { Periode } from '../state/state';
import { FravaersPeriode } from './finnBestemmendeFravaersdag';
import numberOfDaysInRange from './numberOfDaysInRange';

export default function numberOfDaysInRanges(perioder: Array<Periode> | Array<FravaersPeriode>): number {
  let antallDager = 0;
  perioder.forEach((periode) => {
    antallDager += numberOfDaysInRange(periode.fom!, periode.tom!);
  });

  return antallDager;
}
