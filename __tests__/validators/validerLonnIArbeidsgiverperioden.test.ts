import { LonnIArbeidsgiverperioden } from '../../state/state';
import validerLonnIArbeidsgiverperioden from '../../validators/validerLonnIArbeidsgiverperioden';

describe('validerLonnIArbeidsgiverperioden', () => {
  it('should return an empty array when everything is OK', () => {
    const input: LonnIArbeidsgiverperioden = {
      status: 'Ja'
    };

    expect(validerLonnIArbeidsgiverperioden(input)).toEqual([]);
  });

  it('should return an error when status is Nei and begrunnelse is missing', () => {
    const input: LonnIArbeidsgiverperioden = {
      status: 'Nei'
    };

    const expected = [
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE',
        felt: 'lia-select'
      }
    ];

    expect(validerLonnIArbeidsgiverperioden(input)).toEqual(expected);
  });
});
