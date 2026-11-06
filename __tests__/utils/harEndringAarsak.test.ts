import { describe, it, expect } from 'vitest';
import { harEndringAarsak } from '../../utils/harEndringAarsak';

describe('harEndringAarsak', () => {
  it.each<{ name: string; input: unknown; expected: boolean }>([
    { name: 'undefined input', input: undefined, expected: false },
    { name: 'an empty array', input: [], expected: false },
    { name: 'a single empty string', input: [{ aarsak: '' }], expected: false },
    { name: 'a single missing aarsak', input: [{}], expected: false },
    { name: 'a single non-empty string', input: [{ aarsak: 'Bonus' }], expected: true },
    {
      name: 'a non-empty string among empty strings',
      input: [{ aarsak: '' }, { aarsak: 'Ferie' }, { aarsak: '' }],
      expected: true
    },
    { name: 'multiple empty strings', input: [{ aarsak: '' }, { aarsak: '' }], expected: false },
    { name: 'multiple missing aarsaker', input: [{}, {}], expected: false },
    { name: 'empty and missing aarsaker', input: [{ aarsak: '' }, {}], expected: false },
    { name: 'non-string aarsaker', input: [{ aarsak: null }, { aarsak: 123 }], expected: false },
    { name: 'a non-empty string among missing aarsaker', input: [{}, { aarsak: 'Bonus' }], expected: true }
  ])('should return $expected for $name', ({ input, expected }) => {
    expect(harEndringAarsak(input as Parameters<typeof harEndringAarsak>[0])).toBe(expected);
  });
});
