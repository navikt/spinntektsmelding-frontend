import { vi, expect } from 'vitest';
import useBoundStore from '../../state/useBoundStore';
import { act, cleanup, renderHook } from '@testing-library/react';
import useKvitteringInit, { KvitteringSkjema } from '../../state/useKvitteringInit';
import { nanoid } from 'nanoid';
import mottattKvittering from '../../mockdata/kvittering.json';
import inntektData from '../../mockdata/inntektData';
import parseIsoDate from '../../utils/parseIsoDate';
import { YesNo } from '../../state/state';

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

describe('useKvitteringInit', () => {
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

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    act(() => {
      kvitteringInit(mottattKvittering as unknown as KvitteringSkjema, 'sluggish');
    });

    expect(result.current.navn).toEqual(mottattKvittering.fulltNavn);
    expect(result.current.identitetsnummer).toEqual(mottattKvittering.identitetsnummer);
    expect(result.current.orgnrUnderenhet).toEqual(mottattKvittering.orgnrUnderenhet);
    expect(result.current.virksomhetsnavn).toEqual(mottattKvittering.virksomhetNavn);

    expect(result.current.harRefusjonEndringer).toBeUndefined();
    expect(result.current.egenmeldingsperioder).toEqual([
      {
        fom: parseIsoDate(mottattKvittering.egenmeldingsperioder[0].fom),
        id: 'uuid',
        tom: parseIsoDate(mottattKvittering.egenmeldingsperioder[0].tom)
      }
    ]);
    expect(result.current.slug).toBe('sluggish');
  });
});
