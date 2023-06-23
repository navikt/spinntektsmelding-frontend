import begrunnelseEndringBruttoinntekt from '../../components/Bruttoinntekt/begrunnelseEndringBruttoinntekt';
import { Inntekt } from '../../state/state';
import { CompleteState } from '../../state/useBoundStore';
import validerBruttoinntekt from '../../validators/validerBruttoinntekt';

describe('validerBruttoinntekt', () => {
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
        endringsaarsak: ''
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
        endringsaarsak: begrunnelseEndringBruttoinntekt.Tariffendring
      }
    };

    const expected = [
      {
        code: 'TARIFFENDRING_FOM',
        felt: 'bruttoinntekt-tariffendring-fom'
      },
      {
        code: 'TARIFFENDRING_KJENT',
        felt: 'bruttoinntekt-tariffendring-kjelt'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });

  it('should return an error when ferie property is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringsaarsak: begrunnelseEndringBruttoinntekt.Ferie
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
        endringsaarsak: begrunnelseEndringBruttoinntekt.Ferie
      },
      ferie: [{}]
    };

    const expected = [
      {
        code: 'FERIE_FOM',
        felt: 'bruttoinntekt-ful-fom-undefined'
      },
      {
        code: 'FERIE_TOM',
        felt: 'bruttoinntekt-ful-tom-undefined'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });
  it('should return an error when ferie fom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringsaarsak: begrunnelseEndringBruttoinntekt.Ferie
      },
      ferie: [{ id: '1', fom: new Date() }]
    };

    const expected = [
      {
        code: 'FERIE_TOM',
        felt: 'bruttoinntekt-ful-tom-1'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });

  it('should return an error when ferie tom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringsaarsak: begrunnelseEndringBruttoinntekt.Ferie
      },
      ferie: [{ id: '1', tom: new Date() }]
    };

    const expected = [
      {
        code: 'FERIE_FOM',
        felt: 'bruttoinntekt-ful-fom-1'
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
        endringsaarsak: begrunnelseEndringBruttoinntekt.VarigLonnsendring
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

  it('should return an error when varig lønnsendring date is afte bestemmend fraværsdag', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringsaarsak: begrunnelseEndringBruttoinntekt.VarigLonnsendring
      },
      lonnsendringsdato: new Date(2002, 1, 2),
      bestemmendeFravaersdag: new Date(2002, 1, 1)
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
        endringsaarsak: begrunnelseEndringBruttoinntekt.VarigLonnsendring
      },
      lonnsendringsdato: new Date(2002, 1, 2),
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
        endringsaarsak: begrunnelseEndringBruttoinntekt.Permisjon
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
        endringsaarsak: begrunnelseEndringBruttoinntekt.Permisjon
      },
      permisjon: [{}]
    };

    const expected = [
      {
        code: 'PERMISJON_FOM',
        felt: 'bruttoinntekt-permisjon-fom-undefined'
      },
      {
        code: 'PERMISJON_TOM',
        felt: 'bruttoinntekt-permisjon-tom-undefined'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });
  it('should return an error when permisjon fom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringsaarsak: begrunnelseEndringBruttoinntekt.Permisjon
      },
      permisjon: [{ id: '1', fom: new Date() }]
    };

    const expected = [
      {
        code: 'PERMISJON_TOM',
        felt: 'bruttoinntekt-permisjon-tom-1'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });

  it('should return an error when permisjon tom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringsaarsak: begrunnelseEndringBruttoinntekt.Permisjon
      },
      permisjon: [{ id: '1', tom: new Date() }]
    };

    const expected = [
      {
        code: 'PERMISJON_FOM',
        felt: 'bruttoinntekt-permisjon-fom-1'
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
        endringsaarsak: begrunnelseEndringBruttoinntekt.Permittering
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
        endringsaarsak: begrunnelseEndringBruttoinntekt.Permittering
      },
      permittering: [{}]
    };

    const expected = [
      {
        code: 'PERMITTERING_FOM',
        felt: 'bruttoinntekt-permittering-fom-undefined'
      },
      {
        code: 'PERMITTERING_TOM',
        felt: 'bruttoinntekt-permittering-tom-undefined'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });
  it('should return an error when permittering fom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringsaarsak: begrunnelseEndringBruttoinntekt.Permittering
      },
      permittering: [{ id: '1', fom: new Date() }]
    };

    const expected = [
      {
        code: 'PERMITTERING_TOM',
        felt: 'bruttoinntekt-permittering-tom-1'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });

  it('should return an error when permittering tom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringsaarsak: begrunnelseEndringBruttoinntekt.Permittering
      },
      permittering: [{ id: '1', tom: new Date() }]
    };

    const expected = [
      {
        code: 'PERMITTERING_FOM',
        felt: 'bruttoinntekt-permittering-fom-1'
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
        endringsaarsak: begrunnelseEndringBruttoinntekt.NyStilling
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
        endringsaarsak: begrunnelseEndringBruttoinntekt.NyStilling
      },
      nystillingdato: undefined
    };

    const expected = [
      {
        code: 'NYSTILLING_FOM_MANGLER',
        felt: 'bruttoinntekt-nystilling-fom'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });
  it('should return an error when nystilling fom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringsaarsak: begrunnelseEndringBruttoinntekt.NyStilling
      },
      nystillingdato: new Date(2002, 1, 3),
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
        endringsaarsak: begrunnelseEndringBruttoinntekt.NyStillingsprosent
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
        endringsaarsak: begrunnelseEndringBruttoinntekt.NyStillingsprosent
      },
      nystillingsprosentdato: undefined
    };

    const expected = [
      {
        code: 'NYSTILLINGSPROSENT_FOM_MANGLER',
        felt: 'bruttoinntekt-nystillingsprosent-fom'
      }
    ];

    expect(validerBruttoinntekt(input)).toEqual(expected);
  });
  it('should return an error when nystillingsprosent fom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringsaarsak: begrunnelseEndringBruttoinntekt.NyStillingsprosent
      },
      nystillingsprosentdato: new Date(2002, 1, 3),
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
      endringsaarsak: begrunnelseEndringBruttoinntekt.Sykefravaer
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
      endringsaarsak: begrunnelseEndringBruttoinntekt.Sykefravaer
    },
    permittering: [{}]
  };

  const expected = [
    {
      code: 'SYKEFRAVAER_MANGLER',
      felt: 'bruttoinntekt-sykefravaerperioder'
    }
  ];

  expect(validerBruttoinntekt(input)).toEqual(expected);
});
it('should return an error when Sykefravaer fom is missing', () => {
  const input: CompleteState = {
    bruttoinntekt: {
      bruttoInntekt: 123,
      manueltKorrigert: true,
      endringsaarsak: begrunnelseEndringBruttoinntekt.Sykefravaer
    },
    sykefravaerperioder: [{ id: '1', fom: new Date() }]
  };

  const expected = [
    {
      code: 'SYKEFRAVAER_TOM',
      felt: 'bruttoinntekt-sykefravaerperioder-tom-1'
    }
  ];

  expect(validerBruttoinntekt(input)).toEqual(expected);
});

it('should return an error when permittering tom is missing', () => {
  const input: CompleteState = {
    bruttoinntekt: {
      bruttoInntekt: 123,
      manueltKorrigert: true,
      endringsaarsak: begrunnelseEndringBruttoinntekt.Sykefravaer
    },
    sykefravaerperioder: [{ id: '1', tom: new Date() }]
  };

  const expected = [
    {
      code: 'SYKEFRAVAER_FOM',
      felt: 'bruttoinntekt-sykefravaerperioder-fom-1'
    }
  ];

  expect(validerBruttoinntekt(input)).toEqual(expected);
});
