import { IArbeidsforhold, Inntekt } from '../../state/state';
import validerBruttoinntektArbeidsforhold from '../../validators/validerBruttoinntektArbeidsforhold';

const arbeidsforhold: Array<IArbeidsforhold> = [
  {
    arbeidsforholdId: 'spillerid',
    arbeidsforhold: 'Spiller',
    stillingsprosent: 50,
    aktiv: true
  },
  {
    arbeidsforholdId: 'trenerid',
    arbeidsforhold: 'Trener',
    stillingsprosent: 40,
    aktiv: true
  },
  {
    arbeidsforholdId: 'vaktmesterid',
    arbeidsforhold: 'Vaktmester',
    stillingsprosent: 10,
    aktiv: true
  }
];

const inntektsliste: {
  [key: string]: number;
} = {
  spillerid: 3000,
  trenerid: 4000,
  vaktmesterid: 5000
};

describe('validerBruttoinntektArbeidsforhold', () => {
  it('should return an empty array when everything is OK', () => {
    expect(validerBruttoinntektArbeidsforhold(arbeidsforhold, inntektsliste, 13000)).toEqual([]);
  });

  it('should return an error when bruttoinntekt < sum of inntekter ', () => {
    const expected = [
      {
        code: 'SUM_LAVERE_ENN_INNTEKT',
        felt: `bruttoinntekt-endringsbelop-${arbeidsforhold[0].arbeidsforholdId}`
      }
    ];

    expect(validerBruttoinntektArbeidsforhold(arbeidsforhold, inntektsliste, 10000)).toEqual(expected);
  });

  it('should return an empty list when arbeidsforhold is undefined', () => {
    expect(validerBruttoinntektArbeidsforhold(undefined, inntektsliste, 13000)).toEqual([]);
  });

  it('should return an error when inntektsliste is undefined', () => {
    const expected = [
      {
        code: 'BRUTTOINNTEKT_ARBEIDSFORHOLD_MANGLER',
        felt: `bruttoinntekt-endringsbelop-${arbeidsforhold[0].arbeidsforholdId}`
      }
    ];

    expect(validerBruttoinntektArbeidsforhold(arbeidsforhold, undefined, 13000)).toEqual(expected);
  });

  it('should return an error when inntektsliste is empty', () => {
    const expected = [
      {
        code: 'BRUTTOINNTEKT_ARBEIDSFORHOLD_MANGLER',
        felt: `bruttoinntekt-endringsbelop-${arbeidsforhold[0].arbeidsforholdId}`
      }
    ];

    expect(validerBruttoinntektArbeidsforhold(arbeidsforhold, [], 13000)).toEqual(expected);
  });
});
