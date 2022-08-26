import { Inntekt } from '../../state/state';
import validerBruttoinntekt from '../../validators/validerBruttoinntekt';

describe('validerBruttoinntekt', () => {
  it('should return an empty array when everything is OK', () => {
    const input: Inntekt = {
      bekreftet: true,
      bruttoInntekt: 123,
      manueltKorrigert: false
    };

    expect(validerBruttoinntekt(input)).toEqual([]);
  });

  it('should return an error when bruttoinntekt < 0 ', () => {
    const input: Inntekt = {
      bekreftet: true,
      bruttoInntekt: -1,
      manueltKorrigert: false
    };

    const expected = [
      {
        code: 'BRUTTOINNTEKT_MANGLER',
        felt: 'bruttoinntekt-endringsbelop'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });

  it('should return an error when not confirmed', () => {
    const input: Inntekt = {
      bekreftet: false,
      bruttoInntekt: 123,
      manueltKorrigert: false
    };

    const expected = [
      {
        code: 'IKKE_BEKREFTET',
        felt: 'bruttoinntektbekreft'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });

  it('should return an error when not confirmed', () => {
    const input: Inntekt = {
      bekreftet: true,
      bruttoInntekt: 123,
      manueltKorrigert: true
    };

    const expected = [
      {
        code: 'ENDRINGSAARSAK_MANGLER',
        felt: 'bruttoinntekt-endringsaarsak'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });

  it('should return an error when no reason given', () => {
    const input: Inntekt = {
      bekreftet: true,
      bruttoInntekt: 123,
      manueltKorrigert: true,
      endringsaarsak: ''
    };

    const expected = [
      {
        code: 'ENDRINGSAARSAK_MANGLER',
        felt: 'bruttoinntekt-endringsaarsak'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });

  it('should return false when stuff is no reason for change given', () => {
    const expected = [
      {
        code: 'INNTEKT_MANGLER',
        felt: 'bruttoinntekt'
      }
    ];

    expect(validerBruttoinntekt()).toEqual(expected);
  });
});
