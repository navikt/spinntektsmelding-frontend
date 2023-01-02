import { LonnISykefravaeret, RefusjonskravetOpphoerer } from '../../state/state';
import validerLonnISykefravaeret from '../../validators/validerLonnISykefravaeret';

const lonnUS: LonnISykefravaeret = {
  status: 'Nei',
  belop: 123
};

describe('validerLonnISykefravaeret', () => {
  it('should return an empty array when everything is OK', () => {
    expect(validerLonnISykefravaeret(lonnUS)).toEqual([]);
  });

  it('should return an error when belop is missing', () => {
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
});
