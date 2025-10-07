import isMod11Number from '../../utils/isMod11Number';

describe('isMod11Number', () => {
  it('returns true for a valid mod10 number', () => {
    const validNumber = '1234567892';
    expect(isMod11Number(validNumber)).toBe(true);
  });

  it('returns false for an invalid mod10 number', () => {
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
});
