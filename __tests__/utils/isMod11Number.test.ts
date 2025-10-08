import isMod11Number from '../../utils/isMod11Number';

describe('isMod11Number', () => {
  it('returns true for a valid mod11 number', () => {
    const validNumber = '1234567892';
    expect(isMod11Number(validNumber)).toBe(true);
  });

  it('returns false for an invalid mod11 number', () => {
    const invalidNumber = '9876543210';
    expect(isMod11Number(invalidNumber)).toBe(false);
  });

  it('returns false for an empty string', () => {
    const emptyString = '';
    expect(isMod11Number(emptyString)).toBe(false);
  });

  it('returns false for a string with non-numeric characters', () => {
    const nonNumericString = '123abc';
    expect(isMod11Number(nonNumericString)).toBe(false);
  });

  it('returns false for a string with a check digit that does not match the calculated check digit', () => {
    const mismatchedCheckDigit = '1234567891';
    expect(isMod11Number(mismatchedCheckDigit)).toBe(false);
  });

  // Test: returns true when the weighted sum of digits modulo 11 is 0 and the check digit is 0
  it('returns true when the weighted sum modulo 11 is 0 and the check digit is 0', () => {
    // Example: "00000000" has a weighted sum of 0, so remainder is 0 and check digit is 0
    const numberWithRemainderZero = '00000000';
    expect(isMod11Number(numberWithRemainderZero)).toBe(true);
  });

  // Test for remainder === 1 → return false
  it('returns false when remainder is 1 (impossible mod11 case)', () => {
    const numberWithRemainderOne = '40000001'; // Last digit is check digit, doesn't matter
    expect(isMod11Number(numberWithRemainderOne)).toBe(false);
  });

  it('returns false when remainder is 1 with another example', () => {
    const anotherRemainderOne = '13000009'; // Any check digit works since it will fail
    expect(isMod11Number(anotherRemainderOne)).toBe(false);
  });

  it('returns true for valid Norwegian organization number', () => {
    const navOrgNr = '889640782';
    expect(isMod11Number(navOrgNr)).toBe(true);
  });

  it('returns true for another valid number with remainder 0', () => {
    // 923609016 is a valid Norwegian organization number with correct mod11 check digit.
    const validOrgNr = '923609016';
    expect(isMod11Number(validOrgNr)).toBe(true);
  });
});
