import { z } from 'zod';
import begrunnelseEndringBruttoinntekt from '../../components/Bruttoinntekt/begrunnelseEndringBruttoinntekt';
import { HovedskjemaSchema } from '../../schema/HovedskjemaSchema';
import { CompleteState } from '../../state/useBoundStore';
import parseIsoDate from '../../utils/parseIsoDate';
import validerBruttoinntekt from '../../validators/validerBruttoinntekt';
import timezone_mock from 'timezone-mock';
import { describe } from 'vitest';
import { nanoid } from 'nanoid';

timezone_mock.register('UTC');
type Skjema = z.infer<typeof HovedskjemaSchema>;
vi.mock('nanoid');

nanoid.mockReturnValue('uuid');

describe.concurrent('validerBruttoinntekt', () => {
  it('should return an empty array when everything is OK', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: {
          aarsak: begrunnelseEndringBruttoinntekt.Tariffendring,
          gjelderFra: parseIsoDate('2022-01-01')
        }
      }
    };

    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 12345,
        endringAarsaker: null,

        inntektsdato: '2021-01-01',
        naturalytelser: []
      }
    };

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual([]);
  });

  it('should return an error when bruttoinntekt < 0 ', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: -1,
        manueltKorrigert: false
      }
    };

    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: -1,
        endringAarsaker: null,

        inntektsdato: '2021-01-01',
        naturalytelser: []
      }
    };

    const expected = [
      {
        code: 'BRUTTOINNTEKT_MANGLER',
        felt: 'inntekt.beregnetInntekt'
      }
    ];

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
  });

  it('should return an error when not confirmed', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true
      }
    };
    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 1234,
        endringAarsaker: [{ aarsak: '' }],

        inntektsdato: '2021-01-01',
        naturalytelser: []
      }
    };
    const expected = [
      {
        code: 'ENDRINGSAARSAK_MANGLER',
        felt: 'bruttoinntekt-endringsaarsak-0'
      }
    ];

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
  });

  it('should return an error when no reason given', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: { aarsak: '' }
      }
    };

    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 123,
        endringAarsaker: [{ aarsak: '' }],

        inntektsdato: '2021-01-01',
        naturalytelser: []
      }
    };

    const expected = [
      {
        code: 'ENDRINGSAARSAK_MANGLER',
        felt: 'bruttoinntekt-endringsaarsak-0'
      }
    ];

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
  });

  it('should return false when stuff is no reason for change given', () => {
    const input: CompleteState = {};
    const expected = [
      {
        code: 'INNTEKT_MANGLER',
        felt: 'bruttoinntekt'
      }
    ];

    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 0,
        endringAarsaker: [{ aarsak: '' }],

        inntektsdato: '2021-01-01',
        naturalytelser: []
      }
    };

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
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

    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 0,
        endringAarsaker: [
          {
            aarsak: begrunnelseEndringBruttoinntekt.Tariffendring as string
          }
        ],

        inntektsdato: '2021-01-01',
        naturalytelser: []
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

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
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

    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 123,
        endringAarsaker: [
          {
            aarsak: begrunnelseEndringBruttoinntekt.Ferie as string
          }
        ],

        inntektsdato: '2021-01-01',
        naturalytelser: []
      }
    };

    const expected = [
      {
        code: 'FERIE_MANGLER',
        felt: 'bruttoinntekt-endringsaarsak'
      }
    ];

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
  });

  it('should return an error when ferie fom & tom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: {
          aarsak: begrunnelseEndringBruttoinntekt.Ferie,
          ferier: [{}]
        }
      }
    };

    const expected = [
      {
        code: 'MANGLER_FRA',
        felt: 'bruttoinntekt-ful-fom-uuid-undefined'
      },
      {
        code: 'MANGLER_TIL',
        felt: 'bruttoinntekt-ful-tom-uuid-undefined'
      }
    ];

    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 123,
        endringAarsaker: [
          {
            aarsak: begrunnelseEndringBruttoinntekt.Ferie as string,
            ferier: [{}]
          }
        ],

        inntektsdato: '2021-01-01',
        naturalytelser: []
      }
    };

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
  });
  it('should return an error when ferie fom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: {
          aarsak: begrunnelseEndringBruttoinntekt.Ferie,
          ferier: [{ fom: parseIsoDate('2022-01-01') }]
        }
      }
    };

    const expected = [
      {
        code: 'MANGLER_TIL',
        felt: 'bruttoinntekt-ful-tom-2022-01-01-undefined'
      }
    ];

    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 123,
        endringAarsaker: [
          {
            aarsak: begrunnelseEndringBruttoinntekt.Ferie as string,
            ferier: [{ fom: parseIsoDate('2022-01-01') }]
          }
        ],

        inntektsdato: '2021-01-01',
        naturalytelser: []
      }
    };

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
  });

  it('should return an error when ferie tom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: {
          aarsak: begrunnelseEndringBruttoinntekt.Ferie,
          ferier: [{ tom: parseIsoDate('2022-01-01') }]
        }
      }
    };

    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 123,
        endringAarsaker: [
          {
            aarsak: begrunnelseEndringBruttoinntekt.Ferie as string,
            ferier: [{ tom: parseIsoDate('2022-01-01') }]
          }
        ],

        inntektsdato: '2021-01-01',
        naturalytelser: []
      }
    };

    const expected = [
      {
        code: 'MANGLER_FRA',
        felt: 'bruttoinntekt-ful-fom-uuid-2022-01-01'
      }
    ];

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
  });
  /********************************************/
  it('should return an error when varig lønnsendring date is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true
      }
    };

    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 123,
        endringAarsaker: [{ aarsak: begrunnelseEndringBruttoinntekt.VarigLoennsendring }],

        inntektsdato: '2021-01-01',
        naturalytelser: []
      }
    };

    const expected = [
      {
        code: 'LONNSENDRING_FOM_MANGLER',
        felt: 'bruttoinntekt-lonnsendring-fom'
      }
    ];

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
  });

  it('should return an error when varig lønnsendring date is after bestemmende fraværsdag', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: {
          aarsak: begrunnelseEndringBruttoinntekt.VarigLoennsendring,
          gjelderFra: parseIsoDate('2022-02-02')!
        }
      }
    };
    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 123,
        endringAarsaker: [
          {
            aarsak: begrunnelseEndringBruttoinntekt.VarigLoennsendring,
            gjelderFra: parseIsoDate('2022-02-02')!
          }
        ]
        // inntektsdato: '2021-01-01',
        // naturalytelser: []
      }
    };
    const expected = [
      {
        code: 'LONNSENDRING_FOM_ETTER_BFD',
        felt: 'bruttoinntekt-lonnsendring-fom'
      }
    ];

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
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
    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 123,
        endringAarsaker: [
          {
            aarsak: begrunnelseEndringBruttoinntekt.VarigLoennsendring,
            gjelderFra: parseIsoDate('2002-02-02')!
          }
        ],
        inntektsdato: '2021-01-01',
        naturalytelser: []
      }
    };
    const expected = [];

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
  });

  it('should no return an error when lønnsendring date is ok and gjelderFra is a string', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: {
          aarsak: begrunnelseEndringBruttoinntekt.VarigLoennsendring,
          gjelderFra: '2002-01-02'
        }
      },
      bestemmendeFravaersdag: new Date(2002, 1, 3)
    };
    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 123,
        endringAarsaker: [
          {
            aarsak: begrunnelseEndringBruttoinntekt.VarigLoennsendring,
            gjelderFra: parseIsoDate('2002-01-02')!
          }
        ]
        // inntektsdato: '2021-01-01',
        // naturalytelser: []
      }
    };
    const expected = [];

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
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
    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 123,
        endringAarsaker: [
          {
            aarsak: begrunnelseEndringBruttoinntekt.Permisjon
          }
        ],

        inntektsdato: '2021-01-01',
        naturalytelser: []
      }
    };
    const expected = [
      {
        code: 'PERMISJON_MANGLER',
        felt: 'bruttoinntekt-permisjon-fom'
      }
    ];

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
  });

  it('should return an error when permisjon fom & tom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: { aarsak: begrunnelseEndringBruttoinntekt.Permisjon, permisjoner: [{}] }
      }
    };
    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 123,
        endringAarsaker: [
          {
            aarsak: begrunnelseEndringBruttoinntekt.Permisjon,
            permisjoner: [{}]
          }
        ],

        inntektsdato: '2021-01-01',
        naturalytelser: []
      }
    };
    const expected = [
      {
        code: 'MANGLER_FRA',
        felt: 'bruttoinntekt-permisjon-fom-uuid-undefined'
      },
      {
        code: 'MANGLER_TIL',
        felt: 'bruttoinntekt-permisjon-tom-uuid-undefined'
      }
    ];

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
  });
  it('should return an error when permisjon fom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: {
          aarsak: begrunnelseEndringBruttoinntekt.Permisjon,
          permisjoner: [{ tom: parseIsoDate('2022-02-02') }]
        }
      }
    };
    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 123,
        endringAarsaker: [
          {
            aarsak: begrunnelseEndringBruttoinntekt.Permisjon,
            permisjoner: [{ tom: parseIsoDate('2022-02-02') }]
          }
        ],

        inntektsdato: '2021-01-01',
        naturalytelser: []
      }
    };
    const expected = [
      {
        code: 'MANGLER_FRA',
        felt: 'bruttoinntekt-permisjon-fom-uuid-2022-02-02'
      }
    ];

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
  });

  it('should return an error when permisjon tom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: {
          aarsak: begrunnelseEndringBruttoinntekt.Permisjon,
          permisjoner: [{ fom: parseIsoDate('2022-02-02') }]
        }
      }
    };
    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 123,
        endringAarsaker: [
          {
            aarsak: begrunnelseEndringBruttoinntekt.Permisjon,
            permisjoner: [{ fom: parseIsoDate('2022-02-02') }]
          }
        ],

        inntektsdato: '2021-01-01',
        naturalytelser: []
      }
    };
    const expected = [
      {
        code: 'MANGLER_TIL',
        felt: 'bruttoinntekt-permisjon-tom-2022-02-02-undefined'
      }
    ];

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
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
    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 123,
        endringAarsaker: [
          {
            aarsak: begrunnelseEndringBruttoinntekt.Permittering
          }
        ],

        inntektsdato: '2021-01-01',
        naturalytelser: []
      }
    };
    const expected = [
      {
        code: 'PERMITTERING_MANGLER',
        felt: 'bruttoinntekt-permittering-fom'
      }
    ];

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
  });

  it('should return an error when permittering fom & tom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: { aarsak: begrunnelseEndringBruttoinntekt.Permittering, permitteringer: [{}] }
      }
    };
    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 123,
        endringAarsaker: [
          {
            aarsak: begrunnelseEndringBruttoinntekt.Permittering,
            permitteringer: [{ aarsak: begrunnelseEndringBruttoinntekt.Permittering, permitteringer: [{}] }]
          }
        ],

        inntektsdato: '2021-01-01',
        naturalytelser: []
      }
    };
    const expected = [
      {
        code: 'MANGLER_FRA',
        felt: 'bruttoinntekt-permittering-fom-uuid-undefined'
      },
      {
        code: 'MANGLER_TIL',
        felt: 'bruttoinntekt-permittering-tom-uuid-undefined'
      }
    ];

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
  });
  it('should return an error when permittering tom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: {
          aarsak: begrunnelseEndringBruttoinntekt.Permittering,
          permitteringer: [{ fom: '2022-02-02' }]
        }
      }
    };
    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 123,
        endringAarsaker: [
          {
            aarsak: begrunnelseEndringBruttoinntekt.Permittering,
            permitteringer: [{ fom: '2022-02-02' }]
          }
        ],

        inntektsdato: '2021-01-01',
        naturalytelser: []
      }
    };
    const expected = [
      {
        code: 'MANGLER_TIL',
        felt: 'bruttoinntekt-permittering-tom-2022-02-02-undefined'
      }
    ];

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
  });

  it('should return an error when permittering fom is missing', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: {
          aarsak: begrunnelseEndringBruttoinntekt.Permittering,
          permitteringer: [{ tom: '2022-02-02' }]
        }
      }
    };
    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 123,
        endringAarsaker: [
          {
            aarsak: begrunnelseEndringBruttoinntekt.Permittering,
            permitteringer: [{ tom: '2022-02-02' }]
          }
        ],

        inntektsdato: '2021-01-01',
        naturalytelser: []
      }
    };
    const expected = [
      {
        code: 'MANGLER_FRA',
        felt: 'bruttoinntekt-permittering-fom-uuid-2022-02-02'
      }
    ];

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
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
    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 123,
        endringAarsaker: [
          {
            aarsak: begrunnelseEndringBruttoinntekt.NyStilling
          }
        ],

        inntektsdato: '2021-01-01',
        naturalytelser: []
      }
    };
    const expected = [
      {
        code: 'NYSTILLING_FOM_MANGLER',
        felt: 'bruttoinntekt-nystilling-fom'
      }
    ];

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
  });

  it('should return an error when nystilling is undefined', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: { aarsak: begrunnelseEndringBruttoinntekt.NyStilling, gjelderFra: undefined }
      }
    };
    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 123,
        endringAarsaker: [
          {
            aarsak: begrunnelseEndringBruttoinntekt.NyStilling,
            gjelderFra: undefined
          }
        ],

        inntektsdato: '2021-01-01',
        naturalytelser: []
      }
    };
    const expected = [
      {
        code: 'NYSTILLING_FOM_MANGLER',
        felt: 'bruttoinntekt-nystilling-fom'
      }
    ];

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
  });
  it('should return an error when nystilling fom is after bfd', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: { aarsak: begrunnelseEndringBruttoinntekt.NyStilling, gjelderFra: new Date('2022-02-03') }
      },
      bestemmendeFravaersdag: new Date(2002, 1, 2)
    };
    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 123,
        endringAarsaker: [
          {
            aarsak: begrunnelseEndringBruttoinntekt.NyStilling,
            gjelderFra: '2022-02-03'
          }
        ],

        inntektsdato: '2021-01-01',
        naturalytelser: []
      }
    };
    const expected = [
      {
        code: 'NYSTILLING_FOM_ETTER_BFD',
        felt: 'bruttoinntekt-nystilling-fom'
      }
    ];

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
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
    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 123,
        endringAarsaker: [
          {
            aarsak: begrunnelseEndringBruttoinntekt.NyStillingsprosent
          }
        ],

        inntektsdato: '2021-01-01',
        naturalytelser: []
      }
    };
    const expected = [
      {
        code: 'NYSTILLINGSPROSENT_FOM_MANGLER',
        felt: 'bruttoinntekt-nystillingsprosent-fom'
      }
    ];

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
  });

  it('should return an error when nystillingsprosent is undefined', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: { aarsak: begrunnelseEndringBruttoinntekt.NyStillingsprosent, gjelderFra: undefined }
      }
    };
    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 123,
        endringAarsaker: [
          {
            aarsak: begrunnelseEndringBruttoinntekt.NyStillingsprosent,
            gjelderFra: undefined
          }
        ],

        inntektsdato: '2021-01-01',
        naturalytelser: []
      }
    };
    const expected = [
      {
        code: 'NYSTILLINGSPROSENT_FOM_MANGLER',
        felt: 'bruttoinntekt-nystillingsprosent-fom'
      }
    ];

    expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
  });
  it('should return an error when nystillingsprosent fom is after bfd', () => {
    const input: CompleteState = {
      bruttoinntekt: {
        bruttoInntekt: 123,
        manueltKorrigert: true,
        endringAarsak: {
          aarsak: begrunnelseEndringBruttoinntekt.NyStillingsprosent,
          gjelderFra: new Date('2022-02-03')
        }
      }
      // bestemmendeFravaersdag: new Date(2002, 1, 2)
    };
    const skjemaData: Skjema = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 123,
        endringAarsaker: [
          {
            aarsak: begrunnelseEndringBruttoinntekt.NyStillingsprosent,
            gjelderFra: new Date('2022-02-03')
          }
        ]
        // inntektsdato: '2021-01-01',
        // naturalytelser: []
      }
    };
    const expected = [
      {
        code: 'NYSTILLINGSPROSENT_FOM_ETTER_BFD',
        felt: 'bruttoinntekt-nystillingsprosent-fom'
      }
    ];

    expect(validerBruttoinntekt(input, skjemaData, new Date('2022-02-02'))).toEqual(expected);
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
  const skjemaData: Skjema = {
    bekreft_opplysninger: true,
    inntekt: {
      beloep: 123,
      endringAarsaker: [
        {
          aarsak: begrunnelseEndringBruttoinntekt.Sykefravaer
        }
      ],

      inntektsdato: '2021-01-01',
      naturalytelser: []
    }
  };
  const expected = [
    {
      code: 'SYKEFRAVAER_MANGLER',
      felt: 'bruttoinntekt-sykefravaerperioder'
    }
  ];

  expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
});

it('should return an error when sykefravær fom & tom is missing', () => {
  const input: CompleteState = {
    bruttoinntekt: {
      bruttoInntekt: 123,
      manueltKorrigert: true,
      endringAarsak: {
        aarsak: begrunnelseEndringBruttoinntekt.Sykefravaer,
        sykefravaer: [{}]
      }
    }
  };
  const skjemaData: Skjema = {
    bekreft_opplysninger: true,
    inntekt: {
      beloep: 123,
      endringAarsaker: [
        {
          aarsak: begrunnelseEndringBruttoinntekt.Sykefravaer,
          sykefravaer: [{}]
        }
      ],

      inntektsdato: '2021-01-01',
      naturalytelser: []
    }
  };
  const expected = [
    {
      code: 'MANGLER_FRA',
      felt: 'bruttoinntekt-sykefravaerperioder-fom-uuid-undefined'
    },
    {
      code: 'MANGLER_TIL',
      felt: 'bruttoinntekt-sykefravaerperioder-tom-uuid-undefined'
    }
  ];

  expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
});
it('should return an error when Sykefravaer fom is missing', () => {
  const input: CompleteState = {
    bruttoinntekt: {
      bruttoInntekt: 123,
      manueltKorrigert: true,
      endringAarsak: {
        aarsak: begrunnelseEndringBruttoinntekt.Sykefravaer,
        sykefravaer: [{ tom: '2022-01-02' }]
      }
    }
  };
  const skjemaData: Skjema = {
    bekreft_opplysninger: true,
    inntekt: {
      beloep: 123,
      endringAarsaker: [
        {
          aarsak: begrunnelseEndringBruttoinntekt.Sykefravaer,
          sykefravaer: [{ tom: '2022-01-02' }]
        }
      ],

      inntektsdato: '2021-01-01',
      naturalytelser: []
    }
  };
  const expected = [
    {
      code: 'MANGLER_FRA',
      felt: 'bruttoinntekt-sykefravaerperioder-fom-uuid-2022-01-02'
    }
  ];

  expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
});

// it('should return an error when permittering tom is missing, sykefravær', () => {
//   const input: CompleteState = {
//     bruttoinntekt: {
//       bruttoInntekt: 123,
//       manueltKorrigert: true,
//       endringAarsak: {
//         aarsak: begrunnelseEndringBruttoinntekt.Permittering,
//         permitteringer: [{ fom: '2022-01-02' }]
//       }
//     }
//   };
//   const skjemaData: Skjema = {
//     bekreft_opplysninger: true,
//     inntekt: {
//       beloep: 123,
//       endringAarsaker: [
//         {
//           aarsak: begrunnelseEndringBruttoinntekt.Permittering,
//           permitteringer: [{ fom: '2022-01-02' }]
//         }
//       ],

//
//       inntektsdato: '2021-01-01',
//       naturalytelser: []
//     }
//   };
//   const expected = [
//     {
//       code: 'MANGLER_TIL',
//       felt: 'bruttoinntekt-permittering-tom-2022-01-02-undefined'
//     }
//   ];

//   expect(validerBruttoinntekt(input, skjemaData, new Date('2021-01-01'))).toEqual(expected);
// });
