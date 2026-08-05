import { isTlfNumber } from '../../utils/isTlfNumber';

describe('isTlfNumber', () => {
  it('should return true for valid phone numbers', () => {
    expect(isTlfNumber('+1234567890')).toBe(true);
    expect(isTlfNumber('001234567890')).toBe(true);
    expect(isTlfNumber('12345678')).toBe(true);
    expect(isTlfNumber('123456789012345')).toBe(true);
    expect(isTlfNumber('+123456789012345')).toBe(true);
    expect(isTlfNumber('00123456789012345')).toBe(true);
  });

  it('should return false for invalid phone numbers', () => {
    expect(isTlfNumber('123')).toBe(false);
    expect(isTlfNumber('1234567890123456')).toBe(false);
    expect(isTlfNumber('00123456789012345678')).toBe(false);
    expect(isTlfNumber('+123456789012345678')).toBe(false);
    expect(isTlfNumber('abc')).toBe(false);
  });
});
