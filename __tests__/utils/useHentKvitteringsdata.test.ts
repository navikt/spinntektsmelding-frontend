import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useHentKvitteringsdata from '../../utils/useHentKvitteringsdata';
const uuid = '8d50ef20-37b5-4829-ad83-56219e70b375';

vi.mock('../../config/environment', () => ({
  default: {
    hentKvitteringUrl: 'https://test.nav.no/kvittering',
    baseUrl: '/im-dialog'
  }
}));

vi.mock('../../utils/fetchKvitteringsdata');
vi.mock('../../state/useKvitteringInit');
vi.mock('../../state/useBoundStore');
vi.mock('@navikt/next-logger', () => ({
  logger: {
    warn: vi.fn()
  }
}));

import fetchKvitteringsdata from '../../utils/fetchKvitteringsdata';
import useKvitteringInit from '../../state/useKvitteringInit';
import useBoundStore from '../../state/useBoundStore';
import { logger } from '@navikt/next-logger';

const mockedFetchKvitteringsdata = vi.mocked(fetchKvitteringsdata);
const mockedUseKvitteringInit = vi.mocked(useKvitteringInit);
const mockedUseBoundStore = vi.mocked(useBoundStore);

describe('useHentKvitteringsdata', () => {
  const mockInitState = vi.fn();
  const mockSetSkjemaFeilet = vi.fn();
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseKvitteringInit.mockReturnValue(mockInitState);
    mockedUseBoundStore.mockImplementation((selector: any) => selector({ setSkjemaFeilet: mockSetSkjemaFeilet }));

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        hostname: 'test.nav.no',
        href: 'https://test.nav.no/kvittering/agi/123',
        replace: vi.fn()
      }
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation
    });
  });

  describe('pathSlug handling', () => {
    it('should return empty object when pathSlug is an array', async () => {
      const { result } = renderHook(() => useHentKvitteringsdata());
      const response = await result.current(['slug1', 'slug2']);

      expect(response).toEqual({});
      expect(mockedFetchKvitteringsdata).not.toHaveBeenCalled();
    });

    it('should return undefined when pathSlug is undefined', async () => {
      const { result } = renderHook(() => useHentKvitteringsdata());
      const response = await result.current(undefined);

      expect(response).toBeUndefined();
      expect(mockedFetchKvitteringsdata).not.toHaveBeenCalled();
    });

    it('should call fetchKvitteringsdata when pathSlug is a string', async () => {
      mockedFetchKvitteringsdata.mockResolvedValue({ status: 200, data: { foo: 'bar' } });

      const { result } = renderHook(() => useHentKvitteringsdata());
      await result.current(uuid);

      expect(mockedFetchKvitteringsdata).toHaveBeenCalledWith('https://test.nav.no/kvittering', uuid);
    });
  });

  describe('successful responses', () => {
    it('should call initState when data is returned', async () => {
      const mockData = { id: '123', navn: 'Test' };
      mockedFetchKvitteringsdata.mockResolvedValue({ status: 200, data: mockData });

      const { result } = renderHook(() => useHentKvitteringsdata());
      await result.current(uuid);

      expect(mockInitState).toHaveBeenCalledWith(mockData);
      expect(mockSetSkjemaFeilet).not.toHaveBeenCalled();
    });

    it('should not call initState when data is undefined', async () => {
      mockedFetchKvitteringsdata.mockResolvedValue({ status: 200, data: undefined });

      const { result } = renderHook(() => useHentKvitteringsdata());
      await result.current(uuid);

      expect(mockInitState).not.toHaveBeenCalled();
    });
  });

  describe('404 response handling', () => {
    it('should call setSkjemaFeilet and log warning when status is 404', async () => {
      mockedFetchKvitteringsdata.mockResolvedValue({ status: 404, data: undefined });

      const { result } = renderHook(() => useHentKvitteringsdata());
      await result.current(uuid);

      expect(mockSetSkjemaFeilet).toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        'Fant ikke kvittering for 8d50ef20-37b5-4829-ad83-56219e70b375. Feilkode:404.'
      );
    });
  });

  describe('error handling - 401 Unauthorized', () => {
    it('should redirect to login when error.status is 401', async () => {
      mockedFetchKvitteringsdata.mockRejectedValue({ status: 401, message: 'Unauthorized' });

      const { result } = renderHook(() => useHentKvitteringsdata());
      await result.current(uuid);

      expect(window.location.replace).toHaveBeenCalledWith(
        'https://test.nav.no/im-dialog/oauth2/login?redirect=https://test.nav.no/kvittering/agi/123'
      );
    });

    it('should also call setSkjemaFeilet for 401 since 401 !== 200', async () => {
      mockedFetchKvitteringsdata.mockRejectedValue({ status: 401, message: 'Unauthorized' });

      const { result } = renderHook(() => useHentKvitteringsdata());
      await result.current(uuid);

      expect(window.location.replace).toHaveBeenCalled();
      expect(mockSetSkjemaFeilet).toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        'Fant ikke kvittering for 8d50ef20-37b5-4829-ad83-56219e70b375. Feilkode:401. Feiltekst: Unauthorized'
      );
    });
  });

  describe('error handling - non-200 status', () => {
    it('should call setSkjemaFeilet and log warning for 500 error', async () => {
      mockedFetchKvitteringsdata.mockRejectedValue({ status: 500, message: 'Internal Server Error' });

      const { result } = renderHook(() => useHentKvitteringsdata());
      await result.current(uuid);

      expect(mockSetSkjemaFeilet).toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        'Fant ikke kvittering for 8d50ef20-37b5-4829-ad83-56219e70b375. Feilkode:500. Feiltekst: Internal Server Error'
      );
    });

    it('should call setSkjemaFeilet and log warning for 404 error', async () => {
      mockedFetchKvitteringsdata.mockRejectedValue({ status: 404, message: 'Not Found' });

      const { result } = renderHook(() => useHentKvitteringsdata());
      await result.current(uuid);

      expect(mockSetSkjemaFeilet).toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        'Fant ikke kvittering for 8d50ef20-37b5-4829-ad83-56219e70b375. Feilkode:404. Feiltekst: Not Found'
      );
    });

    it('should call setSkjemaFeilet and log warning for 403 error', async () => {
      mockedFetchKvitteringsdata.mockRejectedValue({ status: 403, message: 'Forbidden' });

      const { result } = renderHook(() => useHentKvitteringsdata());
      await result.current(uuid);

      expect(mockSetSkjemaFeilet).toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        'Fant ikke kvittering for 8d50ef20-37b5-4829-ad83-56219e70b375. Feilkode:403. Feiltekst: Forbidden'
      );
    });

    it('should not call setSkjemaFeilet when error status is 200', async () => {
      mockedFetchKvitteringsdata.mockRejectedValue({ status: 200, message: 'OK' });

      const { result } = renderHook(() => useHentKvitteringsdata());
      await result.current(uuid);

      expect(mockSetSkjemaFeilet).not.toHaveBeenCalled();
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });
});
