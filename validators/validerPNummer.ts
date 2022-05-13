import validator from '@navikt/fnrvalidator';

export function validerPNummer(pnummer: string): boolean {
  const validationResult: ValidationResult = validator.fnr(pnummer);

  return validationResult.status === 'valid';
}
