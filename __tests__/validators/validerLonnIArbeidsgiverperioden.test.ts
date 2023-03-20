import { LonnIArbeidsgiverperioden } from '../../state/state';
import validerLonnIArbeidsgiverperioden from '../../validators/validerLonnIArbeidsgiverperioden';

describe('validerLonnIArbeidsgiverperioden', () => {
  it('should return an empty array when everything is OK', () => {
    const input: LonnIArbeidsgiverperioden = {
      status: 'Ja'
    };

    expect(validerLonnIArbeidsgiverperioden(input)).toEqual([]);
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

  it('should return an error when status is Nei and utbetalt is positive, not regarding belop', () => {
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
});
