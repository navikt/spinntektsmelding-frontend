import InitieringSchema from '../../schema/InitieringSchema';

import testFnr from '../../mockdata/testFnr';
import testOrganisasjoner from '../../mockdata/testOrganisasjoner';

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
    expect(result.error?.issues).toEqual([
      {
        code: 'custom',
        message: 'Ugyldig personnummer',
        path: ['personnummer']
      }
    ]);
  });

  it('should validate InitieringSchema with error on organisasjonsnummer', () => {
    const data = {
      organisasjonsnummer: '1234566789',
      fulltNavn: 'Test Testesen',
      personnummer: testFnr.GyldigeFraDolly.TestPerson3
    };

    const result = InitieringSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      {
        code: 'too_big',
        maximum: 9,
        inclusive: true,
        message: 'Organisasjonsnummeret er for langt, det må være 9 siffer',
        origin: 'string',
        path: ['organisasjonsnummer']
      },
      {
        code: 'custom',
        message: 'Velg arbeidsgiver',
        path: ['organisasjonsnummer']
      }
    ]);
  });

  it('should validate InitieringSchema with error on fulltNavn', () => {
    const data = {
      organisasjonsnummer: testOrganisasjoner[0].organizationNumber,
      fulltNavn: '',
      personnummer: testFnr.GyldigeFraDolly.TestPerson2
    };
    const result = InitieringSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      {
        code: 'too_small',
        inclusive: true,
        message: 'Too small: expected string to have >=1 characters',
        minimum: 1,
        origin: 'string',
        path: ['fulltNavn']
      }
    ]);
  });
});
