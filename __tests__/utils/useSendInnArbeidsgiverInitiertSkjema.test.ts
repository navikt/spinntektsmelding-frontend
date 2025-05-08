import { describe, it, expect, vi, Mock } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { z } from 'zod';
import { hovedskjemaSchema } from '../../schema/hovedskjemaSchema';
import useSendInnArbeidsgiverInitiertSkjema from '../../utils/useSendInnArbeidsgiverInitiertSkjema';
import logEvent from '../../utils/logEvent';
import validerInntektsmelding from '../../utils/validerInntektsmelding';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import useBoundStore from '../../state/useBoundStore';
import mockRouter from 'next-router-mock';
import useFyllAapenInnsending from '../../state/useFyllAapenInnsending';

vi.mock('next/router', () => require('next-router-mock'));
vi.mock('../../state/useBoundStore');
vi.mock('../state/useFyllInnsending');
vi.mock('../../utils/logEvent', { spy: true });
vi.mock('../../utils/isValidUUID', () => ({ default: vi.fn().mockReturnValue(true) }));
vi.mock('../../utils/validerInntektsmelding', { spy: true });
vi.mock('./useErrorResponse');
vi.mock('../schema/fullInnsendingSchema', () => ({
  default: { safeParse: vi.fn().mockReturnValue({ success: true }) }
}));
vi.mock('../schema/responseBackendError', () => ({
  default: { safeParse: vi.fn().mockReturnValue({ success: true }) }
}));
vi.mock('../../state/useFyllAapenInnsending');

describe('useSendInnArbeidsgiverInitiertSkjema', () => {
  const innsendingFeiletIngenTilgang = vi.fn();
  const amplitudeComponent = 'testComponent';
  const defaultFormData = {} as z.infer<typeof hovedskjemaSchema>;
  const pathSlug = 'arbeidsgiverInitiertInnsending';

  // Setup default mock store state
  const setupMockStore = () => {
    (useBoundStore as Mock).mockImplementation((stateFn) =>
      stateFn({
        sykmeldt: { navn: 'John Doe', fnr: '12345678901' },
        avsender: { orgnr: '987654321', orgNavn: 'Example Company', navn: 'Jane Doe', tlf: '12345678' },
        feilVedLasting: { persondata: null, arbeidsgiverdata: null },
        fyllFeilmeldinger: vi.fn(),
        setSkalViseFeilmeldinger: vi.fn(),
        setKvitteringInnsendt: vi.fn(),
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
    (useFyllAapenInnsending as Mock).mockReturnValue(vi.fn().mockReturnValue({ success: true }));

    const { result } = renderHook(() =>
      useSendInnArbeidsgiverInitiertSkjema(innsendingFeiletIngenTilgang, amplitudeComponent, SkjemaStatus.FULL)
    );

    const response = await result.current(true, pathSlug, false, defaultFormData);

    expect(response).toBe(false);
    expect(logEvent).toHaveBeenCalled();
  });

  it('should handle validation errors', async () => {
    setupMockStore();
    (useFyllAapenInnsending as Mock).mockReturnValue(
      vi.fn().mockReturnValue({
        success: false,
        error: { issues: [{ message: 'test error', path: ['test', 'test2'] }] }
      })
    );

    const { result } = renderHook(() =>
      useSendInnArbeidsgiverInitiertSkjema(innsendingFeiletIngenTilgang, amplitudeComponent, SkjemaStatus.FULL)
    );

    (validerInntektsmelding as Mock).mockReturnValueOnce({ errorTexts: [{ message: 'test error' }] });

    await act(async () => {
      await result.current(true, pathSlug, true, defaultFormData);
    });

    expect(logEvent).toHaveBeenCalledWith('skjema validering feilet', {
      tittel: 'Validering feilet',
      component: amplitudeComponent
    });
  });

  it('should handle successful submission', async () => {
    setupMockStore();
    (useFyllAapenInnsending as Mock).mockReturnValue(vi.fn().mockReturnValue({ success: true }));

    const { result } = renderHook(() =>
      useSendInnArbeidsgiverInitiertSkjema(innsendingFeiletIngenTilgang, amplitudeComponent, SkjemaStatus.FULL)
    );

    global.fetch = vi.fn().mockResolvedValue({
      status: 201,
      json: vi.fn().mockResolvedValue({})
    });

    (validerInntektsmelding as Mock).mockReturnValueOnce([]);

    await act(async () => {
      await result.current(true, pathSlug, true, defaultFormData);
    });

    expect(mockRouter).toMatchObject({ route: `/kvittering/${pathSlug}` });
  });

  it('should handle server error 500', async () => {
    setupMockStore();
    (useFyllAapenInnsending as Mock).mockReturnValue(vi.fn().mockReturnValue({ success: true }));

    const { result } = renderHook(() =>
      useSendInnArbeidsgiverInitiertSkjema(innsendingFeiletIngenTilgang, amplitudeComponent, SkjemaStatus.FULL)
    );

    global.fetch = vi.fn().mockResolvedValue({
      status: 500,
      json: vi.fn().mockResolvedValue({})
    });

    (validerInntektsmelding as Mock).mockReturnValueOnce([]);

    await act(async () => {
      await result.current(true, pathSlug, true, defaultFormData);
    });

    expect(logEvent).toHaveBeenCalledWith('skjema innsending feilet', {
      tittel: 'Innsending feilet - serverfeil',
      component: amplitudeComponent
    });
  });

  it('should handle unauthorized error 401', async () => {
    setupMockStore();
    (useFyllAapenInnsending as Mock).mockReturnValue(vi.fn().mockReturnValue({ success: true }));

    const { result } = renderHook(() =>
      useSendInnArbeidsgiverInitiertSkjema(innsendingFeiletIngenTilgang, amplitudeComponent, SkjemaStatus.FULL)
    );

    global.fetch = vi.fn().mockResolvedValue({
      status: 401,
      json: vi.fn().mockResolvedValue({})
    });

    await act(async () => {
      await result.current(true, pathSlug, true, defaultFormData);
    });

    expect(innsendingFeiletIngenTilgang).toHaveBeenCalledWith(true);
  });
});
