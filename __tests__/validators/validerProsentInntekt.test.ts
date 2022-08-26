import validerProsentInntekt from '../../validators/validerProsentInntekt';

const aktuelleArbeidsforhold: Array<string> = ['arbeider', 'disponent'];

describe('validerProsentInntekt', () => {
  it('should return an empty array when everything is OK', () => {
    const lonnPrArbeidsforhold = {
      arbeider: 30000,
      disponent: 20000
    };
    expect(validerProsentInntekt(aktuelleArbeidsforhold, 50000, lonnPrArbeidsforhold)).toEqual([]);
  });

  it('should return an empty array when everything is OK and only one arbeidsforhold gets paid', () => {
    const lonnPrArbeidsforhold = {
      arbeider: 30000
    };
    expect(validerProsentInntekt(aktuelleArbeidsforhold, 50000, lonnPrArbeidsforhold)).toEqual([]);
  });

  it('should return an empty array when everything is OK and both arbeidsforhold gets less paid than the bruttoInntekt', () => {
    const lonnPrArbeidsforhold = {
      arbeider: 25000,
      disponent: 20000
    };
    expect(validerProsentInntekt(aktuelleArbeidsforhold, 50000, lonnPrArbeidsforhold)).toEqual([]);
  });

  it('should return an error when lønn for arbeidsforhold is higher than bruttoInntekt', () => {
    const lonnPrArbeidsforhold = {
      arbeider: 35000,
      disponent: 30000
    };
    const expected = [
      {
        code: 'SUM_LAVERE_ENN_INNTEKT',
        felt: 'bruttoinntekt-endringsbelop-arbeider'
      }
    ];

    expect(validerProsentInntekt(aktuelleArbeidsforhold, 50000, lonnPrArbeidsforhold)).toEqual(expected);
  });
});
