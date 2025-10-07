/**
 * Validates a number using the mod11 algorithm (Luhn mod 11)
 * Used for Norwegian organization numbers and other identifiers
 */
export default function isMod11Number(number: string): boolean {
  if (!number || number.length < 2) {
    return false;
  }

  if (!/^\d+$/.test(number)) {
    return false;
  }

  const checkDigit = Number.parseInt(number.at(-1)!, 10);

  const numberToCheck = number.substring(0, number.length - 1);

  const sum = numberToCheck
    .split('')
    .reverse()
    .map((value, index) => {
      const digit = Number.parseInt(value, 10);
      const factor = (index % 6) + 2; // Weights: 2,3,4,5,6,7,2,3,4...
      return digit * factor;
    })
    .reduce((previousValue, currentValue) => previousValue + currentValue, 0);

  const remainder = sum % 11;
  let calculatedCheckDigit: number;

  if (remainder === 0) {
    calculatedCheckDigit = 0;
  } else if (remainder === 1) {
    // Mod11 special case: remainder 1 is invalid
    return false;
  } else {
    calculatedCheckDigit = 11 - remainder;
  }

  return checkDigit === calculatedCheckDigit;
}
