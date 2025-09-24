import validerFullLonnIArbeidsgiverPerioden, {
  FullLonnIArbeidsgiverPerioden
} from '../../validators/validerFullLonnIArbeidsgiverPerioden';
import { LonnIArbeidsgiverperioden } from '../../state/state';

describe('validerFullLonnIArbeidsgiverPerioden', () => {
  it('should return an empty array if lonn.status is truthy', () => {
    const lonn: LonnIArbeidsgiverperioden = {
      status: 'Ja',
      begrunnelse: 'Begrunnelse'
    };

    const result = validerFullLonnIArbeidsgiverPerioden(lonn);

    expect(result).toEqual([]);
  });

  it('should return an array with MANGLER_VALG_AV_LONN_I_ARBEIDSGIVERPERIODEN code if lonn.status is falsy', () => {
    const lonn: LonnIArbeidsgiverperioden = {
      status: '',
      begrunnelse: 'Begrunnelse'
    };

    const result = validerFullLonnIArbeidsgiverPerioden(lonn);

    expect(result).toEqual([
      {
        felt: '',
        code: FullLonnIArbeidsgiverPerioden.MANGLER_VALG_AV_LONN_I_ARBEIDSGIVERPERIODEN
      }
    ]);
  });

  it('should return an array with MANGLER_BEGRUNNELSE_LONN_I_ARBEIDSGIVERPERIODEN code if lonn.status is "Nei" and begrunnelse is empty', () => {
    const lonn: LonnIArbeidsgiverperioden = {
      status: 'Nei',
      begrunnelse: ''
    };

    const result = validerFullLonnIArbeidsgiverPerioden(lonn);

    expect(result).toEqual([
      {
        felt: '',
        code: FullLonnIArbeidsgiverPerioden.MANGLER_BEGRUNNELSE_LONN_I_ARBEIDSGIVERPERIODEN
      }
    ]);
  });

  it('should return an empty array if lonn.status is "Nei" and begrunnelse is not empty', () => {
    const lonn: LonnIArbeidsgiverperioden = {
      status: 'Nei',
      begrunnelse: 'Begrunnelse'
    };

    const result = validerFullLonnIArbeidsgiverPerioden(lonn);

    expect(result).toEqual([]);
  });
});
