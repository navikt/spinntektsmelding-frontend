import { act, renderHook, cleanup } from '@testing-library/react';
import useBoundStore from '../../state/useBoundStore';
import { vi } from 'vitest';
import parseIsoDate from '../../utils/parseIsoDate';

const initialState = useBoundStore.getState();

describe('useSkjemadataStore', () => {
  beforeEach(() => {
    useBoundStore.setState(initialState, true);
  });

  afterEach(() => {
    // You can chose to set the store's state to a default value here.
    vi.resetAllMocks();
    cleanup();
  });

  it('should set nyInnsending.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    expect(result.current.nyInnsending).toBeTruthy();

    act(() => {
      result.current.setNyInnsending(false);
    });

    expect(result.current.nyInnsending).toBeFalsy();
  });

  it('should set henterInntektsdata.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    expect(result.current.henterInntektsdata).toBeFalsy();

    act(() => {
      result.current.setHenterInnsending(true);
    });

    expect(result.current.henterInntektsdata).toBeTruthy();
  });

  it('should set setVedtaksperiodeId.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    expect(result.current.vedtaksperiodeId).toBeFalsy();

    act(() => {
      result.current.setVedtaksperiodeId('true');
    });

    expect(result.current.vedtaksperiodeId).toBe('true');
  });

  it('should set forespoerselSistOppdatert.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    expect(result.current.forespoerselSistOppdatert).toBeFalsy();

    const date = new Date();

    act(() => {
      result.current.setForespoerselSistOppdatert(date);
    });

    expect(result.current.forespoerselSistOppdatert).toBe(date);
  });

  it('should set forespoerselSistOppdatert fra tekststreng.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    expect(result.current.forespoerselSistOppdatert).toBeFalsy();

    const date = '2024-12-24';

    act(() => {
      result.current.setForespoerselSistOppdatert(date);
    });

    expect(result.current.forespoerselSistOppdatert).toEqual(parseIsoDate(date));
  });
});
