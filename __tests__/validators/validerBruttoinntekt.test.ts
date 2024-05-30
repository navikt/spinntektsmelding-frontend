import begrunnelseEndringBruttoinntekt from '../../components/Bruttoinntekt/begrunnelseEndringBruttoinntekt';
import { CompleteState } from '../../state/useBoundStore';
import parseIsoDate from '../../utils/parseIsoDate';
import validerBruttoinntekt from '../../validators/validerBruttoinntekt';
import timezone_mock from 'timezone-mock';

timezone_mock.register('UTC');

describe.concurrent('validerBruttoinntekt', () => {
  it('should return an empty array when everything is OK', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: false
      }
    };

    expect(validerBruttoinntekt(input)).toEqual([]);
  });

  it('should return an error when bruttoinntekt < 0 ', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: -1,
        manueltKorrigert: false
      }
    };

    const expected = [
      {
        code: 'BRUTTOINNTEKT_MANGLER',
        felt: 'inntekt.beregnetInntekt'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });

  it('should return an error when not confirmed', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true
      }
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
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: undefined
      }
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
    const input: CompleteState = {};
    const expected = [
      {
        code: 'INNTEKT_MANGLER',
        felt: 'bruttoinntekt'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });

  it('should return an error when tariffendring', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: {
          aarsak: begrunnelseEndringBruttoinntekt.Tariffendring
        }
      }
    };

    const expected = [
      {
        code: 'TARIFFENDRING_FOM',
        felt: 'bruttoinntekt-tariffendring-fom'
      },
      {
        code: 'TARIFFENDRING_KJENT',
        felt: 'bruttoinntekt-tariffendring-kjent'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });

  it('should return an error when ferie property is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: {
          aarsak: begrunnelseEndringBruttoinntekt.Ferie
        }
      }
    };

    const expected = [
      {
        code: 'FERIE_MANGLER',
        felt: 'bruttoinntekt-endringsaarsak'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });

  it('should return an error when ferie fom & tom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: {
          aarsak: begrunnelseEndringBruttoinntekt.Ferie,
          perioder: [{}]
        }
      }
    };

    const expected = [
      {
        code: 'MANGLER_FRA',
        felt: 'bruttoinntekt-ful-fom-undefined-undefined'
      },
      {
        code: 'MANGLER_TIL',
        felt: 'bruttoinntekt-ful-tom-undefined-undefined'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });
  it('should return an error when ferie fom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: {
          aarsak: begrunnelseEndringBruttoinntekt.Ferie,
          perioder: [{ fom: parseIsoDate('2022-01-01') }]
        }
      }
    };

    const expected = [
      {
        code: 'MANGLER_TIL',
        felt: 'bruttoinntekt-ful-tom-1640995200000-undefined'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });

  it('should return an error when ferie tom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: {
          aarsak: begrunnelseEndringBruttoinntekt.Ferie,
          perioder: [{ tom: parseIsoDate('2022-01-01') }]
        }
      }
    };

    const expected = [
      {
        code: 'MANGLER_FRA',
        felt: 'bruttoinntekt-ful-fom-undefined-1640995200000'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });
  /********************************************/
  it('should return an error when varig lønnsendring date is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: { aarsak: begrunnelseEndringBruttoinntekt.VarigLoennsendring }
      }
    };

    const expected = [
      {
        code: 'LONNSENDRING_FOM_MANGLER',
        felt: 'bruttoinntekt-lonnsendring-fom'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });

  it('should return an error when varig lønnsendring date is after bestemmende fraværsdag', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: {
          aarsak: begrunnelseEndringBruttoinntekt.VarigLoennsendring,
          gjelderFra: parseIsoDate('2002-02-02')
        }
      },
      bestemmendeFravaersdag: parseIsoDate('2002-02-01')
    };

    const expected = [
      {
        code: 'LONNSENDRING_FOM_ETTER_BFD',
        felt: 'bruttoinntekt-lonnsendring-fom'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });

  it('should no return an error when lønnsendring date is ok', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: {
          aarsak: begrunnelseEndringBruttoinntekt.VarigLoennsendring,
          gjelderFra: parseIsoDate('2002-01-02')
        }
      },
      bestemmendeFravaersdag: new Date(2002, 1, 3)
    };

    const expected = [];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });
  /********** */
  it('should return an error when permisjon property is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: { aarsak: begrunnelseEndringBruttoinntekt.Permisjon }
      }
    };

    const expected = [
      {
        code: 'PERMISJON_MANGLER',
        felt: 'bruttoinntekt-permisjon-fom'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });

  it('should return an error when permisjon fom & tom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: { aarsak: begrunnelseEndringBruttoinntekt.Permisjon, perioder: [{}] }
      }
    };

    const expected = [
      {
        code: 'MANGLER_FRA',
        felt: 'bruttoinntekt-permisjon-fom-undefined-undefined'
      },
      {
        code: 'MANGLER_TIL',
        felt: 'bruttoinntekt-permisjon-tom-undefined-undefined'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });
  it('should return an error when permisjon fom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: {
          aarsak: begrunnelseEndringBruttoinntekt.Permisjon,
          perioder: [{ fom: parseIsoDate('2022-02-02') }]
        }
      }
    };

    const expected = [
      {
        code: 'MANGLER_TIL',
        felt: 'bruttoinntekt-permisjon-tom-1643760000000-undefined'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });

  it('should return an error when permisjon tom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: {
          aarsak: begrunnelseEndringBruttoinntekt.Permisjon,
          perioder: [{ tom: parseIsoDate('2022-02-02') }]
        }
      }
    };

    const expected = [
      {
        code: 'MANGLER_FRA',
        felt: 'bruttoinntekt-permisjon-fom-undefined-1643760000000'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });
  /********** */
  it('should return an error when permittering property is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: { aarsak: begrunnelseEndringBruttoinntekt.Permittering }
      }
    };

    const expected = [
      {
        code: 'PERMITTERING_MANGLER',
        felt: 'bruttoinntekt-permittering-fom'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });

  it('should return an error when permittering fom & tom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: { aarsak: begrunnelseEndringBruttoinntekt.Permittering, perioder: [{}] }
      }
    };

    const expected = [
      {
        code: 'MANGLER_FRA',
        felt: 'bruttoinntekt-permittering-fom-undefined-undefined'
      },
      {
        code: 'MANGLER_TIL',
        felt: 'bruttoinntekt-permittering-tom-undefined-undefined'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });
  it('should return an error when permittering fom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: {
          aarsak: begrunnelseEndringBruttoinntekt.Permittering,
          perioder: [{ fom: parseIsoDate('2022-02-02') }]
        }
      }
    };

    const expected = [
      {
        code: 'MANGLER_TIL',
        felt: 'bruttoinntekt-permittering-tom-1643760000000-undefined'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });

  it('should return an error when permittering tom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: {
          aarsak: begrunnelseEndringBruttoinntekt.Permittering,
          perioder: [{ tom: parseIsoDate('2022-02-02') }]
        }
      }
    };

    const expected = [
      {
        code: 'MANGLER_FRA',
        felt: 'bruttoinntekt-permittering-fom-undefined-1643760000000'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });

  /********** */
  it('should return an error when nystilling property is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: { aarsak: begrunnelseEndringBruttoinntekt.NyStilling }
      }
    };

    const expected = [
      {
        code: 'NYSTILLING_FOM_MANGLER',
        felt: 'bruttoinntekt-nystilling-fom'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });

  it('should return an error when nystilling is undefined', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: { aarsak: begrunnelseEndringBruttoinntekt.NyStilling, gjelderFra: undefined }
      }
    };

    const expected = [
      {
        code: 'NYSTILLING_FOM_MANGLER',
        felt: 'bruttoinntekt-nystilling-fom'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });
  it('should return an error when nystilling fom is after bfd', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: { aarsak: begrunnelseEndringBruttoinntekt.NyStilling, gjelderFra: '2002-02-03' }
      },
      bestemmendeFravaersdag: new Date(2002, 1, 2)
    };

    const expected = [
      {
        code: 'NYSTILLING_FOM_ETTER_BFD',
        felt: 'bruttoinntekt-nystilling-fom'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });

  /********** */
  it('should return an error when nystillingsprosent property is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: { aarsak: begrunnelseEndringBruttoinntekt.NyStillingsprosent }
      }
    };

    const expected = [
      {
        code: 'NYSTILLINGSPROSENT_FOM_MANGLER',
        felt: 'bruttoinntekt-nystillingsprosent-fom'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });

  it('should return an error when nystillingsprosent is undefined', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: { aarsak: begrunnelseEndringBruttoinntekt.NyStillingsprosent, gjelderFra: undefined }
      }
    };

    const expected = [
      {
        code: 'NYSTILLINGSPROSENT_FOM_MANGLER',
        felt: 'bruttoinntekt-nystillingsprosent-fom'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });
  it('should return an error when nystillingsprosent fom is after bfd', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: {
          aarsak: begrunnelseEndringBruttoinntekt.NyStillingsprosent,
          gjelderFra: '2002-02-03'
        }
      },
      bestemmendeFravaersdag: new Date(2002, 1, 2)
    };

    const expected = [
      {
        code: 'NYSTILLINGSPROSENT_FOM_ETTER_BFD',
        felt: 'bruttoinntekt-nystillingsprosent-fom'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });
});

/********** */
it('should return an error when sykefravær property is missing', () => {
  const input: CompleteState = {
    bruttoinntekt: {
      bruttoInntekt: 123,
      manueltKorrigert: true,
      endringAarsak: {
        aarsak: begrunnelseEndringBruttoinntekt.Sykefravaer
      }
    }
  };

  const expected = [
    {
      code: 'SYKEFRAVAER_MANGLER',
      felt: 'bruttoinntekt-sykefravaerperioder'
    }
  ];

  expect(validerBruttoinntekt(input)).toEqual(expected);
});

it('should return an error when sykefravær fom & tom is missing', () => {
  const input: CompleteState = {
    bruttoinntekt: {
      bruttoInntekt: 123,
      manueltKorrigert: true,
      endringAarsak: {
        aarsak: begrunnelseEndringBruttoinntekt.Sykefravaer,
        perioder: [{}]
      }
    }
  };

  const expected = [
    {
      code: 'MANGLER_FRA',
      felt: 'bruttoinntekt-sykefravaerperioder-fom-undefined-undefined'
    },
    {
      code: 'MANGLER_TIL',
      felt: 'bruttoinntekt-sykefravaerperioder-tom-undefined-undefined'
    }
  ];

  expect(validerBruttoinntekt(input)).toEqual(expected);
});
it('should return an error when Sykefravaer fom is missing', () => {
  const input: CompleteState = {
    bruttoinntekt: {
      bruttoInntekt: 123,
      manueltKorrigert: true,
      endringAarsak: {
        aarsak: begrunnelseEndringBruttoinntekt.Sykefravaer,
        perioder: [{ tom: parseIsoDate('2022-01-02') }]
      }
    }
  };

  const expected = [
    {
      code: 'MANGLER_FRA',
      felt: 'bruttoinntekt-sykefravaerperioder-fom-undefined-1641081600000'
    }
  ];

  expect(validerBruttoinntekt(input)).toEqual(expected);
});

it('should return an error when permittering tom is missing, sykefravær', () => {
  const input: CompleteState = {
    bruttoinntekt: {
      bruttoInntekt: 123,
      manueltKorrigert: true,
      endringAarsak: {
        aarsak: begrunnelseEndringBruttoinntekt.Sykefravaer,
        perioder: [{ fom: parseIsoDate('2022-01-02') }]
      }
    }
  };

  const expected = [
    {
      code: 'MANGLER_TIL',
      felt: 'bruttoinntekt-sykefravaerperioder-tom-1641081600000-undefined'
    }
  ];

  expect(validerBruttoinntekt(input)).toEqual(expected);
});
