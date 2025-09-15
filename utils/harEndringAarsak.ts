import { EndringAarsak } from '../validators/validerAapenInnsending';

// Returnerer true dersom det finnes minst én definert aarsak.
export const harEndringAarsak = (endringAarsaker: EndringAarsak[] | undefined): boolean => {
  if (!endringAarsaker || endringAarsaker.length === 0) return false;
  // Filtrer ut entries uten aarsak (undefined). Tom streng forekommer ikke for enums og testes derfor ikke.
  return endringAarsaker.some((e) => e.aarsak !== undefined);
};
