import { LonnISykefravaeret, RefusjonskravetOpphoerer } from '../../state/state';
import validerLonnISykefravaeret from '../../validators/validerLonnISykefravaeret';

const lonnUS: LonnISykefravaeret = {
  status: 'Nei',
  beloep: 123
};

describe('validerLonnISykefravaeret', () => {
  it('should return an empty array when everything is OK', () => {
    expect(validerLonnISykefravaeret(lonnUS)).toEqual([]);
  });

  it('should return an error when beloep is missing', () => {
    const inputLUS: LonnISykefravaeret = {
      status: 'Ja'
    };

    const expected = [
      {
        code: 'MANGLER_BELOP_LONN_I_SYKEFRAVAERET',
        felt: ''
      }
    ];

    expect(validerLonnISykefravaeret(inputLUS)).toEqual(expected);
  });

  it('should return an error when all params are missing', () => {
    const expected = [
      {
        code: 'MANGLER_VALG_AV_LONN_I_SYKEFRAVAERET',
        felt: ''
      }
    ];

    expect(validerLonnISykefravaeret()).toEqual(expected);
  });

  it('should return an error when status is missing', () => {
    const inputLUS: LonnISykefravaeret = {
      beloep: 123
    };

    const expected = [
      {
        code: 'MANGLER_VALG_AV_LONN_I_SYKEFRAVAERET',
        felt: ''
      }
    ];

    expect(validerLonnISykefravaeret(inputLUS)).toEqual(expected);
  });

  it('should return an error when beloep is 0', () => {
    const inputLUS: LonnISykefravaeret = {
      status: 'Ja',
      beloep: 0
    };

    const expected = [
      {
        code: 'MANGLER_BELOP_LONN_I_SYKEFRAVAERET',
        felt: ''
      }
    ];

    expect(validerLonnISykefravaeret(inputLUS)).toEqual(expected);
  });

  it('should return an empty array when status is Nei', () => {
    const inputLUS: LonnISykefravaeret = {
      status: 'Nei',
      beloep: 0
    };

    const expected: unknown = [];

    expect(validerLonnISykefravaeret(inputLUS)).toEqual(expected);
  });

  it('should return an empty array when status is Ja and beloep is not 0', () => {
    const inputLUS: LonnISykefravaeret = {
      status: 'Ja',
      beloep: 123
    };

    const expected: unknown = [];

    expect(validerLonnISykefravaeret(inputLUS)).toEqual(expected);
  });
});
