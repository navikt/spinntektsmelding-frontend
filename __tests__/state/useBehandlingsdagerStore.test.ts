import { act, renderHook } from '@testing-library/react';
import { cleanup } from '@testing-library/react';
import useBoundStore from '../../state/useBoundStore';
import { MottattPeriode } from '../../state/MottattData';
import { vi } from 'vitest';

const inputPeriode: MottattPeriode = { fom: '2022-05-01', tom: '2022-11-01' };
const inputDager: Array<string> = ['2022-05-10', '2022-06-10', '2022-07-10', '2022-08-10', '2022-09-10', '2022-10-10'];
const initialState = useBoundStore.getState();

describe('useBoundStore', () => {
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
      result.current.initBehandlingsdager(inputPeriode, inputDager);
    });

    expect(result.current.behandlingsperiode?.fom).toEqual(new Date(2022, 4, 1));
    expect(result.current.behandlingsperiode?.tom).toEqual(new Date(2022, 10, 1));
    expect(result.current.behandlingsdager?.length).toBe(6);
    expect(result.current.behandlingsdager).toEqual([
      new Date(2022, 4, 10),
      new Date(2022, 5, 10),
      new Date(2022, 6, 10),
      new Date(2022, 7, 10),
      new Date(2022, 8, 10),
      new Date(2022, 9, 10)
    ]);
  });

  it('should set the behandlingsdager.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const oppdaterteDager: Array<Date> = [new Date(2022, 4, 15), new Date(2022, 6, 15), new Date(2022, 9, 15)];

    act(() => {
      result.current.initBehandlingsdager(inputPeriode, inputDager);
    });

    act(() => {
      result.current.setBehandlingsdager(oppdaterteDager);
    });

    expect(result.current.behandlingsdager?.length).toBe(3);

    expect(result.current.behandlingsdager?.[0]).toEqual(new Date(2022, 4, 15));
    expect(result.current.behandlingsdager?.[1]).toEqual(new Date(2022, 6, 15));
    expect(result.current.behandlingsdager?.[2]).toEqual(new Date(2022, 9, 15));
  });
});
