import useHentSkjemadata from '../../utils/useHentSkjemadata';
import fetchInntektskjemaForNotifikasjon from '../../state/fetchInntektskjemaForNotifikasjon';
import { vi, Mock } from 'vitest';
import useBoundStore from '../../state/useBoundStore';
import { useRouter } from 'next/navigation';

vi.mock('../../state/fetchInntektskjemaForNotifikasjon');
vi.mock('../../state/useStateInit');
vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}));
vi.mock('../../state/useBoundStore', () => ({
  __esModule: true,
  default: vi.fn(),
  useBoundStore: vi.fn()
}));

const mockInitState = vi.fn();
vi.mock('../../state/useStateInit', () => ({
  default: () => mockInitState,
  __esModule: true,
  useStateInit: () => mockInitState
}));

describe('useHentSkjemadata', () => {
  const mockLeggTilFeilmelding = vi.fn();
  const mockSetSkalViseFeilmeldinger = vi.fn();
  const mockSetSkjemaFeilet = vi.fn();
  const mockHentPaakrevdOpplysningstyper = vi.fn(() => ['Arbeidsgiverperiode']);
  const mockSlettFeilmelding = vi.fn();
  const mockRouterReplace = vi.fn();

  const mockStore = {
    leggTilFeilmelding: mockLeggTilFeilmelding,
    slettFeilmelding: mockSlettFeilmelding,
    setSkalViseFeilmeldinger: mockSetSkalViseFeilmeldinger,
    setSkjemaFeilet: mockSetSkjemaFeilet,
    hentPaakrevdOpplysningstyper: mockHentPaakrevdOpplysningstyper
  };

  beforeEach(() => {
    (useBoundStore as unknown as Mock).mockImplementation((stateFn) => stateFn(mockStore));
    (useRouter as Mock).mockReturnValue({
      replace: mockRouterReplace
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch skjemadata and initialize state when pathSlug is provided', async () => {
    const mockSkjemadata = { some: 'data' };

    vi.mocked(fetchInntektskjemaForNotifikasjon).mockResolvedValue(mockSkjemadata);

    const useHentSkjemadataFn = useHentSkjemadata();
    await useHentSkjemadataFn('8d50ef20-37b5-4829-ad83-56219e70b375', true);

    expect(fetchInntektskjemaForNotifikasjon).toHaveBeenCalledWith(
      expect.any(String),
      '8d50ef20-37b5-4829-ad83-56219e70b375'
    );
    expect(mockInitState).toHaveBeenCalledWith(mockSkjemadata);
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
    await useHentSkjemadataFn('8d50ef20-37b5-4829-ad83-56219e70b375', true);

    expect(mockInitState).not.toHaveBeenCalled();
    expect(mockLocationReplace).toHaveBeenCalledWith('https://some-hostname/im-dialog/oauth2/login?redirect=some-href');
  });

  it('should handle 503 and 500 errors by setting skjemaFeilet', async () => {
    const mockError = { status: 503 };
    vi.mocked(fetchInntektskjemaForNotifikasjon).mockRejectedValue(mockError);

    const useHentSkjemadataFn = useHentSkjemadata();
    await useHentSkjemadataFn('8d50ef20-37b5-4829-ad83-56219e70b375', true);

    expect(mockSetSkjemaFeilet).toHaveBeenCalled();
    expect(mockLeggTilFeilmelding).toHaveBeenCalledWith('ukjent', expect.any(String));
    expect(mockSetSkalViseFeilmeldinger).toHaveBeenCalledWith(true);
  });

  it('should handle other errors by setting skjemaFeilet and showing error message', async () => {
    const mockError = { status: 400 };
    vi.mocked(fetchInntektskjemaForNotifikasjon).mockRejectedValue(mockError);

    const useHentSkjemadataFn = useHentSkjemadata();
    await useHentSkjemadataFn('8d50ef20-37b5-4829-ad83-56219e70b375', true);

    expect(mockSetSkjemaFeilet).toHaveBeenCalled();
    expect(mockLeggTilFeilmelding).toHaveBeenCalledWith('ukjent', expect.any(String));
    expect(mockSetSkalViseFeilmeldinger).toHaveBeenCalledWith(true);
  });

  it('should resolve a promise to {} if forespoerselID is an array', async () => {
    const mockError = { status: 400 };
    vi.mocked(fetchInntektskjemaForNotifikasjon).mockRejectedValue(mockError);

    const useHentSkjemadataFn = useHentSkjemadata();
    const data = await useHentSkjemadataFn(['8d50ef20-37b5-4829-ad83-56219e70b375', 'hei'], true);

    expect(data).toEqual({});
  });

  it('should fetch skjemadata and redirect when erBesvart=true and erEndring=false', async () => {
    const mockSkjemadata = { erBesvart: true };

    vi.mocked(fetchInntektskjemaForNotifikasjon).mockResolvedValue(mockSkjemadata);

    const useHentSkjemadataFn = useHentSkjemadata();
    await useHentSkjemadataFn('8d50ef20-37b5-4829-ad83-56219e70b375', false);

    expect(mockRouterReplace).toHaveBeenCalledWith('/kvittering/8d50ef20-37b5-4829-ad83-56219e70b375', undefined);
  });

  it('should resolve a promise to {} if forespoerselID is undefined', async () => {
    const mockError = { status: 400 };
    vi.mocked(fetchInntektskjemaForNotifikasjon).mockRejectedValue(mockError);

    const useHentSkjemadataFn = useHentSkjemadata();
    const data = await useHentSkjemadataFn(undefined, true);

    expect(data).toEqual({});
  });
});
