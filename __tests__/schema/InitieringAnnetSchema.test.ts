import { describe, it, expect } from 'vitest';
import { OrganisasjonsnummerSchema } from '../../schema/OrganisasjonsnummerSchema';
import { InitieringAnnetSchema } from '../../schema/InitieringAnnetSchema';

const validOrgNumber = '123456785';

describe('InitieringAnnetSchema', () => {
  it('parses valid object with fulltNavn and organisasjonsnummer', () => {
    // ensure validOrgNumber satisfies OrganisasjonsnummerSchema
    OrganisasjonsnummerSchema.parse(validOrgNumber);

    const data = {
      fulltNavn: 'Ola Nordmann',
      organisasjonsnummer: validOrgNumber
    };
    const result = InitieringAnnetSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(data);
    }
  });

  it('parses valid object without fulltNavn', () => {
    OrganisasjonsnummerSchema.parse(validOrgNumber);

    const data = {
      organisasjonsnummer: validOrgNumber
    };
    const result = InitieringAnnetSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.organisasjonsnummer).toBe(validOrgNumber);
      expect(result.data.fulltNavn).toBeUndefined();
    }
  });

  it('fails when fulltNavn is not a string', () => {
    // @ts-expect-error invalid type
    const data = {
      fulltNavn: 123,
      organisasjonsnummer: validOrgNumber
    };
    const result = InitieringAnnetSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('fails when organisasjonsnummer is missing', () => {
    // @ts-expect-error missing required field
    const data = {
      fulltNavn: 'Test Bruker'
    };
    const result = InitieringAnnetSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('fails when organisasjonsnummer is invalid', () => {
    const data = {
      // invalid format
      organisasjonsnummer: 'invalid'
    };
    const result = InitieringAnnetSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
