import { LonnIArbeidsgiverperioden } from '../../state/state';
import validerLonnIArbeidsgiverperioden from '../../validators/validerLonnIArbeidsgiverperioden';

const arbeidsforhold = ['arbeider'];
describe('validerLonnIArbeidsgiverperioden', () => {
  it('should return an empty array when everything is OK', () => {
    const input: { [key: string]: LonnIArbeidsgiverperioden } = {
      arbeider: {
        status: 'Ja'
      }
    };

    expect(validerLonnIArbeidsgiverperioden(input, arbeidsforhold)).toEqual([]);
  });

  it('should return an error when arbeidsforhold is missing', () => {
    const input: { [key: string]: LonnIArbeidsgiverperioden } = {
      arbeider: {
        status: 'Ja'
      }
    };

    const expected = [
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_MANGLER',
        felt: 'lia-radio-ukjent'
      }
    ];

    expect(validerLonnIArbeidsgiverperioden(input)).toEqual(expected);
  });

  it('should return an error when arbeidsforhold does not match', () => {
    const input: { [key: string]: LonnIArbeidsgiverperioden } = {
      arbeider2: {
        status: 'Ja'
      }
    };

    const expected = [
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_MANGLER',
        felt: 'lia-radio-arbeider'
      }
    ];

    expect(validerLonnIArbeidsgiverperioden(input, arbeidsforhold)).toEqual(expected);
  });

  it('should return an error when status is Nei and begrunnelse is missing', () => {
    const input: { [key: string]: LonnIArbeidsgiverperioden } = {
      arbeider: {
        status: 'Nei'
      }
    };

    const expected = [
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE',
        felt: 'lia-select-arbeider'
      }
    ];

    expect(validerLonnIArbeidsgiverperioden(input, arbeidsforhold)).toEqual(expected);
  });
});
