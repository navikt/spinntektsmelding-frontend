import { EndringAarsak } from '../validators/validerAapenInnsending';

export default function maserEndringAarsaker(
  endringAarsak: EndringAarsak,
  endringAarsaker: EndringAarsak[]
): EndringAarsak[] {
  if (endringAarsaker && endringAarsaker.length > 0) {
    return endringAarsaker;
  }

  return [endringAarsak];
}
