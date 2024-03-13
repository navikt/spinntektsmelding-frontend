import { LonnIArbeidsgiverperioden } from '../../state/state';
import parseIsoDate from '../../utils/parseIsoDate';
import validerLonnIArbeidsgiverperioden from '../../validators/validerLonnIArbeidsgiverperioden';

describe('validerLonnIArbeidsgiverperioden', () => {
  it('should return an empty array when everything is OK', () => {
    const input: LonnIArbeidsgiverperioden = {
      status: 'Ja'
    };

    const arbeidsgiverperioder = [{ fom: parseIsoDate('2020-01-01'), tom: parseIsoDate('2020-01-01'), id: '1' }];

    expect(validerLonnIArbeidsgiverperioden(input)).toEqual([
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_UTEN_ARBEIDSGIVERPERIODE',
        felt: 'lia-radio'
      }
    ]);
  });

  it('should return an empty array when everything is OK', () => {
    const input = undefined;

    const expected = [
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_MANGLER',
        felt: 'lia-radio'
      }
    ];

    expect(validerLonnIArbeidsgiverperioden(input)).toEqual(expected);
  });

  it('should return an error when status is Nei and begrunnelse is missing', () => {
    const input: LonnIArbeidsgiverperioden = {
      status: 'Nei'
    };

    const expected = [
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE',
        felt: 'lia-select'
      },
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BELOP',
        felt: 'lus-uua-input'
      }
    ];

    expect(validerLonnIArbeidsgiverperioden(input)).toEqual(expected);
  });

  it('should return an error when status is Nei and begrunnelse is empty', () => {
    const input: LonnIArbeidsgiverperioden = {
      status: 'Nei',
      begrunnelse: ''
    };

    const expected = [
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE',
        felt: 'lia-select'
      },
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BELOP',
        felt: 'lus-uua-input'
      }
    ];

    expect(validerLonnIArbeidsgiverperioden(input)).toEqual(expected);
  });

  it('should return an error when status is Nei and utbetalt is negative', () => {
    const input: LonnIArbeidsgiverperioden = {
      status: 'Nei',
      utbetalt: -1
    };

    const expected = [
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE',
        felt: 'lia-select'
      },
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BELOP',
        felt: 'lus-uua-input'
      }
    ];

    expect(validerLonnIArbeidsgiverperioden(input)).toEqual(expected);
  });

  it('should return an error when status is Nei and utbetalt is positive, not regarding beloep', () => {
    const input: LonnIArbeidsgiverperioden = {
      status: 'Nei',
      utbetalt: 1234
    };

    const expected = [
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE',
        felt: 'lia-select'
      }
    ];

    expect(validerLonnIArbeidsgiverperioden(input)).toEqual(expected);
  });

  it('should not return an error when status is Nei and utbetalt is positive and begrunnelse is set', () => {
    const input: LonnIArbeidsgiverperioden = {
      status: 'Nei',
      utbetalt: 1234,
      begrunnelse: 'test'
    };

    const expected = [];

    expect(validerLonnIArbeidsgiverperioden(input)).toEqual(expected);
  });

  it('should return an error when status is Ja and arbeidsgiverperioder is missing', () => {
    const input: LonnIArbeidsgiverperioden = {
      status: 'Ja'
    };

    const expected = [
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_UTEN_ARBEIDSGIVERPERIODE',
        felt: 'lia-radio'
      }
    ];

    expect(validerLonnIArbeidsgiverperioden(input, [])).toEqual(expected);
  });

  it('should return an error when status is Ja and arbeidsgiverperioder has empty dates', () => {
    const input: LonnIArbeidsgiverperioden = {
      status: 'Ja'
    };

    const expected = [
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_UTEN_ARBEIDSGIVERPERIODE',
        felt: 'lia-radio'
      }
    ];

    expect(validerLonnIArbeidsgiverperioden(input, [{ fom: undefined, tom: undefined, id: '1' }])).toEqual(expected);
  });

  it('should return an error when status is Ja and arbeidsgiverperioder is undefined', () => {
    const input: LonnIArbeidsgiverperioden = {
      status: 'Ja'
    };

    const expected = [
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_UTEN_ARBEIDSGIVERPERIODE',
        felt: 'lia-radio'
      }
    ];

    expect(validerLonnIArbeidsgiverperioden(input)).toEqual(expected);
  });
});
