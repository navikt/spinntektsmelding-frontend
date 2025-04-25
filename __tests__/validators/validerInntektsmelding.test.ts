import { vi } from 'vitest';
import validerInntektsmelding from '../../utils/validerInntektsmelding';
import parseIsoDate from '../../utils/parseIsoDate';

describe('validerInntektsmelding', () => {
  it('should return an object with valideringOK as true and empty errorTexts when there are no errors', () => {
    // Mock the state and other dependencies
    const mockSetSkalViseFeilmeldinger = vi.fn();
    const state = {
      fravaersperioder: [{ fom: parseIsoDate('2021-01-01'), tom: parseIsoDate('2021-01-31'), id: '1' }],
      // egenmeldingsperioder: [],
      naturalytelser: [],
      hasBortfallAvNaturalytelser: false,
      fullLonnIArbeidsgiverPerioden: {
        status: 'Ja'
      },
      arbeidsgiverperioder: [{ fom: parseIsoDate('2021-01-01'), tom: parseIsoDate('2021-01-16') }],
      lonnISykefravaeret: { status: 'Nei' },
      refusjonskravetOpphoerer: false,
      bruttoinntekt: { bruttoInntekt: 0 },
      nyInnsending: false,
      harRefusjonEndringer: false,
      refusjonEndringer: [],
      innsenderTelefonNr: '12345678',
      setSkalViseFeilmeldinger: mockSetSkalViseFeilmeldinger
    };

    const formData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 12345,
        endringAarsaker: null,

        inntektsdato: '2021-01-01',
        naturalytelser: [],
        harBortfallAvNaturalytelser: false
      },
      avsenderTlf: '12345678'
    };

    // Call the validerInntektsmelding function

    const result = validerInntektsmelding(state, true, false, formData);

    // Assert the result
    expect(mockSetSkalViseFeilmeldinger).toHaveBeenCalledWith(true);
    expect(result).toEqual({
      valideringOK: true,
      errorTexts: []
    });
  });

  it('should return an object with valideringOK as false and errorTexts when there are errors', () => {
    // Mock the state and other dependencies
    const mockSetSkalViseFeilmeldinger = vi.fn();

    const state = {
      fravaersperioder: [],
      egenmeldingsperioder: [],
      naturalytelser: [],
      hasBortfallAvNaturalytelser: false,
      fullLonnIArbeidsgiverPerioden: 0,
      arbeidsgiverperioder: [],
      lonnISykefravaeret: 0,
      refusjonskravetOpphoerer: false,
      bruttoinntekt: { bruttoInntekt: 0 },
      nyInnsending: false,
      harRefusjonEndringer: false,
      refusjonEndringer: [],
      innsenderTelefonNr: '',
      setSkalViseFeilmeldinger: mockSetSkalViseFeilmeldinger
    };

    const formData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 12345,
        endringAarsaker: null,

        inntektsdato: '2021-01-01',
        naturalytelser: [],
        harBortfallAvNaturalytelser: false
      }
    };

    // Call the validerInntektsmelding function with invalid data
    const result = validerInntektsmelding(state, false, false, formData);

    // Assert the result
    expect(result).toEqual({
      valideringOK: false,
      errorTexts: [
        {
          felt: '',
          text: 'Mangler fraværsperiode.'
        },
        {
          felt: 'backend',
          text: 'MANGLER_PERIODE'
        },
        {
          felt: 'agp.redusertLoennIAgp.begrunnelse',
          text: 'Begrunnelse for redusert utbetaling av lønn i arbeidsgiverperioden mangler.'
        },
        {
          felt: 'agp.redusertLoennIAgp.beloep',
          text: 'Angi beløp. Må være høyere enn eller lik 0 og på formatet 1234,50'
        },
        {
          felt: 'lus-radio',
          text: 'Angi om arbeidsgiver betaler lønn under hele eller deler av sykefraværet.'
        },
        {
          felt: 'bekreft-opplysninger',
          text: 'Bekreft at opplysningene gitt er riktig og fullstendige.'
        },
        {
          felt: 'backend',
          text: 'MANGLER_PERIODE'
        },
        {
          felt: 'telefon',
          text: 'Telefonnummer mangler'
        }
      ]
    });
  });

  it('should return an object with valideringOK as false and  errorTexts when fraværsperiode is missing', () => {
    // Mock the state and other dependencies
    const mockSetSkalViseFeilmeldinger = vi.fn();
    const state = {
      fravaersperioder: undefined,
      // egenmeldingsperioder: [],
      naturalytelser: [],
      hasBortfallAvNaturalytelser: false,
      fullLonnIArbeidsgiverPerioden: {
        status: 'Ja'
      },
      arbeidsgiverperioder: [{ fom: parseIsoDate('2021-01-01'), tom: parseIsoDate('2021-01-16') }],
      lonnISykefravaeret: { status: 'Nei' },
      refusjonskravetOpphoerer: false,
      bruttoinntekt: { bruttoInntekt: 0 },
      nyInnsending: false,
      harRefusjonEndringer: false,
      refusjonEndringer: [],
      innsenderTelefonNr: '12345678',
      setSkalViseFeilmeldinger: mockSetSkalViseFeilmeldinger
    };

    const formData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 12345,
        endringAarsaker: null,

        inntektsdato: '2021-01-01',
        naturalytelser: [],
        harBortfallAvNaturalytelser: false
      },
      avsenderTlf: '12345678'
    };

    // Call the validerInntektsmelding function

    const result = validerInntektsmelding(state, true, false, formData);

    // Assert the result
    expect(mockSetSkalViseFeilmeldinger).toHaveBeenCalledWith(true);
    expect(result).toEqual({
      valideringOK: false,
      errorTexts: [
        {
          felt: '',
          text: 'Mangler fraværsperiode.'
        }
      ]
    });
  });

  it('should return an object with valideringOK as true and empty errorTexts when there are no errors and agp is not required', () => {
    // Mock the state and other dependencies
    const mockSetSkalViseFeilmeldinger = vi.fn();
    const state = {
      fravaersperioder: [{ fom: parseIsoDate('2021-01-01'), tom: parseIsoDate('2021-01-31'), id: '1' }],
      // egenmeldingsperioder: [],
      naturalytelser: [],
      hasBortfallAvNaturalytelser: false,
      fullLonnIArbeidsgiverPerioden: {
        status: 'Ja'
      },
      arbeidsgiverperioder: [{ fom: parseIsoDate('2021-01-01'), tom: parseIsoDate('2021-01-16') }],
      lonnISykefravaeret: { status: 'Nei' },
      refusjonskravetOpphoerer: false,
      bruttoinntekt: { bruttoInntekt: 0 },
      nyInnsending: false,
      harRefusjonEndringer: false,
      refusjonEndringer: [],
      innsenderTelefonNr: '12345678',
      setSkalViseFeilmeldinger: mockSetSkalViseFeilmeldinger,
      forespurtData: {
        arbeidsgiverperiode: {
          paakrevd: false
        }
      }
    };

    const formData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 12345,
        endringAarsaker: null,

        inntektsdato: '2021-01-01',
        naturalytelser: [],
        harBortfallAvNaturalytelser: false
      },
      avsenderTlf: '12345678'
    };

    // Call the validerInntektsmelding function

    const result = validerInntektsmelding(state, true, false, formData);

    // Assert the result
    expect(mockSetSkalViseFeilmeldinger).toHaveBeenCalledWith(true);
    expect(result).toEqual({
      valideringOK: true,
      errorTexts: []
    });
  });

  it('should return an object with valideringOK as true and empty errorTexts when there are no errors and there are egenmeldingsperioder', () => {
    // Mock the state and other dependencies
    const mockSetSkalViseFeilmeldinger = vi.fn();
    const state = {
      fravaersperioder: [{ fom: parseIsoDate('2021-01-02'), tom: parseIsoDate('2021-01-31'), id: '1' }],
      egenmeldingsperioder: [{ fom: parseIsoDate('2021-01-01'), tom: parseIsoDate('2021-01-01'), id: '1' }],
      naturalytelser: [],
      hasBortfallAvNaturalytelser: false,
      fullLonnIArbeidsgiverPerioden: {
        status: 'Ja'
      },
      arbeidsgiverperioder: [{ fom: parseIsoDate('2021-01-01'), tom: parseIsoDate('2021-01-16') }],
      lonnISykefravaeret: { status: 'Nei' },
      refusjonskravetOpphoerer: false,
      bruttoinntekt: { bruttoInntekt: 0 },
      nyInnsending: false,
      harRefusjonEndringer: false,
      refusjonEndringer: [],
      innsenderTelefonNr: '12345678',
      setSkalViseFeilmeldinger: mockSetSkalViseFeilmeldinger,
      forespurtData: {
        arbeidsgiverperiode: {
          paakrevd: true
        }
      }
    };

    const formData = {
      bekreft_opplysninger: true,
      inntekt: {
        beloep: 12345,
        endringAarsaker: null,

        inntektsdato: '2021-01-01',
        naturalytelser: [],
        harBortfallAvNaturalytelser: false
      },
      avsenderTlf: '12345678'
    };

    // Call the validerInntektsmelding function

    const result = validerInntektsmelding(state, true, false, formData);

    // Assert the result
    expect(mockSetSkalViseFeilmeldinger).toHaveBeenCalledWith(true);
    expect(result).toEqual({
      valideringOK: true,
      errorTexts: []
    });
  });
});
