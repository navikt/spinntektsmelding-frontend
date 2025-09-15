import { describe, it, expect } from 'vitest';
import { harEndringAarsak } from '../../utils/harEndringAarsak';
import { EndringAarsak } from '../../validators/validerAapenInnsending';

describe('harEndringAarsak', () => {
  it('should return false if input is undefined', () => {
    expect(harEndringAarsak(undefined)).toBe(false);
  });

  it('should return false for an empty array', () => {
    expect(harEndringAarsak([])).toBe(false);
  });

  it('should return false for a single element with undefined aarsak', () => {
    const arr = [{}] as unknown as EndringAarsak[]; // intentionally malformed
    expect(harEndringAarsak(arr)).toBe(false);
  });

  it('should return true for a single element with defined aarsak', () => {
    const arr = [{ aarsak: 'Bonus' }] as EndringAarsak[]; // use a valid discriminant
    expect(harEndringAarsak(arr)).toBe(true);
  });

  it('should return true if any element in multiple has defined aarsak', () => {
    const arr = [{}, { aarsak: 'Bonus' }] as unknown as EndringAarsak[];
    expect(harEndringAarsak(arr)).toBe(true);
  });

  it('should return false for multiple elements all with undefined (edge-case)', () => {
    const arr = [{ aarsak: undefined }, { aarsak: undefined }] as unknown as EndringAarsak[];
    expect(harEndringAarsak(arr)).toBe(false);
  });
});
