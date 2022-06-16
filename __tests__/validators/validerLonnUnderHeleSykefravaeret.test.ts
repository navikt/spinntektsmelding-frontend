import validerLonnUnderHeleSykefravaeret from '../../validators/validerLonnUnderHeleSykefravaeret';

describe('validerLonnUnderHeleSykefravaeret', () => {
  it('should return true when status is Ja', () => {
    expect(validerLonnUnderHeleSykefravaeret({ status: 'Ja' })).toBe(true);
  });

  it('should return true when status is Nei and begrunnelse is given', () => {
    expect(validerLonnUnderHeleSykefravaeret({ status: 'Nei', belop: 5 })).toBe(true);
  });

  it('should return false when status is Nei and begrunnelse is not given', () => {
    expect(validerLonnUnderHeleSykefravaeret({ status: 'Nei' })).toBe(false);
  });

  it('should return false when no input is given', () => {
    expect(validerLonnUnderHeleSykefravaeret()).toBe(false);
  });
});
