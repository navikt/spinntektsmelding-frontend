import { describe, it, expect } from 'vitest';
import isObject from '../../utils/isObject';

describe('isObject', () => {
  it('should return true for an object', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ key: 'value' })).toBe(true);
  });

  it('should return false for null', () => {
    expect(isObject(null)).toBe(false);
  });

  it('should return false for an array', () => {
    expect(isObject([])).toBe(false);
  });

  it('should return false for a string', () => {
    expect(isObject('string')).toBe(false);
  });

  it('should return false for a number', () => {
    expect(isObject(123)).toBe(false);
  });

  it('should return false for a boolean', () => {
    expect(isObject(true)).toBe(false);
    expect(isObject(false)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isObject(undefined)).toBe(false);
  });
});
