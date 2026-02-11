import { act, renderHook, cleanup } from '@testing-library/react';
import useBoundStore from '../../state/useBoundStore';
import { MottattPeriode } from '../../schema/ForespurtDataSchema';
import { vi } from 'vitest';

const egenmeldingsperioder: Array<MottattPeriode> = [
  { fom: '2022-06-06', tom: '2022-07-06' },
  { fom: '2022-08-06', tom: '2022-09-06' },
  { fom: '2022-10-06', tom: '2022-11-06' }
];

const initialState = useBoundStore.getState();

vi.mock('next/router', () => require('next-router-mock'));

describe('useEgenmeldingStore', () => {
  beforeEach(() => {
    useBoundStore.setState(initialState, true);
  });

  afterEach(() => {
    // You can chose to set the store's state to a default value here.
    vi.resetAllMocks();
    cleanup();
  });

  it('should initialize the data.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initEgenmeldingsperiode(egenmeldingsperioder);
    });

    expect(result.current.egenmeldingsperioder?.[0].fom).toEqual(new Date(2022, 5, 6));
    expect(result.current.egenmeldingsperioder?.[0].tom).toEqual(new Date(2022, 6, 6));
    expect(result.current.egenmeldingsperioder?.length).toBe(3);
  });

  it('should add a backup of egenmelding opprinneligEgenmelding.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initEgenmeldingsperiode(egenmeldingsperioder);
    });

    expect(result.current.egenmeldingsperioder).toEqual(result.current.opprinneligEgenmeldingsperiode);
  });
});
