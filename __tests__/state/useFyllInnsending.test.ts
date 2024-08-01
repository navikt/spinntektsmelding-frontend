import { vi, expect } from 'vitest';
import useBoundStore from '../../state/useBoundStore';
import { act, cleanup, renderHook } from '@testing-library/react';
import useFyllInnsending, { InnsendingSkjema } from '../../state/useFyllInnsending';
import { nanoid } from 'nanoid';
import mottattKvittering from '../../mockdata/kvittering.json';

import inntektData from '../../mockdata/inntektData.json';
import delvisRefusjon from '../../mockdata/kvittering-delvis-refusjon.json';
import useKvitteringInit, { KvitteringInit } from '../../state/useKvitteringInit';

vi.mock('nanoid');

const initialState = useBoundStore.getState();

function fetchMock(url, suffix = '') {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        json: () =>
          Promise.resolve({
            data: inntektData
          })
      });
    }, 20)
  );
}

describe('useFyllInnsending', () => {
  beforeEach(() => {
    useBoundStore.setState(initialState, true);
    vi.spyOn(global, 'fetch').mockImplementation(fetchMock);
    nanoid.mockReturnValue('uuid');
  });

  afterEach(() => {
    // You can chose to set the store's state to a default value here.
    vi.resetAllMocks();
    cleanup();
  });
  it('should fill the state stuff', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: kvittInit } = renderHook(() => useKvitteringInit());

    const kvitteringInit = kvittInit.current;

    act(() => {
      kvitteringInit(mottattKvittering as unknown as KvitteringInit);
    });

    const { result: fyller } = renderHook(() => useFyllInnsending());

    const fyllInnsending = fyller.current;

    let innsending: InnsendingSkjema;

    act(() => {
      innsending = fyllInnsending(false);
    });

    if (innsending) {
      // expect(innsending.identitetsnummer).toEqual(mottattKvittering.identitetsnummer);
      // expect(innsending.orgnrUnderenhet).toEqual(mottattKvittering.orgnrUnderenhet);

      expect(innsending.agp.egenmeldinger).toEqual([
        {
          fom: mottattKvittering.egenmeldingsperioder[0].fom,
          tom: mottattKvittering.egenmeldingsperioder[0].tom
        }
      ]);
      // expect(innsending.refusjon.utbetalerHeleEllerDeler).toBeTruthy();
      expect(innsending.refusjon.beloepPerMaaned).toBe(80666.66666666667);
      expect(innsending.inntekt.beloep).toBe(80666.66666666667);
      // expect(innsending.inntekt.bekreftet).toBeTruthy();
    }
  });

  it('should fill the state stuff - delvis', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: kvittInit } = renderHook(() => useKvitteringInit());

    const kvitteringInit = kvittInit.current;

    act(() => {
      kvitteringInit(delvisRefusjon as unknown as KvitteringInit);
    });

    const { result: fyller } = renderHook(() => useFyllInnsending());

    const fyllInnsending = fyller.current;

    let innsending: InnsendingSkjema = {} as InnsendingSkjema;

    act(() => {
      innsending = fyllInnsending(false, '8d50ef20-37b5-4829-ad83-56219e70b375');
    });

    if (innsending) {
      console.log(innsending);
      // expect(innsending.identitetsnummer).toEqual(mottattKvittering.identitetsnummer);
      // expect(innsending.orgnrUnderenhet).toEqual(mottattKvittering.orgnrUnderenhet);

      expect(innsending.agp.egenmeldinger).toEqual([
        {
          fom: mottattKvittering.egenmeldingsperioder[0].fom,
          tom: mottattKvittering.egenmeldingsperioder[0].tom
        }
      ]);
      // expect(innsending.refusjon.utbetalerHeleEllerDeler).toBeTruthy();
      expect(innsending.refusjon.beloepPerMaaned).toBe(80666.66666666667);
      expect(innsending.refusjon.sluttdato).toBe('2023-04-19');
      expect(innsending.refusjon.endringer).toEqual([
        { beloep: 1234, startdato: '2023-04-13' },
        { beloep: 12345, startdato: '2023-04-20' }
      ]);
      expect(innsending.inntekt.beloep).toBe(80666.66666666667);
      // expect(innsending.inntekt.bekreftet).toBeTruthy();
    } else {
      expect(innsending).toBeTruthy();
    }
  });
});
