import { LonnIArbeidsgiverperioden } from '../../state/state';
import parseIsoDate from '../../utils/parseIsoDate';
import validerLonnIArbeidsgiverperioden from '../../validators/validerLonnIArbeidsgiverperioden';

describe('validerLonnIArbeidsgiverperioden', () => {
  it('should return an empty array when everything is OK', () => {
    const input: LonnIArbeidsgiverperioden = {
      status: 'Ja',
      begrunnelse: 'test',
      utbetalt: 1234
    };

    const arbeidsgiverperioder = [{ fom: parseIsoDate('2020-01-01'), tom: parseIsoDate('2020-01-01'), id: '1' }];

    expect(validerLonnIArbeidsgiverperioden(input, arbeidsgiverperioder)).toEqual([]);
  });

  it('should return an error array when input is missing', () => {
    const input = undefined;

    const expected = [
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE',
        felt: 'agp.redusertLoennIAgp.begrunnelse'
      },
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BELOP',
        felt: 'agp.redusertLoennIAgp.beloep'
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
        felt: 'agp.redusertLoennIAgp.begrunnelse'
      },
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BELOP',
        felt: 'agp.redusertLoennIAgp.beloep'
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
        felt: 'agp.redusertLoennIAgp.begrunnelse'
      },
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BELOP',
        felt: 'agp.redusertLoennIAgp.beloep'
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
        felt: 'agp.redusertLoennIAgp.begrunnelse'
      },
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BELOP',
        felt: 'agp.redusertLoennIAgp.beloep'
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
        felt: 'agp.redusertLoennIAgp.begrunnelse'
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
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE',
        felt: 'agp.redusertLoennIAgp.begrunnelse'
      },
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BELOP',
        felt: 'agp.redusertLoennIAgp.beloep'
      },
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
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE',
        felt: 'agp.redusertLoennIAgp.begrunnelse'
      },
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BELOP',
        felt: 'agp.redusertLoennIAgp.beloep'
      },
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
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE',
        felt: 'agp.redusertLoennIAgp.begrunnelse'
      },
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BELOP',
        felt: 'agp.redusertLoennIAgp.beloep'
      },
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_UTEN_ARBEIDSGIVERPERIODE',
        felt: 'lia-radio'
      }
    ];

    expect(validerLonnIArbeidsgiverperioden(input)).toEqual(expected);
  });

  it('should return an error when status is Nei and beløp is higher than inntekt', () => {
    const input: LonnIArbeidsgiverperioden = {
      status: 'Nei',
      begrunnelse: 'ArbeidOpphoert',
      utbetalt: 2000
    };

    const arbeidsgiverperioder = [{ fom: parseIsoDate('2020-01-01'), tom: parseIsoDate('2020-01-01'), id: '1' }];

    const expected = [
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BELOP_OVERSTIGER_BRUTTOINNTEKT',
        felt: 'agp.redusertLoennIAgp.beloep'
      }
    ];

    expect(validerLonnIArbeidsgiverperioden(input, arbeidsgiverperioder, 1010)).toEqual(expected);
  });

  it('should not return an error when status is Nei and beløp is lower than inntekt', () => {
    const input: LonnIArbeidsgiverperioden = {
      status: 'Nei',
      begrunnelse: 'ArbeidOpphoert',
      utbetalt: 1000
    };

    const arbeidsgiverperioder = [{ fom: parseIsoDate('2020-01-01'), tom: parseIsoDate('2020-01-01'), id: '1' }];

    const expected = [];

    expect(validerLonnIArbeidsgiverperioden(input, arbeidsgiverperioder, 1010)).toEqual(expected);
  });

  it('should return an error when status is Ja and agp i missing', () => {
    const input: LonnIArbeidsgiverperioden = {
      status: 'Ja',
      begrunnelse: 'ArbeidOpphoert',
      utbetalt: 2000
    };

    const arbeidsgiverperioder = [{ fom: parseIsoDate('2020-01-01'), tom: parseIsoDate('2020-01-01'), id: '1' }];

    const expected = [
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_UTEN_ARBEIDSGIVERPERIODE',
        felt: 'lia-radio'
      }
    ];

    expect(validerLonnIArbeidsgiverperioden(input, undefined, 1010)).toEqual(expected);
  });

  it('should return an error when status is Nei and agp i missing', () => {
    const input: LonnIArbeidsgiverperioden = {
      status: 'Nei',
      begrunnelse: 'ArbeidOpphoert',
      utbetalt: -500
    };

    const arbeidsgiverperioder = [{ fom: parseIsoDate('2020-01-01'), tom: parseIsoDate('2020-01-01'), id: '1' }];

    const expected = [
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BELOP',
        felt: 'agp.redusertLoennIAgp.beloep'
      }
    ];

    expect(validerLonnIArbeidsgiverperioden(input, undefined, 1010)).toEqual(expected);
  });

  it('should return an error when status is undefined and agp i missing', () => {
    const input: LonnIArbeidsgiverperioden = {
      begrunnelse: 'ArbeidOpphoert',
      utbetalt: -500
    };

    const arbeidsgiverperioder = [{ fom: parseIsoDate('2020-01-01'), tom: parseIsoDate('2020-01-01'), id: '1' }];

    const expected = [
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_MANGLER',
        felt: 'lia-radio'
      }
    ];

    expect(validerLonnIArbeidsgiverperioden(input, arbeidsgiverperioder, 1010)).toEqual(expected);
  });

  it('should return an error when status is Nei and begrunnelse is missing', () => {
    const input: LonnIArbeidsgiverperioden = {
      status: 'Nei',
      begrunnelse: '',
      utbetalt: 500
    };

    const arbeidsgiverperioder = [{ fom: parseIsoDate('2020-01-01'), tom: parseIsoDate('2020-01-01'), id: '1' }];

    const expected = [
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE',
        felt: 'agp.redusertLoennIAgp.begrunnelse'
      }
    ];

    expect(validerLonnIArbeidsgiverperioden(input, arbeidsgiverperioder, 1010)).toEqual(expected);
  });

  it('should return an error when status is Nei and begrunnelse is undefined', () => {
    const input: LonnIArbeidsgiverperioden = {
      status: 'Nei',
      begrunnelse: undefined,
      utbetalt: 500
    };

    const arbeidsgiverperioder = [{ fom: parseIsoDate('2020-01-01'), tom: parseIsoDate('2020-01-01'), id: '1' }];

    const expected = [
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BEGRUNNELSE',
        felt: 'agp.redusertLoennIAgp.begrunnelse'
      }
    ];

    expect(validerLonnIArbeidsgiverperioden(input, arbeidsgiverperioder, 1010)).toEqual(expected);
  });

  it('should return an error when status is Nei and utbetalt is negative', () => {
    const input: LonnIArbeidsgiverperioden = {
      status: 'Nei',
      begrunnelse: 'BeskjedGittForSent',
      utbetalt: -500
    };

    const arbeidsgiverperioder = [{ fom: parseIsoDate('2020-01-01'), tom: parseIsoDate('2020-01-01'), id: '1' }];

    const expected = [
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BELOP',
        felt: 'agp.redusertLoennIAgp.beloep'
      }
    ];

    expect(validerLonnIArbeidsgiverperioden(input, arbeidsgiverperioder, 1010)).toEqual(expected);
  });

  it('should return an error when status is Nei and utbetalt is undefined', () => {
    const input: LonnIArbeidsgiverperioden = {
      status: 'Nei',
      begrunnelse: 'BeskjedGittForSent',
      utbetalt: undefined
    };

    const arbeidsgiverperioder = [{ fom: parseIsoDate('2020-01-01'), tom: parseIsoDate('2020-01-01'), id: '1' }];

    const expected = [
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_BELOP',
        felt: 'agp.redusertLoennIAgp.beloep'
      }
    ];

    expect(validerLonnIArbeidsgiverperioden(input, arbeidsgiverperioder, 1010)).toEqual(expected);
  });

  it('should return an error when status is Ja and agp is missing', () => {
    const input: LonnIArbeidsgiverperioden = {
      status: 'Ja',
      begrunnelse: 'BeskjedGittForSent',
      utbetalt: 500
    };

    const arbeidsgiverperioder = [{ fom: parseIsoDate('2020-01-01'), tom: parseIsoDate('2020-01-01'), id: '1' }];

    const expected = [
      {
        code: 'LONN_I_ARBEIDSGIVERPERIODEN_UTEN_ARBEIDSGIVERPERIODE',
        felt: 'lia-radio'
      }
    ];

    expect(validerLonnIArbeidsgiverperioden(input, undefined, 1010)).toEqual(expected);
  });
});
