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

    // Call the validerInntektsmelding function

    const result = validerInntektsmelding(state, true);

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

    // Call the validerInntektsmelding function with invalid data
    const result = validerInntektsmelding(state, false);

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
});
