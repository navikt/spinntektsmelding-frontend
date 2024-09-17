import { Periode } from '../state/state';
import numberOfDaysInRange from './numberOfDaysInRange';

export default function numberOfDaysInRanges(perioder: Array<{ fom: Date; tom: Date } | undefined>): number {
  let antallDager = 0;
  perioder.forEach((periode) => {
    antallDager += periode ? numberOfDaysInRange(periode.fom!, periode.tom!) : 0;
  });

  return antallDager;
}
