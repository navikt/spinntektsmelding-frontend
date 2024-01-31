export function isTlfNumber(tlf: string): boolean {
  const tlfRegex = /^(\+\d{10}|00\d{10}|\d{8})$/;
  return tlfRegex.test(tlf);
}
