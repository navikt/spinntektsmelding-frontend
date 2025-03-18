import { LonnISykefravaeret } from '../../state/state';
import validerLonnUnderSykefravaeret from '../../validators/validerLonnUnderSykefravaeret';
import { describe } from 'vitest';
const arbeidsforhold = ['arbeider'];

const lonnUS: LonnISykefravaeret = {
  status: 'Nei',
  beloep: 123
};

describe.concurrent('validerLonnUnderSykefravaeret', () => {
  it('should return an empty array when everything is OK', () => {
    expect(validerLonnUnderSykefravaeret(lonnUS)).toEqual([]);
  });

  it('should return an error when sluttdato is missing', () => {
    const inputLUS: LonnISykefravaeret = {
      status: 'Ja',
      beloep: 123
    };

    expect(validerLonnUnderSykefravaeret(inputLUS)).toEqual([]);
  });

  it('should return an empty array when sluttdato is present and status is Nei', () => {
    const inputLUS: LonnISykefravaeret = {
      status: 'Ja',
      beloep: 123
    };

    expect(validerLonnUnderSykefravaeret(inputLUS)).toEqual([]);
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
    const inputLUS: LonnISykefravaeret = {
      status: 'Ja',
      beloep: 123
    };

    const expected: any = [];

    expect(validerLonnUnderSykefravaeret(inputLUS)).toEqual(expected);
  });

  it('should return an empty array when everything is ok and lus status = Nei', () => {
    const inputLUS: LonnISykefravaeret = {
      status: 'Nei',
      beloep: 123
    };

    expect(validerLonnUnderSykefravaeret(inputLUS)).toEqual([]);
  });

  it('should return an error when beløp is missing and and lus status = Ja', () => {
    const inputLUS: LonnISykefravaeret = {
      status: 'Ja'
    };

    const expected = [
      {
        code: 'LONN_UNDER_SYKEFRAVAERET_BELOP',
        felt: 'refusjon.beloepPerMaaned'
      }
    ];

    expect(validerLonnUnderSykefravaeret(inputLUS)).toEqual(expected);
  });

  it('should return an error when refusjonsbeløp higer than bruttoinntekt', () => {
    const inputLUS: LonnISykefravaeret = {
      status: 'Ja',
      beloep: 1000111
    };

    const expected = [
      {
        code: 'BELOP_OVERSTIGER_BRUTTOINNTEKT',
        felt: 'refusjon.beloepPerMaaned'
      }
    ];

    const bruttoInntekt = 1000000;

    expect(validerLonnUnderSykefravaeret(inputLUS, bruttoInntekt)).toEqual(expected);
  });

  it('should not return an error when refusjonsbeløp lower than bruttoinntekt', () => {
    const inputLUS: LonnISykefravaeret = {
      status: 'Ja',
      beloep: 99999
    };

    const expected: any = [];

    const bruttoInntekt = 1000000;

    expect(validerLonnUnderSykefravaeret(inputLUS, bruttoInntekt)).toEqual(expected);
  });

  it('should not return an error when refusjonsbeløp is higher than bruttoinntekt and there is updated submission', () => {
    const inputLUS: LonnISykefravaeret = {
      status: 'Ja',
      beloep: 99999
    };

    const expected: any = [
      {
        code: 'BELOP_OVERSTIGER_BRUTTOINNTEKT',
        felt: 'refusjon.beloepPerMaaned'
      }
    ];

    const bruttoInntekt = 9000;

    expect(validerLonnUnderSykefravaeret(inputLUS, bruttoInntekt)).toEqual(expected);
  });

  it('should return an error when refusjonsbeløp is null', () => {
    const inputLUS: LonnISykefravaeret = {
      status: 'Ja',
      beloep: null
    };

    const expected: any = [
      {
        code: 'LONN_UNDER_SYKEFRAVAERET_BELOP',
        felt: 'refusjon.beloepPerMaaned'
      }
    ];

    const bruttoInntekt = 9000;

    expect(validerLonnUnderSykefravaeret(inputLUS, bruttoInntekt)).toEqual(expected);
  });
});
