import validerDelvisInntektsmelding, {
  SubmitInntektsmeldingReturnvalues
} from '../../utils/validerDelvisInntektsmelding';
import parseIsoDate from '../../utils/parseIsoDate';
import { vi, describe } from 'vitest';

describe.concurrent('validerDelvisInntektsmelding', () => {
  let opplysningerBekreftet: boolean;
  let kunInntektOgRefusjon: boolean | undefined;

  beforeEach(() => {
    opplysningerBekreftet = true;
    kunInntektOgRefusjon = true;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return valideringOK as true when there are no errors', () => {
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
    const result: SubmitInntektsmeldingReturnvalues = validerDelvisInntektsmelding(
      state,
      opplysningerBekreftet,
      kunInntektOgRefusjon
    );

    expect(result.valideringOK).toBe(true);
  });

  it('should return valideringOK as false and errorTexts when there are errors. kunInntektOgRefusjon = true', () => {
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

    const result: SubmitInntektsmeldingReturnvalues = validerDelvisInntektsmelding(
      state,
      opplysningerBekreftet,
      kunInntektOgRefusjon
    );

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
          felt: 'lus-radio',
          text: 'Angi om arbeidsgiver betaler lønn under hele eller deler av sykefraværet.'
        }
      ]
    });
  });

  it('should return valideringOK as false and errorTexts when there are errors. kunInntektOgRefusjon = false', () => {
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

    const result: SubmitInntektsmeldingReturnvalues = validerDelvisInntektsmelding(state, opplysningerBekreftet, false);

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
          felt: 'backend',
          text: 'MANGLER_PERIODE'
        }
      ]
    });
  });
});
