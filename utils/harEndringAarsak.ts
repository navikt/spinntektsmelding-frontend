import { EndringAarsak } from '../validators/validerAapenInnsending';

export const harEndringAarsak = (endringAarsaker: EndringAarsak[] | undefined): boolean =>
  endringAarsaker?.some(({ aarsak }) => typeof aarsak === 'string' && aarsak.length > 0) ?? false;
