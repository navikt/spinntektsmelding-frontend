import { describe, it, expect, vi, Mock, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { z } from 'zod/v4';
import { HovedskjemaSchema } from '../../schema/HovedskjemaSchema';

import useSendInnSkjema from '../../utils/useSendInnSkjema';
import logEvent from '../../utils/logEvent';
import { Opplysningstype } from '../../schema/ForespurtDataSchema';
import FullInnsendingSchema from '../../schema/FullInnsendingSchema';
import { postInnsending } from '../../utils/postInnsending';

type Hovedskjema = z.infer<typeof HovedskjemaSchema>;
type FullInnsendingType = Partial<Omit<Hovedskjema, 'agp' | 'inntekt' | 'refusjon'>> & {
  forespoerselId?: string;
  agp?: Hovedskjema['agp'] | null;
  inntekt?: Hovedskjema['inntekt'] | null;
  refusjon?: Hovedskjema['refusjon'] | null;
};

const mockFyllFeilmeldinger = vi.fn();
const mockSetSkalViseFeilmeldinger = vi.fn();
const mockSetMottatt = vi.fn();
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
    if (selectorName.includes('setMottatt')) return mockSetMottatt;
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
  const analyticsComponent = 'testComponent';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log event and return false if form is not dirty', async () => {
    const { result } = renderHook(() => useSendInnSkjema(innsendingFeiletIngenTilgang, analyticsComponent, false));

    const opplysningerBekreftet = true;
    const forespurteOpplysningstyper: Opplysningstype[] = [];
    const pathSlug = 'test-path';
    const isDirtyForm = false;
    const formData = {} as z.infer<typeof HovedskjemaSchema>;

    let response: Awaited<ReturnType<ReturnType<typeof useSendInnSkjema>>> | undefined;
    await act(async () => {
      response = await result.current(opplysningerBekreftet, pathSlug, isDirtyForm, formData as Hovedskjema, false);
    });

    expect(response).toBe(false);
    expect(logEvent).toHaveBeenCalledWith('skjema fullført', {
      tittel: 'Innsending uten endringer i skjema',
      component: analyticsComponent
    });
    expect(mockErrorResponse).toHaveBeenCalled();
  });

  it('should handle validation errors from FullInnsendingSchema', async () => {
    const { result } = renderHook(() => useSendInnSkjema(innsendingFeiletIngenTilgang, analyticsComponent, false));

    const opplysningerBekreftet = true;
    const forespurteOpplysningstyper: Opplysningstype[] = [];
    const pathSlug = 'test-path';
    const isDirtyForm = true;
    const formData = {
      opplysningstyper: forespurteOpplysningstyper
    } as z.infer<typeof HovedskjemaSchema>;

    // Mock fyllInnsending to return invalid data
    mockFyllInnsending.mockReturnValue({});

    await act(async () => {
      await result.current(opplysningerBekreftet, pathSlug, isDirtyForm, formData as Hovedskjema, false);
    });

    expect(logEvent).toHaveBeenCalledWith('skjema validering feilet', {
      tittel: 'Validering feilet',
      component: analyticsComponent
    });
    expect(mockFyllFeilmeldinger).toHaveBeenCalled();
  });

  it('shows missing income date errors without submitting', async () => {
    mockFyllInnsending.mockImplementationOnce(() => {
      throw new z.ZodError([
        { code: 'custom', path: ['inntekt', 'inntektsdato'], message: 'Bestemmende fraværsdag mangler' }
      ]);
    });
    const { result } = renderHook(() => useSendInnSkjema(innsendingFeiletIngenTilgang, analyticsComponent, true));
    const formData: FullInnsendingType = {
      bekreft_opplysninger: true,
      kreverRefusjon: 'Nei',
      avsenderTlf: '12345678',
      opplysningstyper: ['inntekt'],
      refusjon: { beloepPerMaaned: 0, isEditing: false, harEndringer: 'Nei', endringer: [] }
    };

    let response: Awaited<ReturnType<typeof result.current>> = undefined;
    await act(async () => {
      response = await result.current(
        true,
        '8d50ef20-37b5-4829-ad83-56219e70b375',
        true,
        formData as unknown as Hovedskjema,
        false
      );
    });

    expect(response).toBe(false);
    expect(mockFyllFeilmeldinger).toHaveBeenCalledWith([
      { felt: 'inntekt.inntektsdato', text: 'Bestemmende fraværsdag mangler' }
    ]);
    expect(mockSetSkalViseFeilmeldinger).toHaveBeenCalledWith(true);
    expect(postInnsending).not.toHaveBeenCalled();
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
    (isValidUUID.default as unknown as Mock).mockReturnValueOnce(false);

    const { result } = renderHook(() => useSendInnSkjema(innsendingFeiletIngenTilgang, analyticsComponent, false));

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
      avsenderTlf: '12345678',
      opplysningstyper: forespurteOpplysningstyper
    };

    mockFyllInnsending.mockReturnValue({
      forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      agp: null,
      inntekt: { beloep: 50000 },
      refusjon: null,
      avsenderTlf: '12345678'
    });

    let response: Awaited<ReturnType<ReturnType<typeof useSendInnSkjema>>> | undefined;
    await act(async () => {
      response = await result.current(opplysningerBekreftet, pathSlug, isDirtyForm, formData as Hovedskjema, false);
    });

    expect(response).toBe(false);
    expect(logEvent).toHaveBeenCalledWith('skjema validering feilet', {
      tittel: 'Ugyldig UUID ved innsending',
      component: analyticsComponent
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

    const { result } = renderHook(() => useSendInnSkjema(innsendingFeiletIngenTilgang, analyticsComponent, false));

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
      avsenderTlf: '12345678',
      opplysningstyper: forespurteOpplysningstyper
    };

    mockFyllInnsending.mockReturnValue({
      forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      agp: null,
      inntekt: { beloep: 50000 },
      refusjon: null,
      avsenderTlf: '12345678'
    });

    await act(async () => {
      await result.current(opplysningerBekreftet, pathSlug, isDirtyForm, formData as Hovedskjema, false);
    });

    expect(postInnsending).toHaveBeenCalledWith(
      expect.objectContaining({
        analyticsComponent: 'testComponent',
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

    const { result } = renderHook(() => useSendInnSkjema(innsendingFeiletIngenTilgang, analyticsComponent, false));

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
      avsenderTlf: '12345678',
      opplysningstyper: forespurteOpplysningstyper
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
      await result.current(opplysningerBekreftet, pathSlug, isDirtyForm, formData as Hovedskjema, false);
    });

    expect(mockSetMottatt).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith(`/kvittering/${pathSlug}?fromSubmit=true`, `/kvittering/${pathSlug}`);
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

    const { result } = renderHook(() => useSendInnSkjema(innsendingFeiletIngenTilgang, analyticsComponent, false));

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
      avsenderTlf: '12345678',
      opplysningstyper: forespurteOpplysningstyper
    };

    mockFyllInnsending.mockReturnValue({
      forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      agp: null,
      inntekt: { beloep: 50000 },
      refusjon: null,
      avsenderTlf: '12345678',
      opplysningstyper: forespurteOpplysningstyper
    });

    await act(async () => {
      await result.current(opplysningerBekreftet, pathSlug, isDirtyForm, formData as Hovedskjema, false);
    });

    expect(innsendingFeiletIngenTilgang).toHaveBeenCalledWith(true);
  });

  it('should log initial event when form is submitted', async () => {
    const { result } = renderHook(() => useSendInnSkjema(innsendingFeiletIngenTilgang, analyticsComponent, false));

    const opplysningerBekreftet = true;
    const pathSlug = 'test-path';
    const isDirtyForm = false;
    const formData = {} as z.infer<typeof HovedskjemaSchema>;

    await act(async () => {
      await result.current(opplysningerBekreftet, pathSlug, isDirtyForm, formData as Hovedskjema, false);
    });

    expect(logEvent).toHaveBeenCalledWith('skjema fullført', {
      tittel: 'Har trykket send',
      component: analyticsComponent
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
      if (selectorName.includes('setMottatt')) return mockSetMottatt;
      if (selectorName.includes('fullLonnIArbeidsgiverPerioden')) return mockFullLonnIArbeidsgiverPerioden;
      if (selectorName.includes('lonnISykefravaeret')) return undefined;
      if (selectorName.includes('harRefusjonEndringer')) return mockHarRefusjonEndringer;
      return vi.fn();
    });

    const { result } = renderHook(() => useSendInnSkjema(innsendingFeiletIngenTilgang, analyticsComponent, false));

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
      fullLonn: 'Ja',
      opplysningstyper: forespurteOpplysningstyper
    };

    mockFyllInnsending.mockReturnValue({
      forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      agp: null,
      inntekt: { beloep: 50000 },
      refusjon: null,
      avsenderTlf: '12345678'
    });

    let response: Awaited<ReturnType<ReturnType<typeof useSendInnSkjema>>> | undefined;
    await act(async () => {
      response = await result.current(opplysningerBekreftet, pathSlug, isDirtyForm, formData as Hovedskjema, false);
    });

    expect(response).toBe(false);
    expect(mockFyllFeilmeldinger).toHaveBeenCalled();
  });

  it('should clear and show errors when form is not dirty', async () => {
    const { result } = renderHook(() => useSendInnSkjema(innsendingFeiletIngenTilgang, analyticsComponent, false));

    const opplysningerBekreftet = true;
    const forespurteOpplysningstyper: Opplysningstype[] = [];
    const pathSlug = 'test-path';
    const isDirtyForm = false;
    const formData = {} as z.infer<typeof HovedskjemaSchema>;

    await act(async () => {
      await result.current(opplysningerBekreftet, pathSlug, isDirtyForm, formData as Hovedskjema, false);
    });

    // Verify that fyllFeilmeldinger was called to clear errors first
    expect(mockFyllFeilmeldinger).toHaveBeenCalledWith([]);
    // Verify that errorResponse was called with the "ingen endring" error
    expect(mockErrorResponse).toHaveBeenCalled();
    expect(mockSetSkalViseFeilmeldinger).toHaveBeenCalledWith(true);
  });
});
