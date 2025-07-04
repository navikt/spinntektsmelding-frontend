import { describe, it, expect, vi, Mock } from 'vitest';
// import useSendInnSkjema from './useSendInnSkjema';
import { renderHook, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
// import environment from '../config/environment';
import { HovedskjemaSchema } from '../../schema/HovedskjemaSchema';
import { Opplysningstype } from '../../state/useForespurtDataStore';
// import forespoerselType from '../config/forespoerselType';
import useSendInnSkjema from '../../utils/useSendInnSkjema';
import logEvent from '../../utils/logEvent';
import validerInntektsmelding from '../../utils/validerInntektsmelding';
// const pushMock = vi.fn();

type FullInnsending = z.infer<typeof HovedskjemaSchema>;

vi.mock('next/navigation', { spy: true });
// .mockReturnValue({
//   useRouter: {
//     push: pushMock
//   }
// });

vi.mock('../state/useBoundStore', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation((selector) => {
    if (selector.name === 'fyllFeilmeldinger') return vi.fn();
    if (selector.name === 'setSkalViseFeilmeldinger') return vi.fn();
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

vi.mock('../../utils/validerInntektsmelding', { spy: true });

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
  // vi.mock('next/navigation').mockReturnValue({ useRouter: { push: vi.fn() } });
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

    (validerInntektsmelding as Mock).mockReturnValueOnce({
      errorTexts: [{ message: 'test error' }]
    });

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
    const pathSlug = '12345678-3456-5678-2457-123456789012';
    const isDirtyForm = true;
    const formData: FullInnsending = {
      forespoerselId: '12345678-3456-5678-2457-123456789012',
      agp: null,
      inntekt: null,
      refusjon: null,
      avsenderTlf: '12345678'
    };

    global.fetch = vi.fn().mockResolvedValue({
      status: 201,
      json: vi.fn().mockResolvedValue({})
    });

    (validerInntektsmelding as Mock).mockReturnValueOnce([]);
    await act(async () => {
      await result.current(opplysningerBekreftet, forespurteOpplysningstyper, pathSlug, isDirtyForm, formData);
    });

    expect(router.push).toHaveBeenCalledWith(`/kvittering/${pathSlug}`, undefined);
  });

  it.skip('should handle server error 500', async () => {
    const opplysningerBekreftet = true;
    const forespurteOpplysningstyper: Opplysningstype[] = [];
    const pathSlug = '12345678-3456-5678-2457-123456789012';
    const isDirtyForm = true;
    const formData: FullInnsending = {
      forespoerselId: '12345678-3456-5678-2457-123456789012',
      agp: null,
      inntekt: null,
      refusjon: null,
      avsenderTlf: '12345678'
    };

    global.fetch = vi.fn().mockResolvedValue({
      status: 500,
      json: vi.fn().mockResolvedValue({})
    });

    (validerInntektsmelding as Mock).mockReturnValueOnce([]);

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
    const pathSlug = '12345678-3456-5678-2457-123456789012';
    const isDirtyForm = true;
    const formData: FullInnsending = {
      forespoerselId: '12345678-3456-5678-2457-123456789012',
      agp: null,
      inntekt: null,
      refusjon: null,
      avsenderTlf: '12345678'
    };

    (validerInntektsmelding as Mock).mockReturnValueOnce([]);

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
