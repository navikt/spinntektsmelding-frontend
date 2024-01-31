import isMod10Number from '../../utils/isMod10Number';

describe('isMod10Number', () => {
  it('returns true for a valid mod10 number', () => {
    const validNumber = '1234567892';
    expect(isMod10Number(validNumber)).toBe(true);
  });

  it('returns false for an invalid mod10 number', () => {
    const invalidNumber = '9876543210';
    expect(isMod10Number(invalidNumber)).toBe(false);
  });

  it('returns false for an empty string', () => {
    const emptyString = '';
    expect(isMod10Number(emptyString)).toBe(false);
  });

  it('returns false for a string with non-numeric characters', () => {
    const nonNumericString = '123abc';
    expect(isMod10Number(nonNumericString)).toBe(false);
  });

  it('returns false for a string with a check digit that does not match the calculated check digit', () => {
    const mismatchedCheckDigit = '1234567891';
    expect(isMod10Number(mismatchedCheckDigit)).toBe(false);
  });
});
