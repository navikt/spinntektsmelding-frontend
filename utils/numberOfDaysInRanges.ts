import { Periode } from '../state/state';
import { FravaersPeriode } from './finnBestemmendeFravaersdag';
import numberOfDaysInRange from './numberOfDaysInRange';

export default function numberOfDaysInRanges(
  perioder: Array<Periode | undefined> | Array<FravaersPeriode | undefined>
): number {
  let antallDager = 0;
  perioder.forEach((periode) => {
    antallDager += periode ? numberOfDaysInRange(periode.fom!, periode.tom!) : 0;
  });

  return antallDager;
}
