import { Periode } from '../state/state';

export default function validerPeriode(perioder: Array<Periode>): boolean {
  let isValid = true;
  perioder.forEach((periode) => {
    if (!periode.fra) {
      isValid = false;
    }

    if (!periode.til) {
      isValid = false;
    }
  });
  return isValid;
}
