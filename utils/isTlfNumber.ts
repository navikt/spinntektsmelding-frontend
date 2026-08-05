export function isTlfNumber(tlf: string): boolean {
  const tlfRegex = /^(\+\d{10,17}|00\d{10,17}|\d{8,15})$/;
  return tlfRegex.test(tlf);
}
