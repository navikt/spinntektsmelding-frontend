import validerLonnTilArbeidstakerIArbeidsgiverperioden from '../../validators/validerLonnTilArbeidstakerIArbeidsgiverperioden';
import { expect, it, describe } from 'vitest';

describe('validerLonnTilArbeidstakerIArbeidsgiverperioden', () => {
  it('should return true when status is Ja', () => {
    expect(validerLonnTilArbeidstakerIArbeidsgiverperioden({ status: 'Ja' })).toBe(true);
  });

  it('should return true when status is Nei and begrunnelse is given', () => {
    expect(validerLonnTilArbeidstakerIArbeidsgiverperioden({ status: 'Nei', begrunnelse: 'En begrunnelse' })).toBe(
      true
    );
  });

  it('should return false when status is Nei and begrunnelse is not given', () => {
    expect(validerLonnTilArbeidstakerIArbeidsgiverperioden({ status: 'Nei' })).toBe(false);
  });

  it('should return false when no input is given', () => {
    expect(validerLonnTilArbeidstakerIArbeidsgiverperioden()).toBe(false); // eslint-disable-line  Tester uten param, selv om det ikke er lovlig typescript kode
  });
});
