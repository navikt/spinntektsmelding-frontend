import useHentSkjemadata from '../../utils/useHentSkjemadata';
// import { vi.mocked } from 'ts-vi/utils';
import fetchInntektskjemaForNotifikasjon from '../../state/fetchInntektskjemaForNotifikasjon';
import useStateInit from '../../state/useStateInit';
import { useRouter } from 'next/router';
import { vi, Mock } from 'vitest';
import useBoundStore from '../../state/useBoundStore';

vi.mock('../../state/fetchInntektskjemaForNotifikasjon');
vi.mock('../../state/useStateInit');
vi.mock('next/router', () => vi.importActual('next-router-mock'));
vi.mock('../../state/useBoundStore');

const mockUseBoundStore = vi.mocked(useBoundStore);

describe.skip('useHentSkjemadata', () => {
  const mockInitState = vi.fn();
  const mockLeggTilFeilmelding = vi.fn();
  const mockSetSkalViseFeilmeldinger = vi.fn();
  const mockSetSkjemaFeilet = vi.fn();
  const mockHentPaakrevdOpplysningstyper = vi.fn(() => ['Arbeidsgiverperiode']);
  const mockSlettFeilmelding = vi.fn();

  beforeEach(() => {
    (useStateInit as Mock).mockReturnValue(mockInitState);
    // useHentSkjemadata.mockReturnValue(async (pathSlug: string | string[]) => {
    //   return {
    //     hentPaakrevdOpplysningstyper: mockHentPaakrevdOpplysningstyper,
    //     setSkjemaFeilet: mockSetSkjemaFeilet,
    //     setSkalViseFeilmeldinger: mockSetSkalViseFeilmeldinger
    //   };
    // });
    mockUseBoundStore.mockReturnValue({
      __esModule: true,
      default: vi.fn(),
      leggTilFeilmelding: mockLeggTilFeilmelding,
      slettFeilmelding: mockSlettFeilmelding,
      setSkalViseFeilmeldinger: mockSetSkalViseFeilmeldinger,
      setSkjemaFeilet: mockSetSkjemaFeilet,
      hentPaakrevdOpplysningstyper: mockHentPaakrevdOpplysningstyper,
      initState: mockInitState
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should fetch skjemadata and initialize state when pathSlug is provided', async () => {
    const mockSkjemadata = { some: 'data' };
    vi.mocked(fetchInntektskjemaForNotifikasjon).mockResolvedValue(mockSkjemadata);

    const useHentSkjemadataFn = useHentSkjemadata();
    await useHentSkjemadataFn('some-path-slug', true);

    expect(fetchInntektskjemaForNotifikasjon).toHaveBeenCalledWith(expect.any(String), 'some-path-slug');
    expect(mockInitState).toHaveBeenCalledWith(mockSkjemadata);
    expect(mockHentPaakrevdOpplysningstyper).toHaveBeenCalled();
    expect(mockSetSkjemaFeilet).not.toHaveBeenCalled();
    expect(mockLeggTilFeilmelding).not.toHaveBeenCalled();
    expect(mockSetSkalViseFeilmeldinger).not.toHaveBeenCalled();
  });

  it('should redirect to /endring when Arbeidsgiverperiode is not a required opplysningstype', async () => {
    vi.mocked(fetchInntektskjemaForNotifikasjon).mockResolvedValue({ some: 'data' });
    (useRouter as Mock).mockReturnValue({ push: vi.fn() });

    const useHentSkjemadataFn = useHentSkjemadata();
    await useHentSkjemadataFn('some-path-slug', true);

    expect(mockHentPaakrevdOpplysningstyper).toHaveBeenCalled();
    expect(mockSetSkjemaFeilet).not.toHaveBeenCalled();
    expect(mockLeggTilFeilmelding).not.toHaveBeenCalled();
    expect(mockSetSkalViseFeilmeldinger).not.toHaveBeenCalled();
    expect(useRouter().push).toHaveBeenCalledWith('/endring/some-path-slug', undefined, { shallow: true });
  });

  it('should handle 401 error by redirecting to login page', async () => {
    const mockError = { status: 401 };
    vi.mocked(fetchInntektskjemaForNotifikasjon).mockRejectedValue(mockError);
    const mockLocationReplace = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { hostname: 'some-hostname', href: 'some-href', replace: mockLocationReplace },
      writable: true
    });

    const useHentSkjemadataFn = useHentSkjemadata();
    await useHentSkjemadataFn('some-path-slug', true);

    expect(mockSetSkjemaFeilet).not.toHaveBeenCalled();
    expect(mockLeggTilFeilmelding).toHaveBeenCalledWith('ukjent', expect.any(String));
    expect(mockSetSkalViseFeilmeldinger).toHaveBeenCalledWith(true);
    expect(mockLocationReplace).toHaveBeenCalledWith('https://some-hostname/oauth2/login?redirect=some-href');
  });

  it('should handle 503 and 500 errors by setting skjemaFeilet', async () => {
    const mockError = { status: 503 };
    vi.mocked(fetchInntektskjemaForNotifikasjon).mockRejectedValue(mockError);

    const useHentSkjemadataFn = useHentSkjemadata();
    await useHentSkjemadataFn('some-path-slug', true);

    expect(mockSetSkjemaFeilet).toHaveBeenCalled();
    expect(mockLeggTilFeilmelding).toHaveBeenCalledWith('ukjent', expect.any(String));
    expect(mockSetSkalViseFeilmeldinger).toHaveBeenCalledWith(true);
  });

  it('should handle other errors by setting skjemaFeilet and showing error message', async () => {
    const mockError = { status: 400 };
    vi.mocked(fetchInntektskjemaForNotifikasjon).mockRejectedValue(mockError);

    const useHentSkjemadataFn = useHentSkjemadata();
    await useHentSkjemadataFn('some-path-slug', true);

    expect(mockSetSkjemaFeilet).toHaveBeenCalled();
    expect(mockLeggTilFeilmelding).toHaveBeenCalledWith('ukjent', expect.any(String));
    expect(mockSetSkalViseFeilmeldinger).toHaveBeenCalledWith(true);
  });
});
