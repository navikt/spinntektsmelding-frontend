import { vi, expect } from 'vitest';
import useBoundStore from '../../state/useBoundStore';
import { act, cleanup, renderHook } from '@testing-library/react';
import useFyllInnsending, { InnsendingSkjema } from '../../state/useFyllInnsending';
import { nanoid } from 'nanoid';
import mottattKvittering from '../../mockdata/kvittering.json';

import inntektData from '../../mockdata/inntektData';
import delvisRefusjon from '../../mockdata/kvittering-delvis-refusjon.json';
import useKvitteringInit, { KvitteringSkjema } from '../../state/useKvitteringInit';

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
    }, 200 + Math.random() * 300)
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
      kvitteringInit(mottattKvittering as unknown as KvitteringSkjema, 'sluggish');
    });

    const { result: fyller } = renderHook(() => useFyllInnsending());

    const fyllInnsending = fyller.current;

    let innsending: InnsendingSkjema;

    act(() => {
      innsending = fyllInnsending(false);
    });

    if (innsending) {
      expect(innsending.identitetsnummer).toEqual(mottattKvittering.identitetsnummer);
      expect(innsending.orgnrUnderenhet).toEqual(mottattKvittering.orgnrUnderenhet);

      expect(innsending.egenmeldingsperioder).toEqual([
        {
          fom: mottattKvittering.egenmeldingsperioder[0].fom,
          tom: mottattKvittering.egenmeldingsperioder[0].tom
        }
      ]);
      expect(innsending.refusjon.utbetalerHeleEllerDeler).toBeTruthy();
      expect(innsending.refusjon.refusjonPrMnd).toBe(80666.66666666667);
      expect(innsending.inntekt.beregnetInntekt).toBe(80666.66666666667);
      expect(innsending.inntekt.bekreftet).toBeTruthy();
    }
  });

  it('should fill the state stuff', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: kvittInit } = renderHook(() => useKvitteringInit());

    const kvitteringInit = kvittInit.current;

    act(() => {
      kvitteringInit(delvisRefusjon as unknown as KvitteringSkjema, 'sluggish');
    });

    const { result: fyller } = renderHook(() => useFyllInnsending());

    const fyllInnsending = fyller.current;

    let innsending: InnsendingSkjema;

    act(() => {
      innsending = fyllInnsending(false);
    });

    if (innsending) {
      expect(innsending.identitetsnummer).toEqual(mottattKvittering.identitetsnummer);
      expect(innsending.orgnrUnderenhet).toEqual(mottattKvittering.orgnrUnderenhet);

      expect(innsending.egenmeldingsperioder).toEqual([
        {
          fom: mottattKvittering.egenmeldingsperioder[0].fom,
          tom: mottattKvittering.egenmeldingsperioder[0].tom
        }
      ]);
      expect(innsending.refusjon.utbetalerHeleEllerDeler).toBeFalsy();
      expect(innsending.refusjon.refusjonPrMnd).toBeUndefined();
      expect(innsending.refusjon.refusjonOpphører).toBeUndefined();
      expect(innsending.refusjon.refusjonEndringer).toBeUndefined();
      expect(innsending.inntekt.beregnetInntekt).toBe(80666.66666666667);
      expect(innsending.inntekt.bekreftet).toBeTruthy();
    } else {
      expect(innsending).toBeTruthy();
    }
  });
});
