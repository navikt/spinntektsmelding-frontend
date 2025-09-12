import { describe, it, expect, vi, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { z } from 'zod/v4';
import { HovedskjemaSchema } from '../../schema/HovedskjemaSchema';

import useSendInnSkjema from '../../utils/useSendInnSkjema';
import logEvent from '../../utils/logEvent';
// import validerInntektsmelding from '../../utils/validerInntektsmelding';
import { Opplysningstype } from '../../schema/ForespurtDataSchema';

type FullInnsending = z.infer<typeof HovedskjemaSchema>;

vi.mock('next/navigation', { spy: true });

vi.mock('../state/useBoundStore', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation((selector) => {
    if (selector.name === 'fyllFeilmeldinger') return vi.fn();
    if (selector.name === 'setShowErrorList') return vi.fn();
    if (selector.name === 'setKvitteringInnsendt') return vi.fn();
    return {};
  })
}));

vi.mock('../state/useFyllInnsending', () => ({
  __esModule: true,
  default: vi.fn()
}));

vi.mock('../../utils/logEvent', { spy: true });

vi.mock('../../utils/isValidUUID', () => ({
  __esModule: true,
  default: vi.fn().mockReturnValue(true)
}));

// vi.mock('../../utils/validerInntektsmelding', { spy: true });

vi.mock('./useErrorResponse', () => ({
  __esModule: true,
  default: vi.fn(),
  ErrorResponse: vi.fn()
}));

vi.mock('../schema/FullInnsendingSchema', () => ({
  __esModule: true,
  default: {
    safeParse: vi.fn().mockReturnValue({ success: true })
  }
}));

vi.mock('../schema/ResponseBackendErrorSchema', () => ({
  __esModule: true,
  default: {
    safeParse: vi.fn().mockReturnValue({ success: true })
  }
}));

describe('useSendInnSkjema', () => {
  const innsendingFeiletIngenTilgang = vi.fn();
  const amplitudeComponent = 'testComponent';
  const router = { push: vi.fn() };
  (useRouter as Mock).mockReturnValue(router);

  const { result } = renderHook(() => useSendInnSkjema(innsendingFeiletIngenTilgang, amplitudeComponent));

  it('should log event and return false if form is not dirty', async () => {
    const opplysningerBekreftet = true;
    const forespurteOpplysningstyper: Opplysningstype[] = [];
    const pathSlug = 'test-path';
    const isDirtyForm = false;
    const formData = {} as z.infer<typeof HovedskjemaSchema>;

    const response = await result.current(
      opplysningerBekreftet,
      forespurteOpplysningstyper,
      pathSlug,
      isDirtyForm,
      formData
    );

    expect(response).toBe(false);
  });

  it('should handle validation errors', async () => {
    const opplysningerBekreftet = true;
    const forespurteOpplysningstyper: Opplysningstype[] = [];
    const pathSlug = 'test-path';
    const isDirtyForm = true;
    const formData = {} as z.infer<typeof HovedskjemaSchema>;

    // (validerInntektsmelding as Mock).mockReturnValueOnce({
    //   errorTexts: [{ error: 'test error' }]
    // });

    await act(async () => {
      await result.current(opplysningerBekreftet, forespurteOpplysningstyper, pathSlug, isDirtyForm, formData);
    });

    expect(logEvent).toHaveBeenCalledWith('skjema validering feilet', {
      tittel: 'Validering feilet',
      component: amplitudeComponent
    });
  });

  it.skip('should handle successful submission', async () => {
    const opplysningerBekreftet = true;
    const forespurteOpplysningstyper: Opplysningstype[] = [];
    const pathSlug = '8d50ef20-37b5-4829-ad83-56219e70b375';
    const isDirtyForm = true;
    const formData: FullInnsending = {
      forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      agp: null,
      inntekt: null,
      refusjon: null,
      avsenderTlf: '12345678'
    };

    global.fetch = vi.fn().mockResolvedValue({
      status: 201,
      json: vi.fn().mockResolvedValue({})
    });

    // (validerInntektsmelding as Mock).mockReturnValueOnce([]);
    await act(async () => {
      await result.current(opplysningerBekreftet, forespurteOpplysningstyper, pathSlug, isDirtyForm, formData);
    });

    expect(router.push).toHaveBeenCalledWith(`/kvittering/${pathSlug}`, undefined);
  });

  it.skip('should handle server error 500', async () => {
    const opplysningerBekreftet = true;
    const forespurteOpplysningstyper: Opplysningstype[] = [];
    const pathSlug = '8d50ef20-37b5-4829-ad83-56219e70b375';
    const isDirtyForm = true;
    const formData: FullInnsending = {
      forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      agp: null,
      inntekt: null,
      refusjon: null,
      avsenderTlf: '12345678'
    };

    global.fetch = vi.fn().mockResolvedValue({
      status: 500,
      json: vi.fn().mockResolvedValue({})
    });

    // (validerInntektsmelding as Mock).mockReturnValueOnce([]);

    await act(async () => {
      await result.current(opplysningerBekreftet, forespurteOpplysningstyper, pathSlug, isDirtyForm, formData);
    });

    expect(logEvent).toHaveBeenCalledWith('skjema innsending feilet', {
      tittel: 'Innsending feilet - serverfeil',
      component: amplitudeComponent
    });
  });

  it.skip('should handle unauthorized error 401', async () => {
    const opplysningerBekreftet = true;
    const forespurteOpplysningstyper: Opplysningstype[] = [];
    const pathSlug = '8d50ef20-37b5-4829-ad83-56219e70b375';
    const isDirtyForm = true;
    const formData: FullInnsending = {
      forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      agp: null,
      inntekt: null,
      refusjon: null,
      avsenderTlf: '12345678'
    };

    // (validerInntektsmelding as Mock).mockReturnValueOnce([]);

    global.fetch = vi.fn().mockResolvedValue({
      status: 401,
      json: vi.fn().mockResolvedValue({})
    });

    await act(async () => {
      await result.current(opplysningerBekreftet, forespurteOpplysningstyper, pathSlug, isDirtyForm, formData);
    });

    expect(innsendingFeiletIngenTilgang).toHaveBeenCalledWith(true);
  });
});
