import { describe, it, expect, vi, Mock } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { z } from 'zod/v4';
import { HovedskjemaSchema } from '../../schema/HovedskjemaSchema';
import useSendInnArbeidsgiverInitiertSkjema from '../../utils/useSendInnArbeidsgiverInitiertSkjema';
import logEvent from '../../utils/logEvent';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import useBoundStore from '../../state/useBoundStore';
import mockRouter from 'next-router-mock';
import useFyllAapenInnsending from '../../state/useFyllAapenInnsending';
import { postInnsending } from '../../utils/postInnsending';

vi.mock('next/router', () => require('next-router-mock'));
vi.mock('../../state/useBoundStore');
vi.mock('../state/useFyllInnsending');
vi.mock('../../utils/logEvent', { spy: true });
vi.mock('../../utils/isValidUUID', () => ({ default: vi.fn().mockReturnValue(true) }));
vi.mock('./useErrorResponse');
vi.mock('../schema/FullInnsendingSchema', () => ({
  default: { safeParse: vi.fn().mockReturnValue({ success: true }) }
}));
vi.mock('../schema/ResponseBackendErrorSchema', () => ({
  default: { safeParse: vi.fn().mockReturnValue({ success: true }) }
}));
vi.mock('../../state/useFyllAapenInnsending');
vi.mock('../../utils/postInnsending', { spy: true });

describe('useSendInnArbeidsgiverInitiertSkjema', () => {
  const innsendingFeiletIngenTilgang = vi.fn();
  const analyticsComponent = 'testComponent';
  const defaultFormData = { bekreft_opplysninger: true } as z.infer<typeof HovedskjemaSchema>;
  const pathSlug = 'arbeidsgiverInitiertInnsending';

  // Setup default mock store state
  const setupMockStore = () => {
    (useBoundStore as unknown as Mock).mockImplementation((stateFn) =>
      stateFn({
        sykmeldt: { navn: 'John Doe', fnr: '12345678901' },
        avsender: { orgnr: '987654321', orgNavn: 'Example Company', navn: 'Jane Doe', tlf: '12345678' },
        feilVedLasting: { persondata: null, arbeidsgiverdata: null },
        fyllFeilmeldinger: vi.fn(),
        setSkalViseFeilmeldinger: vi.fn(),
        setMottatt: vi.fn(),
        harRefusjonEndringer: vi.fn(),
        arbeidsgiverKanFlytteSkjæringstidspunkt: vi.fn(),
        setEndringAarsaker: vi.fn(),
        setBareNyMaanedsinntekt: vi.fn(),
        setInnsenderTelefon: vi.fn(),
        initNaturalytelser: vi.fn(),
        setKvitteringData: vi.fn(),
        leggTilFeilmelding: vi.fn(),
        fullLonnIArbeidsgiverPerioden: { status: 'Ja' },
        lonnISykefravaeret: { status: 'Nei' },
        vedtaksperiodeId: '1234567890',
        skjaeringstidspunkt: new Date('2023-01-01'),
        arbeidsgiverperioder: [{ fom: new Date('2023-01-01'), tom: new Date('2023-01-10') }],
        sykmeldingsperioder: [{ fom: new Date('2023-01-01'), tom: new Date('2023-01-10') }]
      })
    );
  };

  afterEach(() => {
    vi.resetAllMocks();
    cleanup();
  });

  it('should return false if form is not dirty', async () => {
    setupMockStore();
    (useFyllAapenInnsending as unknown as Mock).mockReturnValue(vi.fn().mockReturnValue({ success: true }));

    const { result } = renderHook(() =>
      useSendInnArbeidsgiverInitiertSkjema(innsendingFeiletIngenTilgang, analyticsComponent, SkjemaStatus.FULL)
    );

    const response = await result.current({
      pathSlug,
      isDirtyForm: false,
      formData: defaultFormData,
      erBegrensetForespoersel: false
    });

    expect(response).toBe(false);
    expect(logEvent).toHaveBeenCalled();
  });

  it('should handle validation errors', async () => {
    setupMockStore();
    (useFyllAapenInnsending as unknown as Mock).mockReturnValue(
      vi.fn().mockReturnValue({
        success: false,
        error: { issues: [{ error: 'test error', path: ['test', 'test2'] }] }
      })
    );

    const { result } = renderHook(() =>
      useSendInnArbeidsgiverInitiertSkjema(innsendingFeiletIngenTilgang, analyticsComponent, SkjemaStatus.FULL)
    );

    await act(async () => {
      await result.current({ pathSlug, isDirtyForm: true, formData: defaultFormData, erBegrensetForespoersel: false });
    });

    expect(logEvent).toHaveBeenCalledWith('skjema validering feilet', {
      tittel: 'Validering feilet',
      component: analyticsComponent
    });
  });

  it.each([
    { status: SkjemaStatus.FULL, receiptPath: '/kvittering', flereArbeidsforhold: null },
    { status: SkjemaStatus.SELVBESTEMT, receiptPath: '/kvittering/agi', flereArbeidsforhold: null },
    {
      status: SkjemaStatus.FULL,
      receiptPath: '/kvittering',
      flereArbeidsforhold: { harLikLoenn: false, erSykmeldtFraAlle: false, arbeidsforhold: [] }
    },
    {
      status: SkjemaStatus.SELVBESTEMT,
      receiptPath: '/kvittering/agi',
      flereArbeidsforhold: { harLikLoenn: false, erSykmeldtFraAlle: false, arbeidsforhold: [] }
    }
  ])(
    'should show submitted data at $receiptPath with FAISU $flereArbeidsforhold',
    async ({ status, receiptPath, flereArbeidsforhold }) => {
      setupMockStore();
      (useFyllAapenInnsending as unknown as Mock).mockReturnValue(
        vi.fn().mockReturnValue({
          success: true,
          data: {
            fullLonn: 'Ja',
            agp: null,
            inntekt: { beloep: 50000 },
            refusjon: null,
            avsenderTlf: '12345678',
            flereArbeidsforhold
          }
        })
      );

      const { result } = renderHook(() =>
        useSendInnArbeidsgiverInitiertSkjema(innsendingFeiletIngenTilgang, analyticsComponent, status)
      );

      global.fetch = vi.fn().mockResolvedValue({
        status: 201,
        json: vi.fn().mockResolvedValue({ selvbestemtId: 'f32852af-888e-4d0c-ad67-081f22ee5c12' })
      });

      await act(async () => {
        await result.current({
          pathSlug,
          isDirtyForm: true,
          formData: defaultFormData,
          erBegrensetForespoersel: false
        });
      });

      expect(postInnsending).toHaveBeenCalledWith(
        expect.objectContaining({ body: expect.objectContaining({ flereArbeidsforhold }) })
      );
      expect(mockRouter).toMatchObject({
        route: `${receiptPath}/f32852af-888e-4d0c-ad67-081f22ee5c12`,
        query: { fromSubmit: 'true' },
        asPath: `${receiptPath}/f32852af-888e-4d0c-ad67-081f22ee5c12`
      });
    }
  );

  it('should handle server error 500', async () => {
    setupMockStore();
    (useFyllAapenInnsending as unknown as Mock).mockReturnValue(
      vi.fn().mockReturnValue({
        success: true,
        data: {
          fullLonn: 'Ja',
          agp: null,
          inntekt: { beloep: 50000 },
          refusjon: null,
          avsenderTlf: '12345678'
        }
      })
    );

    const { result } = renderHook(() =>
      useSendInnArbeidsgiverInitiertSkjema(innsendingFeiletIngenTilgang, analyticsComponent, SkjemaStatus.FULL)
    );

    global.fetch = vi.fn().mockResolvedValue({
      status: 500,
      json: vi.fn().mockResolvedValue({})
    });

    await act(async () => {
      await result.current({ pathSlug, isDirtyForm: true, formData: defaultFormData, erBegrensetForespoersel: false });
    });

    expect(logEvent).toHaveBeenCalledWith('skjema innsending feilet', {
      tittel: 'Innsending feilet - serverfeil',
      component: analyticsComponent
    });
  });

  it('should handle unauthorized error 401', async () => {
    setupMockStore();
    (useFyllAapenInnsending as unknown as Mock).mockReturnValue(
      vi.fn().mockReturnValue({
        success: true,
        data: {
          fullLonn: 'Ja',
          agp: null,
          inntekt: { beloep: 50000 },
          refusjon: null,
          avsenderTlf: '12345678'
        }
      })
    );

    const { result } = renderHook(() =>
      useSendInnArbeidsgiverInitiertSkjema(innsendingFeiletIngenTilgang, analyticsComponent, SkjemaStatus.FULL)
    );

    global.fetch = vi.fn().mockResolvedValue({
      status: 401,
      json: vi.fn().mockResolvedValue({})
    });

    await act(async () => {
      await result.current({ pathSlug, isDirtyForm: true, formData: defaultFormData, erBegrensetForespoersel: false });
    });

    expect(innsendingFeiletIngenTilgang).toHaveBeenCalledWith(true);
  });

  it.each([false, undefined])('blocks submission when bekreft_opplysninger=%s', async (bekreft_opplysninger) => {
    setupMockStore();
    (useFyllAapenInnsending as unknown as Mock).mockReturnValue(
      vi.fn().mockReturnValue({ success: true, data: { agp: null, inntekt: { beloep: 50000 } } })
    );
    const { result } = renderHook(() =>
      useSendInnArbeidsgiverInitiertSkjema(innsendingFeiletIngenTilgang, analyticsComponent, SkjemaStatus.SELVBESTEMT)
    );

    let response: Awaited<ReturnType<typeof result.current>>;
    await act(async () => {
      response = await result.current({
        pathSlug,
        isDirtyForm: true,
        formData: { ...defaultFormData, bekreft_opplysninger } as unknown as z.infer<typeof HovedskjemaSchema>,
        erBegrensetForespoersel: false
      });
    });

    expect(response!).toBe(false);
    expect(postInnsending).not.toHaveBeenCalled();
    expect(logEvent).toHaveBeenCalledWith('skjema validering feilet', {
      tittel: 'Validering feilet',
      component: analyticsComponent
    });
  });
});
