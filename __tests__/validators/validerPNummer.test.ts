import { validerPNummer } from '../../validators/validerPNummer';
import testFnr from '../../mockdata/testFnr';

describe('validerPNummer', () => {
  it('should validate a correct pnumber', () => {
    expect(validerPNummer(testFnr.GyldigeFraDolly.TestPerson1)).toBeTruthy();
  });

  it('should validate an incorrect kontrollsiffer in pnumber', () => {
    expect(validerPNummer(testFnr.Ugyldige.UgyldigKontrollSiffer)).toBeFalsy();
  });
});
