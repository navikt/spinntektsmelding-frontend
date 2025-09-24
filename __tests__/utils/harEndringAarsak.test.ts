import { describe, it, expect } from 'vitest';
import { harEndringAarsak } from '../../utils/harEndringAarsak';

type EndringAarsak = { aarsak?: string };

describe('harEndringAarsak', () => {
  it('should return false if input is undefined', () => {
    expect(harEndringAarsak(undefined)).toBe(false);
  });

  it('should return false for an empty array', () => {
    expect(harEndringAarsak([])).toBe(false);
  });

  it('should return false for a single element with empty string', () => {
    const arr: EndringAarsak[] = [{ aarsak: '' }];
    expect(harEndringAarsak(arr)).toBe(false);
  });

  it('should return false for a single element with undefined aarsak', () => {
    const arr: EndringAarsak[] = [{}];
    expect(harEndringAarsak(arr)).toBe(false);
  });

  it('should return true for a single element with non-empty string', () => {
    const arr: EndringAarsak[] = [{ aarsak: 'change' }];
    expect(harEndringAarsak(arr)).toBe(true);
  });

  it('should return true if any element in multiple has non-empty aarsak', () => {
    const arr: EndringAarsak[] = [{ aarsak: '' }, { aarsak: 'something' }, { aarsak: '' }];
    expect(harEndringAarsak(arr)).toBe(true);
  });

  it('should return true for multiple elements all with empty string (edge-case)', () => {
    const arr: EndringAarsak[] = [{ aarsak: '' }, { aarsak: '' }];
    expect(harEndringAarsak(arr)).toBe(true);
  });
});
