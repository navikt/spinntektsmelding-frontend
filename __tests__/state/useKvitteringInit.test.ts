import { vi, expect } from 'vitest';
import useBoundStore from '../../state/useBoundStore';
import { act, cleanup, renderHook } from '@testing-library/react';
import useKvitteringInit, { KvitteringInit } from '../../state/useKvitteringInit';
import { nanoid } from 'nanoid';
import mottattKvittering from '../../mockdata/kvittering.json';
import annenMottattKvittering from '../../mockdata/kvittering-lang.json';
import ferieKvittering from '../../mockdata/kvittering-ferie.json';
import sykKvittering from '../../mockdata/kvittering-syk.json';
import varigLonnsendringKvittering from '../../mockdata/kvittering-VarigLonnsendring.json';
import permisjonKvittering from '../../mockdata/kvittering-Permisjon.json';
import permitteringKvittering from '../../mockdata/kvittering-Permittering.json';
import nyStillingKvittering from '../../mockdata/kvittering-NyStilling.json';
import nyStillingsprosentKvittering from '../../mockdata/kvittering-NyStillingsprosent.json';
import inntektData from '../../mockdata/inntektData.json';
import parseIsoDate from '../../utils/parseIsoDate';

vi.mock('nanoid');

const initialState = useBoundStore.getState();

function fetchMock(url, suffix = '') {
  return new Promise((resolve) =>
    setTimeout(
      () => {
        resolve({
          json: () =>
            Promise.resolve({
              data: inntektData
            })
        });
      },
      200 + Math.random() * 300
    )
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
      kvitteringInit(mottattKvittering as unknown as KvitteringInit);
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
  });

  it('should fill the state with other stuff', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    act(() => {
      kvitteringInit(annenMottattKvittering as unknown as KvitteringInit);
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
    expect(result.current.egenmeldingsperioder).toEqual([]);
    expect(result.current.harRefusjonEndringer).toBe('Ja');
    expect(result.current.tariffendringDato).toEqual(parseIsoDate('2023-02-24'));
    expect(result.current.tariffkjentdato).toEqual(parseIsoDate('2023-03-31'));
  });

  it('should fill the state with ferie stuff', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    act(() => {
      kvitteringInit(ferieKvittering as unknown as KvitteringInit);
    });

    expect(result.current.bruttoinntekt.endringsaarsak).toBe('Ferie');
    expect(result.current.bruttoinntekt.manueltKorrigert).toBeTruthy();
    expect(result.current.harRefusjonEndringer).toBe('Ja');

    expect(result.current.ferie).toEqual([
      {
        fom: parseIsoDate('2023-02-24'),
        tom: parseIsoDate('2023-03-31'),
        id: 'uuid'
      }
    ]);
  });

  it('should fill the state with VarigLonnsendring stuff', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    act(() => {
      kvitteringInit(varigLonnsendringKvittering as unknown as KvitteringInit);
    });

    expect(result.current.bruttoinntekt.endringsaarsak).toBe('VarigLoennsendring');
    expect(result.current.bruttoinntekt.manueltKorrigert).toBeTruthy();
    expect(result.current.harRefusjonEndringer).toBe('Ja');

    expect(result.current.lonnsendringsdato).toEqual(parseIsoDate('2023-02-24'));
  });

  it('should fill the state with permisjon stuff', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    act(() => {
      kvitteringInit(permisjonKvittering as unknown as KvitteringInit);
    });

    expect(result.current.bruttoinntekt.endringsaarsak).toBe('Permisjon');
    expect(result.current.bruttoinntekt.manueltKorrigert).toBeTruthy();
    expect(result.current.harRefusjonEndringer).toBe('Ja');

    expect(result.current.permisjon).toEqual([
      {
        fom: parseIsoDate('2023-02-24'),
        tom: parseIsoDate('2023-03-31'),
        id: 'uuid'
      }
    ]);
  });

  it('should fill the state with permittering stuff', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    act(() => {
      kvitteringInit(permitteringKvittering as unknown as KvitteringInit);
    });

    expect(result.current.bruttoinntekt.endringsaarsak).toBe('Permittering');
    expect(result.current.bruttoinntekt.manueltKorrigert).toBeTruthy();
    expect(result.current.harRefusjonEndringer).toBe('Ja');

    expect(result.current.permittering).toEqual([
      {
        fom: parseIsoDate('2023-02-24'),
        tom: parseIsoDate('2023-03-31'),
        id: 'uuid'
      }
    ]);
  });

  it('should fill the state with NyStilling stuff', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    act(() => {
      kvitteringInit(nyStillingKvittering as unknown as KvitteringInit);
    });

    expect(result.current.bruttoinntekt.endringsaarsak).toBe('NyStilling');
    expect(result.current.bruttoinntekt.manueltKorrigert).toBeTruthy();
    expect(result.current.harRefusjonEndringer).toBe('Ja');

    expect(result.current.nystillingdato).toEqual(parseIsoDate('2023-02-24'));
  });

  it('should fill the state with NyStillingsprosent stuff', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    act(() => {
      kvitteringInit(nyStillingsprosentKvittering as unknown as KvitteringInit);
    });

    expect(result.current.bruttoinntekt.endringsaarsak).toBe('NyStillingsprosent');
    expect(result.current.bruttoinntekt.manueltKorrigert).toBeTruthy();
    expect(result.current.harRefusjonEndringer).toBe('Ja');

    expect(result.current.nystillingsprosentdato).toEqual(parseIsoDate('2023-02-24'));
  });

  it('should fill the state with syk stuff', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    act(() => {
      kvitteringInit(sykKvittering as unknown as KvitteringInit);
    });

    expect(result.current.bruttoinntekt.endringsaarsak).toBe('Sykefravaer');
    expect(result.current.bruttoinntekt.manueltKorrigert).toBeTruthy();
    expect(result.current.harRefusjonEndringer).toBe('Ja');

    expect(result.current.sykefravaerperioder).toEqual([
      {
        fom: parseIsoDate('2023-02-06'),
        tom: parseIsoDate('2023-02-10'),
        id: 'uuid'
      },
      {
        fom: parseIsoDate('2023-02-24'),
        tom: parseIsoDate('2023-03-06'),
        id: 'uuid'
      }
    ]);
  });
});
