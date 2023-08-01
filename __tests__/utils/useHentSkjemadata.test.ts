import useHentSkjemadata from '../../utils/useHentSkjemadata';
import fetchInntektskjemaForNotifikasjon from '../../state/fetchInntektskjemaForNotifikasjon';
import useStateInit from '../../state/useStateInit';
import feiltekster from '../../utils/feiltekster';
import { vi, Mock } from 'vitest';
import environment from '../../config/environment';
import useBoundStore from '../../state/useBoundStore';

vi.mock('../../state/fetchInntektskjemaForNotifikasjon');
vi.mock('../../state/useStateInit');
vi.mock('../../state/useBoundStore', () => ({
  __esModule: true,
  default: vi.fn()
  // leggTilFeilmelding: vi.fn()
}));

let assignMock = vi.fn();

delete window.location;
window.location = { replace: assignMock, hostname: 'some-hostname', href: 'some-href' } as Lo;

describe('useHentSkjemadata', () => {
  const pathSlug = 'some-path-slug';
  const skjemadata = { some: 'data' };
  const error = new Error('Some error');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    assignMock.mockClear();
  });

  it('should fetch skjemadata and initialize state if pathSlug is provided', async () => {
    (fetchInntektskjemaForNotifikasjon as Mock).mockResolvedValue(skjemadata);
    const initState = vi.fn();
    (useStateInit as Mock).mockReturnValue(initState);

    const hentSkjemadata = useHentSkjemadata();
    await hentSkjemadata(pathSlug);

    expect(fetchInntektskjemaForNotifikasjon).toHaveBeenCalledWith(expect.any(String), pathSlug);
    expect(initState).toHaveBeenCalledWith(skjemadata);
  });

  it('should not fetch skjemadata if pathSlug is not provided', async () => {
    const hentSkjemadata = useHentSkjemadata();
    await hentSkjemadata('');

    expect(fetchInntektskjemaForNotifikasjon).not.toHaveBeenCalled();
  });

  it.skip('should handle 401 error by redirecting to login page', async () => {
    const redirectUrl = `https://${window.location.hostname}${environment.baseUrl}`;
    const currentUrl = window.location.href;
    const expectedUrl = `https://${environment.skjemadataUrl}/oauth2/login?redirect=${currentUrl}`;
    const hentSkjemadata = useHentSkjemadata();
    (fetchInntektskjemaForNotifikasjon as Mock).mockRejectedValue({ status: 401 });

    await hentSkjemadata(pathSlug);

    expect(window.location.replace).toHaveBeenCalledWith(expectedUrl);
  });

  it.skip('should handle 503 and 500 errors by setting skjemaFeilet', async () => {
    const setSkjemaFeilet = vi.fn();
    const hentSkjemadata = useHentSkjemadata();
    (fetchInntektskjemaForNotifikasjon as Mock).mockRejectedValue({ status: 503 });
    (useBoundStore as Mock).mockImplementation((selector) => {
      if (selector === 'setSkjemaFeilet') {
        return setSkjemaFeilet;
      }
      return vi.fn();
    });

    await hentSkjemadata(pathSlug);

    expect(setSkjemaFeilet).toHaveBeenCalled();
  });

  it.skip('should handle other errors by adding feilmelding and showing feilmeldinger', async () => {
    const leggTilFeilmelding = vi.fn();
    const setSkalViseFeilmeldinger = vi.fn();
    const setSkjemaFeilet = vi.fn();
    const hentSkjemadata = useHentSkjemadata();
    (fetchInntektskjemaForNotifikasjon as Mock).mockRejectedValue(error);
    (useBoundStore as Mock).mockImplementation((selector) => {
      switch (selector) {
        case 'leggTilFeilmelding':
          return leggTilFeilmelding;
        case 'setSkalViseFeilmeldinger':
          return setSkalViseFeilmeldinger;
        case 'setSkjemaFeilet':
          return setSkjemaFeilet;
        default:
          return vi.fn();
      }
    });

    await hentSkjemadata(pathSlug);

    expect(leggTilFeilmelding).toHaveBeenCalledWith('ukjent', feiltekster.SERVERFEIL_IM);
    expect(setSkalViseFeilmeldinger).toHaveBeenCalledWith(true);
    expect(setSkjemaFeilet).not.toHaveBeenCalled();
  });
});
