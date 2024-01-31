export default function isMod11Number(number: string) {
  if (!number) {
    return false;
  }
  const checkDigit = parseInt(number.substring(number.length - 1, number.length));
  const numberToCheck = number.substring(0, number.length - 1);
  const sum = numberToCheck
    .split('')
    .reverse()
    .map((value, index) => {
      const digit = parseInt(value);
      const factor = (index % 6) + 2;
      return digit * factor;
    })
    .reduce((previousValue, currentValue) => previousValue + currentValue);
  const calculatedCheckDigit = 11 - (sum % 11);
  return checkDigit === calculatedCheckDigit;
}
