import toInteger from '../../utils/toInteger';

describe('toInteger', () => {
  it('should return NaN for null', () => {
    expect(toInteger(null)).toBe(NaN);
  });

  it('should return NaN for true', () => {
    expect(toInteger(true)).toBe(NaN);
  });

  it('should return NaN for false', () => {
    expect(toInteger(false)).toBe(NaN);
  });

  it('should return the integer value for a valid number', () => {
    expect(toInteger(42)).toBe(42);
  });

  it('should return the integer value for a valid negative number', () => {
    expect(toInteger(-3.14)).toBe(-3);
  });

  it('should return the integer value for a valid positive number', () => {
    expect(toInteger(3.14)).toBe(3);
  });

  it('should return NaN for a non-numeric string', () => {
    expect(toInteger('abc')).toBe(NaN);
  });

  it('should return the integer value for a numeric string', () => {
    expect(toInteger('42')).toBe(42);
  });

  it('should return NaN for an empty string', () => {
    expect(toInteger('')).toBe(NaN);
  });

  it('should return NaN for an array', () => {
    expect(toInteger([1, 2, 3])).toBe(NaN);
  });

  it('should return NaN for an object', () => {
    expect(toInteger({ foo: 'bar' })).toBe(NaN);
  });

  it('should return NaN for undefined', () => {
    expect(toInteger(undefined)).toBe(NaN);
  });

  it('should return NaN for NaN', () => {
    expect(toInteger(NaN)).toBe(NaN);
  });
});
