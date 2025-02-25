import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { logger } from '@navikt/next-logger';
import useHentKvitteringsdata from '../../utils/useHentKvitteringsdata';
import fetchKvitteringsdata from '../../utils/fetchKvitteringsdata';
import useKvitteringInit from '../../state/useKvitteringInit';
import useBoundStore from '../../state/useBoundStore';
import environment from '../../config/environment';

vi.mock('../../utils/fetchKvitteringsdata');
vi.mock('../../state/useKvitteringInit');
vi.mock('../../state/useBoundStore');
vi.mock('@navikt/next-logger');

describe('useHentKvitteringsdata', () => {
  const mockInitState = vi.fn();
  const mockSetSkjemaFeilet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useKvitteringInit as Mock).mockReturnValue(mockInitState);
    (useBoundStore as Mock).mockReturnValue({
      __esModule: true,
      default: vi.fn(),
      setSkjemaFeilet: mockSetSkjemaFeilet
    });
  });

  it('should resolve with empty object if pathSlug is an array', async () => {
    const hentKvitteringsdata = useHentKvitteringsdata();
    const result = await hentKvitteringsdata(['some', 'array']);
    expect(result).toEqual({});
  });

  it('should call fetchKvitteringsdata with correct arguments', async () => {
    (fetchKvitteringsdata as Mock).mockResolvedValue({ status: 200, data: {} });
    const hentKvitteringsdata = useHentKvitteringsdata();
    await hentKvitteringsdata('some-path');
    expect(fetchKvitteringsdata).toHaveBeenCalledWith(environment.hentKvitteringUrl, 'some-path');
  });

  it.skip('should handle 404 status by setting skjemaFeilet and logging a warning', async () => {
    (fetchKvitteringsdata as Mock).mockResolvedValue({ status: 404 });
    const hentKvitteringsdata = useHentKvitteringsdata();
    await hentKvitteringsdata('some-path');
    expect(mockSetSkjemaFeilet).toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith('Fant ikke kvittering for ', 'some-path');
  });

  it('should initialize state with data if skjemadata is defined', async () => {
    const mockData = { some: 'data' };
    (fetchKvitteringsdata as Mock).mockResolvedValue({ status: 200, data: mockData });
    const hentKvitteringsdata = useHentKvitteringsdata();
    await hentKvitteringsdata('some-path');
    expect(mockInitState).toHaveBeenCalledWith(mockData);
  });

  it.skip('should handle 401 error by redirecting to login page', async () => {
    const mockError = { status: 401 };
    (fetchKvitteringsdata as Mock).mockRejectedValue(mockError);
    const mockLocationReplace = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { hostname: 'some-hostname', href: 'some-href', replace: mockLocationReplace },
      writable: true
    });

    const hentKvitteringsdata = useHentKvitteringsdata();
    await hentKvitteringsdata('some-path');

    expect(mockLocationReplace).toHaveBeenCalledWith('https://some-hostname/oauth2/login?redirect=some-href');
  });

  it.skip('should handle other errors by setting skjemaFeilet and showing error message', async () => {
    const mockError = { status: 500 };
    (fetchKvitteringsdata as Mock).mockRejectedValue(mockError);

    const hentKvitteringsdata = useHentKvitteringsdata();
    await hentKvitteringsdata('some-path');

    expect(mockSetSkjemaFeilet).toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith('Fant ikke kvittering for ', 'some-path');
  });
});
