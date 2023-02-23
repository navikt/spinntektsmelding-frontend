import { LonnISykefravaeret, RefusjonskravetOpphoerer } from '../../state/state';
import validerLonnUnderSykefravaeret from '../../validators/validerLonnUnderSykefravaeret';

const arbeidsforhold = ['arbeider'];

const lonnUS: LonnISykefravaeret = {
  status: 'Nei',
  belop: 123
};

const refusjonskravetOpphoerer: RefusjonskravetOpphoerer = {
  status: 'Ja',
  opphorsdato: new Date(2002, 1, 2)
};
describe('validerLonnUnderSykefravaeret', () => {
  it('should return an empty array when everything is OK', () => {
    expect(validerLonnUnderSykefravaeret(lonnUS)).toEqual([]);
  });

  it('should return an error when sluttdato is missing', () => {
    const inputLUS: LonnISykefravaeret = {
      status: 'Ja',
      belop: 123
    };

    const expected = [
      {
        code: 'LONN_UNDER_SYKEFRAVAERET_SLUTTDATO_VELG',
        felt: 'lus-sluttdato-velg'
      }
    ];

    expect(validerLonnUnderSykefravaeret(inputLUS)).toEqual(expected);
  });

  it('should return an empty array when sluttdato is present and status is Nei', () => {
    const inputLUS: LonnISykefravaeret = {
      status: 'Ja',
      belop: 123
    };

    expect(validerLonnUnderSykefravaeret(inputLUS, refusjonskravetOpphoerer)).toEqual([]);
  });

  it('should return an error when all params are missing', () => {
    const expected = [
      {
        code: 'LONN_UNDER_SYKEFRAVAERET_MANGLER',
        felt: 'lus-radio'
      }
    ];

    expect(validerLonnUnderSykefravaeret()).toEqual(expected);
  });

  it('should return an error when first param is undefined', () => {
    const expected = [
      {
        code: 'LONN_UNDER_SYKEFRAVAERET_MANGLER',
        felt: 'lus-radio'
      }
    ];

    expect(validerLonnUnderSykefravaeret()).toEqual(expected);
  });

  it('should return an error when opphørsdato is missing', () => {
    const inputRefusjonskravetOpphoerer: RefusjonskravetOpphoerer = {
      status: 'Ja'
    };

    const inputLUS: LonnISykefravaeret = {
      status: 'Ja',
      belop: 123
    };

    const expected = [
      {
        code: 'LONN_UNDER_SYKEFRAVAERET_SLUTTDATO',
        felt: 'lus-sluttdato'
      }
    ];

    expect(validerLonnUnderSykefravaeret(inputLUS, inputRefusjonskravetOpphoerer)).toEqual(expected);
  });

  it('should return an empty array when everything is ok and lus status = Nei', () => {
    const inputLUS: LonnISykefravaeret = {
      status: 'Nei',
      belop: 123
    };

    expect(validerLonnUnderSykefravaeret(inputLUS, refusjonskravetOpphoerer)).toEqual([]);
  });

  it('should return an error when beløp is missing and and lus status = Ja', () => {
    const inputLUS: LonnISykefravaeret = {
      status: 'Ja'
    };

    const expected = [
      {
        code: 'LONN_UNDER_SYKEFRAVAERET_BELOP',
        felt: 'lus-input'
      }
    ];

    expect(validerLonnUnderSykefravaeret(inputLUS, refusjonskravetOpphoerer)).toEqual(expected);
  });
});
