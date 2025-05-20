import InitieringSchema from '../../schema/InitieringSchema';

import testFnr from '../../mockdata/testFnr';
import testOrganisasjoner from '../../mockdata/testOrganisasjoner';
import { z } from 'zod';

describe('InitieringSchema', () => {
  it('should validate InitieringSchema', () => {
    const data = {
      organisasjonsnummer: testOrganisasjoner[0].organizationNumber,
      fulltNavn: 'Test Testesen',
      personnummer: testFnr.GyldigeFraDolly.TestPerson1
    };

    expect(InitieringSchema.safeParse(data).success).toBe(true);
  });

  it('should validate InitieringSchema with error on fnr', () => {
    const data = {
      organisasjonsnummer: testOrganisasjoner[0].organizationNumber,
      fulltNavn: 'Test Testesen',
      personnummer: testFnr.Ugyldige.UgyldigKontrollSiffer
    };

    const result = InitieringSchema.safeParse(data);

    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error)).toEqual(
      JSON.stringify(
        new z.ZodError([
          {
            code: 'custom',
            message: 'Ugyldig personnummer',
            path: ['personnummer']
          }
        ])
      )
    );
  });

  it('should validate InitieringSchema with error on organisasjonsnummer', () => {
    const data = {
      organisasjonsnummer: '1234566789',
      fulltNavn: 'Test Testesen',
      personnummer: testFnr.GyldigeFraDolly.TestPerson3
    };

    const result = InitieringSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error)).toEqual(
      JSON.stringify(
        new z.ZodError([
          {
            code: 'too_big',
            maximum: 9,
            type: 'string',
            inclusive: true,
            exact: false,
            message: 'Organisasjonsnummeret er for langt, det må være 9 siffer',
            path: ['organisasjonsnummer']
          },
          {
            code: 'custom',
            message: 'Velg arbeidsgiver',
            path: ['organisasjonsnummer']
          }
        ])
      )
    );
  });

  it('should validate InitieringSchema with error on fulltNavn', () => {
    const data = {
      organisasjonsnummer: testOrganisasjoner[0].organizationNumber,
      fulltNavn: '',
      personnummer: testFnr.GyldigeFraDolly.TestPerson2
    };
    const result = InitieringSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error)).toEqual(
      JSON.stringify(
        new z.ZodError([
          {
            code: 'too_small',
            minimum: 1,
            type: 'string',
            inclusive: true,
            exact: false,
            message: 'String must contain at least 1 character(s)',
            path: ['fulltNavn']
          }
        ])
      )
    );
  });
});
