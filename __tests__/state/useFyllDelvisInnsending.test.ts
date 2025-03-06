import { describe, it, expect, vi, Mock } from 'vitest';
import useFyllDelvisInnsending from '../../state/useFyllDelvisInnsending';
import fullInnsendingSchema from '../../schema/fullInnsendingSchema';
import useBoundStore from '../../state/useBoundStore';
import { nanoid } from 'nanoid';

vi.mock('nanoid');

vi.mock('../../state/useBoundStore', () => ({
  __esModule: true,
  default: vi.fn(),
  useBoundStore: vi.fn()
}));

const setSkalViseFeilmeldinger = vi.fn();
const state = {
  fravaersperioder: [],
  egenmeldingsperioder: [],
  fullLonnIArbeidsgiverPerioden: false,
  naturalytelser: [],
  arbeidsgiverperioder: [],
  harRefusjonEndringer: 'Nei',
  refusjonEndringer: [],
  hentPaakrevdOpplysningstyper: () => [],
  skjaeringstidspunkt: null,
  setSkalViseFeilmeldinger: setSkalViseFeilmeldinger,
  arbeidsgiverKanFlytteSkjæringstidspunkt: vi.fn(),
  bestemmendeFravaersdag: null,
  mottattBestemmendeFravaersdag: null,
  mottattEksternBestemmendeFravaersdag: null,
  setForeslaattBestemmendeFravaersdag: vi.fn()
};

describe('useFyllDelvisInnsending', () => {
  const mockSkjema = {
    refusjon: {
      erDetEndringRefusjon: 'Nei',
      kreverRefusjon: 'Nei',
      refusjonPrMnd: 0,
      kravetOpphoerer: 'Nei',
      refusjonOpphoerer: null,
      refusjonEndringer: []
    },
    inntekt: {
      beloep: 1000,
      endringAarsak: null,
      endringsaarsaker: null
    },
    telefon: '12345678'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useBoundStore as unknown as Mock).mockImplementation((stateFn) => stateFn(state));
    nanoid.mockReturnValue('8d50ef20-37b5-4829-ad83-56219e70b375');
  });

  it('should return a valid FullInnsending object', () => {
    const fyllDelvisInnsending = useFyllDelvisInnsending();
    const result = fyllDelvisInnsending(mockSkjema, '8d50ef20-37b5-4829-ad83-56219e70b375');

    const parsedResult = fullInnsendingSchema.safeParse(result);
    expect(parsedResult.success).toBe(true);
  });

  it('should set skalViseFeilmeldinger to true', () => {
    const fyllDelvisInnsending = useFyllDelvisInnsending();
    fyllDelvisInnsending(mockSkjema, '8d50ef20-37b5-4829-ad83-56219e70b375');

    expect(setSkalViseFeilmeldinger).toHaveBeenCalledWith(true);
  });

  it('should handle refusjon endringer correctly', () => {
    const mockSkjemaWithRefusjon = {
      ...mockSkjema,
      refusjon: {
        ...mockSkjema.refusjon,
        erDetEndringRefusjon: 'Ja',
        kreverRefusjon: 'Ja',
        refusjonEndringer: [{ dato: new Date(), beloep: 1000 }]
      }
    };

    const fyllDelvisInnsending = useFyllDelvisInnsending();
    const result = fyllDelvisInnsending(mockSkjemaWithRefusjon, '8d50ef20-37b5-4829-ad83-56219e70b375');

    expect(result.refusjon?.endringer).toHaveLength(1);
    expect(result.refusjon?.endringer[0].beloep).toBe(1000);
  });

  it('should handle arbeidsgiverperioder correctly', () => {
    const nyState = {
      ...state,
      arbeidsgiverperioder: [{ fom: new Date(), tom: new Date() }],
      hentPaakrevdOpplysningstyper: () => ['arbeidsgiverperiode']
    };

    (useBoundStore as unknown as Mock).mockImplementation((stateFn) => stateFn(nyState));

    const fyllDelvisInnsending = useFyllDelvisInnsending();
    const result = fyllDelvisInnsending(mockSkjema, '8d50ef20-37b5-4829-ad83-56219e70b375');

    expect(result.agp?.perioder).toHaveLength(1);
  });
});
