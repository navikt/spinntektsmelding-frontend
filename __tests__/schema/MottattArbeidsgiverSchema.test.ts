import { describe, test, expect } from 'vitest';
import { MottattArbeidsgiverSchema } from '../../schema/MottattArbeidsgiverSchema';

describe('MottattArbeidsgiverSchema', () => {
  const validBase = {
    name: 'ACME Corp',
    type: 'Enterprise',
    parentOrganizationNumber: null,
    organizationForm: 'KOMM',
    organizationNumber: '810007672',
    socialSecurityNumber: '12345678901',
    status: 'Active'
  };

  test('parses a fully valid object', () => {
    expect(() => MottattArbeidsgiverSchema.parse(validBase)).not.toThrow();
    const parsed = MottattArbeidsgiverSchema.parse(validBase);
    expect(parsed).toEqual(validBase);
  });

  test('accepts non-null parentOrganizationNumber', () => {
    const data = { ...validBase, parentOrganizationNumber: '987654321' };
    expect(() => MottattArbeidsgiverSchema.parse(data)).not.toThrow();
    expect(MottattArbeidsgiverSchema.parse(data).parentOrganizationNumber).toBe('987654321');
  });

  test('accepts null for socialSecurityNumber', () => {
    const data = { ...validBase, socialSecurityNumber: null };
    expect(() => MottattArbeidsgiverSchema.parse(data)).not.toThrow();
    expect(MottattArbeidsgiverSchema.parse(data).socialSecurityNumber).toBeNull();
  });

  test('rejects when a required field is missing', () => {
    // omit "name"
    // @ts-expect-error testing invalid input
    const { name, ...missingName } = validBase;
    expect(() => MottattArbeidsgiverSchema.parse(missingName)).toThrow();
  });

  test('rejects wrong types', () => {
    const badData = {
      ...validBase,
      // @ts-expect-error testing invalid input
      organizationNumber: 12345
    };
    expect(() => MottattArbeidsgiverSchema.parse(badData)).toThrow();
  });

  test('rejects extra nested wrong type', () => {
    const badData = {
      ...validBase,
      // @ts-expect-error testing invalid input
      parentOrganizationNumber: 456
    };
    expect(() => MottattArbeidsgiverSchema.parse(badData)).toThrow();
  });
});
