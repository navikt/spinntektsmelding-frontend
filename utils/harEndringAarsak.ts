import { EndringAarsak } from '../validators/validerAapenInnsending';

export const harEndringAarsak = (endringAarsaker: EndringAarsak[] | undefined) => {
  if (!endringAarsaker) {
    return false;
  }
  if (endringAarsaker.length === 0) {
    return false;
  }
  if (endringAarsaker.length === 1 && (endringAarsaker[0].aarsak === '' || !endringAarsaker[0].aarsak)) {
    return false;
  }
  return endringAarsaker.some((aarsak) => aarsak.aarsak !== '' || !aarsak.aarsak);
};
