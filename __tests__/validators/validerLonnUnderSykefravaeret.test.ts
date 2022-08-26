import { LonnISykefravaeret, RefusjonskravetOpphoerer } from '../../state/state';
import validerLonnUnderSykefravaeret from '../../validators/validerLonnUnderSykefravaeret';

const arbeidsforhold = ['arbeider'];

const lonnUS: { [key: string]: LonnISykefravaeret } = {
  arbeider: {
    status: 'Nei',
    belop: 123
  }
};

const refusjonskravetOpphoerer: { [key: string]: RefusjonskravetOpphoerer } = {
  arbeider: {
    status: 'Ja',
    opphorsdato: new Date(2002, 1, 2)
  }
};
describe('validerLonnUnderSykefravaeret', () => {
  it('should return an empty array when everything is OK', () => {
    expect(validerLonnUnderSykefravaeret(lonnUS, arbeidsforhold)).toEqual([]);
  });

  it('should return an error when arbeidsforhold is missing', () => {
    const expected = [
      {
        code: 'LONN_UNDER_SYKEFRAVAERET_MANGLER',
        felt: 'lus-radio-ukjent'
      }
    ];

    expect(validerLonnUnderSykefravaeret(lonnUS)).toEqual(expected);
  });

  it('should return an error when sluttdato is missing', () => {
    const inputLUS: { [key: string]: LonnISykefravaeret } = {
      arbeider: {
        status: 'Ja',
        belop: 123
      }
    };

    const expected = [
      {
        code: 'LONN_UNDER_SYKEFRAVAERET_SLUTTDATO_VELG',
        felt: 'lus-sluttdato-velg-arbeider'
      }
    ];

    expect(validerLonnUnderSykefravaeret(inputLUS, arbeidsforhold)).toEqual(expected);
  });

  it('should return an empty array when sluttdato is present and status is Nei', () => {
    const inputLUS: { [key: string]: LonnISykefravaeret } = {
      arbeider: {
        status: 'Ja',
        belop: 123
      }
    };

    expect(validerLonnUnderSykefravaeret(inputLUS, arbeidsforhold, refusjonskravetOpphoerer)).toEqual([]);
  });

  it('should return an error when all params are missing', () => {
    const expected = [
      {
        code: 'LONN_UNDER_SYKEFRAVAERET_MANGLER',
        felt: 'lus-radio-ukjent'
      }
    ];

    expect(validerLonnUnderSykefravaeret()).toEqual(expected);
  });

  it('should return an error when first param is undefined', () => {
    const expected = [
      {
        code: 'LONN_UNDER_SYKEFRAVAERET_MANGLER',
        felt: 'lus-radio-arbeider'
      }
    ];

    expect(validerLonnUnderSykefravaeret(undefined, arbeidsforhold)).toEqual(expected);
  });

  it('should return an error when opphørsdato is missing', () => {
    const inputRefusjonskravetOpphoerer: { [key: string]: RefusjonskravetOpphoerer } = {
      arbeider: {
        status: 'Ja'
      }
    };

    const inputLUS: { [key: string]: LonnISykefravaeret } = {
      arbeider: {
        status: 'Ja',
        belop: 123
      }
    };

    const expected = [
      {
        code: 'LONN_UNDER_SYKEFRAVAERET_SLUTTDATO',
        felt: 'lus-sluttdato-arbeider'
      }
    ];

    expect(validerLonnUnderSykefravaeret(inputLUS, arbeidsforhold, inputRefusjonskravetOpphoerer)).toEqual(expected);
  });

  it('should return an empty array when everything is ok and lus status = Nei', () => {
    const inputLUS: { [key: string]: LonnISykefravaeret } = {
      arbeider: {
        status: 'Nei',
        belop: 123
      }
    };

    expect(validerLonnUnderSykefravaeret(inputLUS, arbeidsforhold, refusjonskravetOpphoerer)).toEqual([]);
  });
});
