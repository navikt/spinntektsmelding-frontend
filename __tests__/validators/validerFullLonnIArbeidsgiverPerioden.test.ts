import validerFullLonnIArbeidsgiverPerioden, {
  FullLonnIArbeidsgiverPerioden
} from '../../validators/validerFullLonnIArbeidsgiverPerioden';
import { LonnIArbeidsgiverperioden } from '../../state/state';

describe('validerFullLonnIArbeidsgiverPerioden', () => {
  it('should return an empty array if lonn.status is truthy', () => {
    const lonn: LonnIArbeidsgiverperioden = {
      status: 'Ja',
      begrunnelse: 'FiskerMedHyre'
    };

    const result = validerFullLonnIArbeidsgiverPerioden(lonn);

    expect(result).toEqual([]);
  });

  it('should return an array with MANGLER_VALG_AV_LONN_I_ARBEIDSGIVERPERIODEN code if lonn.status is falsy', () => {
    const lonn: LonnIArbeidsgiverperioden = {
      status: undefined,
      begrunnelse: 'FiskerMedHyre'
    };

    const result = validerFullLonnIArbeidsgiverPerioden(lonn);

    expect(result).toEqual([
      {
        felt: '',
        code: FullLonnIArbeidsgiverPerioden.MANGLER_VALG_AV_LONN_I_ARBEIDSGIVERPERIODEN,
        text: 'Valg av lønn i arbeidsgiverperioden må fylles ut'
      }
    ]);
  });

  it('should return an array with MANGLER_BEGRUNNELSE_LONN_I_ARBEIDSGIVERPERIODEN code if lonn.status is "Nei" and begrunnelse is empty', () => {
    const lonn: LonnIArbeidsgiverperioden = {
      status: 'Nei',
      begrunnelse: undefined
    };

    const result = validerFullLonnIArbeidsgiverPerioden(lonn);

    expect(result).toEqual([
      {
        felt: 'agp.redusertLoennIAgp.begrunnelse',
        code: FullLonnIArbeidsgiverPerioden.MANGLER_BEGRUNNELSE_LONN_I_ARBEIDSGIVERPERIODEN,
        text: 'Begrunnelse for redusert utbetaling i arbeidsgiverperioden må fylles ut'
      },
      {
        code: 'MANGLER_BEGRUNNELSE_LONN_I_ARBEIDSGIVERPERIODEN',
        felt: 'agp.redusertLoennIAgp.beloep',
        text: 'Beløp utbetalt i arbeidsgiverperioden må fylles ut'
      }
    ]);
  });

  it('should return an empty array if lonn.status is "Nei" and begrunnelse is not empty', () => {
    const lonn: LonnIArbeidsgiverperioden = {
      status: 'Nei',
      begrunnelse: 'FiskerMedHyre'
    };

    const result = validerFullLonnIArbeidsgiverPerioden(lonn);

    expect(result).toEqual([
      {
        code: 'MANGLER_BEGRUNNELSE_LONN_I_ARBEIDSGIVERPERIODEN',
        felt: 'agp.redusertLoennIAgp.beloep',
        text: 'Beløp utbetalt i arbeidsgiverperioden må fylles ut'
      }
    ]);
  });
});
