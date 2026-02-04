import { describe, it, expect, vi, Mock, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { z } from 'zod/v4';
import { HovedskjemaSchema } from '../../schema/HovedskjemaSchema';

import useSendInnSkjema from '../../utils/useSendInnSkjema';
import logEvent from '../../utils/logEvent';
import { Opplysningstype } from '../../schema/ForespurtDataSchema';
import FullInnsendingSchema from '../../schema/FullInnsendingSchema';
import { postInnsending } from '../../utils/postInnsending';

type FullInnsendingType = z.infer<typeof HovedskjemaSchema>;

const mockFyllFeilmeldinger = vi.fn();
const mockSetSkalViseFeilmeldinger = vi.fn();
const mockSetKvitteringInnsendt = vi.fn();
const mockFullLonnIArbeidsgiverPerioden = { status: 'Ja', begrunnelse: undefined, utbetalt: undefined };
const mockLonnISykefravaeret = { status: 'Ja' };
const mockHarRefusjonEndringer = 'Nei';
const mockFyllInnsending = vi.fn();
const mockErrorResponse = vi.fn();
const mockRouterPush = vi.fn();

vi.mock('next/router', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    query: {},
    pathname: '/',
    route: '/',
    asPath: '/'
  })
}));

vi.mock('../../state/useBoundStore', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation((selector) => {
    const selectorName = selector.toString();
    if (selectorName.includes('fyllFeilmeldinger')) return mockFyllFeilmeldinger;
    if (selectorName.includes('setSkalViseFeilmeldinger')) return mockSetSkalViseFeilmeldinger;
    if (selectorName.includes('setKvitteringInnsendt')) return mockSetKvitteringInnsendt;
    if (selectorName.includes('fullLonnIArbeidsgiverPerioden')) return mockFullLonnIArbeidsgiverPerioden;
    if (selectorName.includes('lonnISykefravaeret')) return mockLonnISykefravaeret;
    if (selectorName.includes('harRefusjonEndringer')) return mockHarRefusjonEndringer;
    return vi.fn();
  })
}));

vi.mock('../../state/useFyllInnsending', () => ({
  __esModule: true,
  default: () => mockFyllInnsending
}));

vi.mock('../../utils/logEvent', { spy: true });

vi.mock('../../utils/isValidUUID', () => ({
  __esModule: true,
  default: vi.fn().mockReturnValue(true)
}));

vi.mock('../../utils/useErrorResponse', () => ({
  __esModule: true,
  default: () => mockErrorResponse,
  ErrorResponse: vi.fn()
}));

vi.mock('../../utils/postInnsending', { spy: true });

vi.mock('../../schema/FullInnsendingSchema', { spy: true });

describe('useSendInnSkjema', () => {
  const innsendingFeiletIngenTilgang = vi.fn();
  const amplitudeComponent = 'testComponent';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log event and return false if form is not dirty', async () => {
    const { result } = renderHook(() => useSendInnSkjema(innsendingFeiletIngenTilgang, amplitudeComponent));

    const opplysningerBekreftet = true;
    const forespurteOpplysningstyper: Opplysningstype[] = [];
    const pathSlug = 'test-path';
    const isDirtyForm = false;
    const formData = {} as z.infer<typeof HovedskjemaSchema>;

    let response: boolean | undefined;
    await act(async () => {
      response = await result.current(
        opplysningerBekreftet,
        forespurteOpplysningstyper,
        pathSlug,
        isDirtyForm,
        formData,
        false
      );
    });

    expect(response).toBe(false);
    expect(logEvent).toHaveBeenCalledWith('skjema fullført', {
      tittel: 'Innsending uten endringer i skjema',
      component: amplitudeComponent
    });
    expect(mockErrorResponse).toHaveBeenCalled();
  });

  it('should handle validation errors from FullInnsendingSchema', async () => {
    const { result } = renderHook(() => useSendInnSkjema(innsendingFeiletIngenTilgang, amplitudeComponent));

    const opplysningerBekreftet = true;
    const forespurteOpplysningstyper: Opplysningstype[] = [];
    const pathSlug = 'test-path';
    const isDirtyForm = true;
    const formData = {} as z.infer<typeof HovedskjemaSchema>;

    // Mock fyllInnsending to return invalid data
    mockFyllInnsending.mockReturnValue({});

    await act(async () => {
      await result.current(opplysningerBekreftet, forespurteOpplysningstyper, pathSlug, isDirtyForm, formData, false);
    });

    expect(logEvent).toHaveBeenCalledWith('skjema validering feilet', {
      tittel: 'Validering feilet',
      component: amplitudeComponent
    });
    expect(mockFyllFeilmeldinger).toHaveBeenCalled();
  });

  it('should handle invalid UUID', async () => {
    // Mock safeParse to return success so we can test UUID validation
    vi.spyOn(FullInnsendingSchema, 'safeParse').mockReturnValueOnce({
      success: true,
      data: {
        forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375',
        agp: null,
        inntekt: { beloep: 50000, inntektsdato: '2025-01-01', endringAarsaker: [] },
        refusjon: null,
        naturalytelser: [],
        avsenderTlf: '12345678'
      }
    } as any);

    const isValidUUID = await import('../../utils/isValidUUID');
    (isValidUUID.default as Mock).mockReturnValueOnce(false);

    const { result } = renderHook(() => useSendInnSkjema(innsendingFeiletIngenTilgang, amplitudeComponent));

    const opplysningerBekreftet = true;
    const forespurteOpplysningstyper: Opplysningstype[] = [];
    const pathSlug = 'invalid-uuid';
    const isDirtyForm = true;
    const formData: FullInnsendingType = {
      forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      agp: null,
      inntekt: null,
      refusjon: {
        beloepPerMaaned: 50000,
        endringer: [],
        isEditing: false,
        harEndringer: 'Nei'
      },
      avsenderTlf: '12345678'
    };

    mockFyllInnsending.mockReturnValue({
      forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      agp: null,
      inntekt: { beloep: 50000 },
      refusjon: null,
      avsenderTlf: '12345678'
    });

    let response: boolean | undefined;
    await act(async () => {
      response = await result.current(
        opplysningerBekreftet,
        forespurteOpplysningstyper,
        pathSlug,
        isDirtyForm,
        formData,
        false
      );
    });

    expect(response).toBe(false);
    expect(logEvent).toHaveBeenCalledWith('skjema validering feilet', {
      tittel: 'Ugyldig UUID ved innsending',
      component: amplitudeComponent
    });
    expect(mockErrorResponse).toHaveBeenCalled();
  });

  it('should call postInnsending with correct parameters on valid submission', async () => {
    // Mock safeParse to return success
    vi.spyOn(FullInnsendingSchema, 'safeParse').mockReturnValueOnce({
      success: true,
      data: {
        forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375',
        agp: null,
        inntekt: { beloep: 50000, inntektsdato: '2025-01-01', endringAarsaker: [] },
        refusjon: null,
        naturalytelser: [],
        avsenderTlf: '12345678'
      }
    } as any);

    vi.mocked(postInnsending).mockResolvedValue(undefined);

    const { result } = renderHook(() => useSendInnSkjema(innsendingFeiletIngenTilgang, amplitudeComponent));

    const opplysningerBekreftet = true;
    const forespurteOpplysningstyper: Opplysningstype[] = [];
    const pathSlug = '8d50ef20-37b5-4829-ad83-56219e70b375';
    const isDirtyForm = true;
    const formData: FullInnsendingType = {
      forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      agp: null,
      inntekt: null,
      refusjon: {
        beloepPerMaaned: 50000,
        endringer: [],
        isEditing: false,
        harEndringer: 'Nei'
      },
      avsenderTlf: '12345678'
    };

    mockFyllInnsending.mockReturnValue({
      forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      agp: null,
      inntekt: { beloep: 50000 },
      refusjon: null,
      avsenderTlf: '12345678'
    });

    await act(async () => {
      await result.current(opplysningerBekreftet, forespurteOpplysningstyper, pathSlug, isDirtyForm, formData, false);
    });

    expect(postInnsending).toHaveBeenCalledWith(
      expect.objectContaining({
        amplitudeComponent: 'testComponent',
        body: expect.objectContaining({
          forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375'
        })
      })
    );
  });

  it('should call onSuccess callback and redirect to kvittering', async () => {
    // Mock safeParse to return success
    vi.spyOn(FullInnsendingSchema, 'safeParse').mockReturnValueOnce({
      success: true,
      data: {
        forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375',
        agp: null,
        inntekt: { beloep: 50000, inntektsdato: '2025-01-01', endringAarsaker: [] },
        refusjon: null,
        naturalytelser: [],
        avsenderTlf: '12345678'
      }
    } as any);

    vi.mocked(postInnsending).mockImplementation(async (options: any) => {
      await options.onSuccess(null);
    });

    const { result } = renderHook(() => useSendInnSkjema(innsendingFeiletIngenTilgang, amplitudeComponent));

    const opplysningerBekreftet = true;
    const forespurteOpplysningstyper: Opplysningstype[] = [];
    const pathSlug = '8d50ef20-37b5-4829-ad83-56219e70b375';
    const isDirtyForm = true;
    const formData: FullInnsendingType = {
      forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      agp: null,
      inntekt: null,
      refusjon: {
        beloepPerMaaned: 50000,
        endringer: [],
        isEditing: false,
        harEndringer: 'Nei'
      },
      avsenderTlf: '12345678'
    };

    mockFyllInnsending.mockReturnValue({
      forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      agp: null,
      inntekt: { beloep: 50000 },
      refusjon: {
        beloepPerMaaned: 50000,
        endringer: [],
        isEditing: false,
        harEndringer: 'Nei'
      },
      avsenderTlf: '12345678'
    });

    await act(async () => {
      await result.current(opplysningerBekreftet, forespurteOpplysningstyper, pathSlug, isDirtyForm, formData, false);
    });

    expect(mockSetKvitteringInnsendt).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith(`/kvittering/${pathSlug}?fromSubmit=true`);
  });

  it('should call onUnauthorized callback on 401', async () => {
    // Mock safeParse to return success
    vi.spyOn(FullInnsendingSchema, 'safeParse').mockReturnValueOnce({
      success: true,
      data: {
        forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375',
        agp: null,
        inntekt: { beloep: 50000, inntektsdato: '2025-01-01', endringAarsaker: [] },
        refusjon: null,
        naturalytelser: [],
        avsenderTlf: '12345678'
      }
    } as any);

    vi.mocked(postInnsending).mockImplementation(async (options: any) => {
      options.onUnauthorized();
    });

    const { result } = renderHook(() => useSendInnSkjema(innsendingFeiletIngenTilgang, amplitudeComponent));

    const opplysningerBekreftet = true;
    const forespurteOpplysningstyper: Opplysningstype[] = [];
    const pathSlug = '8d50ef20-37b5-4829-ad83-56219e70b375';
    const isDirtyForm = true;
    const formData: FullInnsendingType = {
      forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      agp: null,

      refusjon: {
        beloepPerMaaned: 50000,
        endringer: [],
        isEditing: false,
        harEndringer: 'Nei'
      },
      avsenderTlf: '12345678'
    };

    mockFyllInnsending.mockReturnValue({
      forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      agp: null,
      inntekt: { beloep: 50000 },
      refusjon: null,
      avsenderTlf: '12345678'
    });

    await act(async () => {
      await result.current(opplysningerBekreftet, forespurteOpplysningstyper, pathSlug, isDirtyForm, formData, false);
    });

    expect(innsendingFeiletIngenTilgang).toHaveBeenCalledWith(true);
  });

  it('should log initial event when form is submitted', async () => {
    const { result } = renderHook(() => useSendInnSkjema(innsendingFeiletIngenTilgang, amplitudeComponent));

    const opplysningerBekreftet = true;
    const forespurteOpplysningstyper: Opplysningstype[] = [];
    const pathSlug = 'test-path';
    const isDirtyForm = false;
    const formData = {} as z.infer<typeof HovedskjemaSchema>;

    await act(async () => {
      await result.current(opplysningerBekreftet, forespurteOpplysningstyper, pathSlug, isDirtyForm, formData, false);
    });

    expect(logEvent).toHaveBeenCalledWith('skjema fullført', {
      tittel: 'Har trykket send',
      component: amplitudeComponent
    });
  });

  it('should return false when checkCommonValidations returns errors', async () => {
    // Mock safeParse to return success
    vi.spyOn(FullInnsendingSchema, 'safeParse').mockReturnValueOnce({
      success: true,
      data: {
        forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375',
        agp: null,
        inntekt: { beloep: 50000, inntektsdato: '2025-01-01', endringAarsaker: [] },
        refusjon: null,
        naturalytelser: [],
        avsenderTlf: '12345678'
      }
    } as any);

    // Mock useBoundStore to return undefined for lonnISykefravaeret to trigger validation error
    const useBoundStore = await import('../../state/useBoundStore');
    vi.mocked(useBoundStore.default).mockImplementation((selector: any) => {
      const selectorName = selector.toString();
      if (selectorName.includes('fyllFeilmeldinger')) return mockFyllFeilmeldinger;
      if (selectorName.includes('setSkalViseFeilmeldinger')) return mockSetSkalViseFeilmeldinger;
      if (selectorName.includes('setKvitteringInnsendt')) return mockSetKvitteringInnsendt;
      if (selectorName.includes('fullLonnIArbeidsgiverPerioden')) return mockFullLonnIArbeidsgiverPerioden;
      if (selectorName.includes('lonnISykefravaeret')) return undefined;
      if (selectorName.includes('harRefusjonEndringer')) return mockHarRefusjonEndringer;
      return vi.fn();
    });

    const { result } = renderHook(() => useSendInnSkjema(innsendingFeiletIngenTilgang, amplitudeComponent));

    const opplysningerBekreftet = false; // This will trigger validation error
    const forespurteOpplysningstyper: Opplysningstype[] = [];
    const pathSlug = '8d50ef20-37b5-4829-ad83-56219e70b375';
    const isDirtyForm = true;
    const formData: FullInnsendingType = {
      forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      agp: null,
      inntekt: null,
      refusjon: null,
      avsenderTlf: '12345678',
      fullLonn: 'Ja'
    };

    mockFyllInnsending.mockReturnValue({
      forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      agp: null,
      inntekt: { beloep: 50000 },
      refusjon: null,
      avsenderTlf: '12345678'
    });

    let response: boolean | undefined;
    await act(async () => {
      response = await result.current(
        opplysningerBekreftet,
        forespurteOpplysningstyper,
        pathSlug,
        isDirtyForm,
        formData,
        false
      );
    });

    expect(response).toBe(false);
    expect(mockFyllFeilmeldinger).toHaveBeenCalled();
  });

  it('should clear and show errors when form is not dirty', async () => {
    const { result } = renderHook(() => useSendInnSkjema(innsendingFeiletIngenTilgang, amplitudeComponent));

    const opplysningerBekreftet = true;
    const forespurteOpplysningstyper: Opplysningstype[] = [];
    const pathSlug = 'test-path';
    const isDirtyForm = false;
    const formData = {} as z.infer<typeof HovedskjemaSchema>;

    await act(async () => {
      await result.current(opplysningerBekreftet, forespurteOpplysningstyper, pathSlug, isDirtyForm, formData, false);
    });

    // Verify that fyllFeilmeldinger was called to clear errors first
    expect(mockFyllFeilmeldinger).toHaveBeenCalledWith([]);
    // Verify that errorResponse was called with the "ingen endring" error
    expect(mockErrorResponse).toHaveBeenCalled();
    expect(mockSetSkalViseFeilmeldinger).toHaveBeenCalledWith(true);
  });
});
