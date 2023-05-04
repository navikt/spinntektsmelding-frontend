import { vi, expect } from 'vitest';
import useBoundStore from '../../state/useBoundStore';
import { act, cleanup, renderHook } from '@testing-library/react';
import useKvitteringInit, { KvitteringSkjema } from '../../state/useKvitteringInit';
import { nanoid } from 'nanoid';
import mottattKvittering from '../../mockdata/kvittering.json';
import annenMottattKvittering from '../../mockdata/kvittering-lang.json';
import inntektData from '../../mockdata/inntektData';
import parseIsoDate from '../../utils/parseIsoDate';

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

    expect(result.current.harRefusjonEndringer).toBe('Ja');
    expect(result.current.egenmeldingsperioder).toEqual([
      {
        fom: parseIsoDate(mottattKvittering.egenmeldingsperioder[0].fom),
        id: 'uuid',
        tom: parseIsoDate(mottattKvittering.egenmeldingsperioder[0].tom)
      }
    ]);
    expect(result.current.slug).toBe('sluggish');
  });

  it('should fill the state with other stuff', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    act(() => {
      kvitteringInit(annenMottattKvittering as unknown as KvitteringSkjema, 'sluggish');
    });

    expect(result.current.navn).toEqual(annenMottattKvittering.fulltNavn);
    expect(result.current.identitetsnummer).toEqual(annenMottattKvittering.identitetsnummer);
    expect(result.current.orgnrUnderenhet).toEqual(annenMottattKvittering.orgnrUnderenhet);
    expect(result.current.virksomhetsnavn).toEqual(annenMottattKvittering.virksomhetNavn);

    expect(result.current.fullLonnIArbeidsgiverPerioden?.status).toBe('Nei');
    expect(result.current.fullLonnIArbeidsgiverPerioden?.begrunnelse).toBe('LovligFravaer');
    expect(result.current.fullLonnIArbeidsgiverPerioden?.utbetalt).toBe(30000);

    expect(result.current.bruttoinntekt.endringsaarsak).toBe('Tariffendring');
    expect(result.current.bruttoinntekt.manueltKorrigert).toBeTruthy();
    expect(result.current.egenmeldingsperioder).toEqual([{ id: 'uuid' }]);
    expect(result.current.harRefusjonEndringer).toBe('Ja');
    expect(result.current.tariffendringsdato).toEqual(parseIsoDate('2023-02-24'));
    expect(result.current.tariffkjentdato).toEqual(parseIsoDate('2023-03-31'));
    expect(result.current.slug).toBe('sluggish');
  });
});
