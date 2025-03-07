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
import { z } from 'zod';
import { kvitteringNavNoSchema } from '../../schema/mottattKvitteringSchema';

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

type KvitteringNavNoSchema = z.infer<typeof kvitteringNavNoSchema>;

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
      kvitteringInit(mottattKvittering);
    });

    const skjema = mottattKvittering.kvitteringNavNo.skjema;

    expect(result.current.navn).toEqual(mottattKvittering.kvitteringNavNo.sykmeldt.navn);
    expect(result.current.identitetsnummer).toEqual(mottattKvittering.kvitteringNavNo.sykmeldt.fnr);
    expect(result.current.orgnrUnderenhet).toEqual(mottattKvittering.kvitteringNavNo.avsender.orgnr);
    expect(result.current.virksomhetsnavn).toEqual(mottattKvittering.kvitteringNavNo.avsender.orgNavn);

    expect(result.current.harRefusjonEndringer).toBe('Ja');
    expect(result.current.egenmeldingsperioder).toEqual([
      {
        fom: parseIsoDate(skjema.agp.egenmeldinger[0].fom),
        id: 'uuid',
        tom: parseIsoDate(skjema.agp.egenmeldinger[0].tom)
      }
    ]);
  });

  it('should fill the state with other stuff', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    act(() => {
      kvitteringInit(annenMottattKvittering);
    });

    const navNo = annenMottattKvittering.kvitteringNavNo as KvitteringNavNoSchema;

    expect(result.current.navn).toEqual(navNo.sykmeldt.navn);
    expect(result.current.identitetsnummer).toEqual(navNo.sykmeldt.fnr);
    expect(result.current.orgnrUnderenhet).toEqual(navNo.avsender.orgnr);
    expect(result.current.virksomhetsnavn).toEqual(navNo.avsender.orgNavn);

    expect(result.current.fullLonnIArbeidsgiverPerioden?.status).toBe('Nei');
    expect(result.current.fullLonnIArbeidsgiverPerioden?.begrunnelse).toBe('LovligFravaer');
    expect(result.current.fullLonnIArbeidsgiverPerioden?.utbetalt).toBe(30000);

    expect(result.current.bruttoinntekt.endringsaarsaker?.[0].aarsak).toBe('Tariffendring');
    // expect(result.current.bruttoinntekt.manueltKorrigert).toBeTruthy();
    expect(result.current.egenmeldingsperioder).toEqual([]);
    expect(result.current.harRefusjonEndringer).toBe('Ja');
    expect(result.current.bruttoinntekt.endringsaarsaker?.[0].gjelderFra).toEqual(parseIsoDate('2023-02-24'));
    expect(result.current.bruttoinntekt.endringsaarsaker?.[0].bleKjent).toEqual(parseIsoDate('2023-03-31'));
  });

  it('should fill the state with ferie stuff', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    act(() => {
      kvitteringInit(ferieKvittering as unknown as KvitteringInit);
    });

    expect(result.current.bruttoinntekt.endringsaarsaker?.[0].aarsak).toBe('Ferie');
    expect(result.current.harRefusjonEndringer).toBe('Ja');

    expect(result.current.bruttoinntekt.endringsaarsaker?.[0].ferier).toEqual([
      {
        fom: parseIsoDate('2023-02-24'),
        tom: parseIsoDate('2023-03-31')
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

    expect(result.current.bruttoinntekt.endringsaarsaker?.[0].aarsak).toBe('VarigLoennsendring');
    expect(result.current.harRefusjonEndringer).toBe('Ja');

    expect(result.current.bruttoinntekt.endringsaarsaker?.[0].gjelderFra).toEqual(parseIsoDate('2023-02-24'));
  });

  it('should fill the state with permisjon stuff', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    act(() => {
      kvitteringInit(permisjonKvittering as unknown as KvitteringInit);
    });

    expect(result.current.bruttoinntekt.endringsaarsaker?.[0].aarsak).toBe('Permisjon');
    expect(result.current.harRefusjonEndringer).toBe('Ja');

    expect(result.current.bruttoinntekt.endringsaarsaker?.[0].permisjoner).toEqual([
      {
        fom: parseIsoDate('2023-02-24'),
        tom: parseIsoDate('2023-03-31')
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

    expect(result.current.bruttoinntekt.endringsaarsaker?.[0].aarsak).toBe('Permittering');
    expect(result.current.harRefusjonEndringer).toBe('Ja');

    expect(result.current.bruttoinntekt.endringsaarsaker?.[0].permitteringer).toEqual([
      {
        fom: parseIsoDate('2023-02-24'),
        tom: parseIsoDate('2023-03-31')
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

    expect(result.current.bruttoinntekt.endringsaarsaker?.[0].aarsak).toBe('NyStilling');
    expect(result.current.harRefusjonEndringer).toBe('Ja');

    expect(result.current.bruttoinntekt.endringsaarsaker?.[0].gjelderFra).toEqual(parseIsoDate('2023-02-24'));
  });

  it('should fill the state with NyStillingsprosent stuff', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    act(() => {
      kvitteringInit(nyStillingsprosentKvittering as unknown as KvitteringInit);
    });

    expect(result.current.bruttoinntekt.endringsaarsaker?.[0].aarsak).toBe('NyStillingsprosent');
    expect(result.current.harRefusjonEndringer).toBe('Ja');

    expect(result.current.bruttoinntekt.endringsaarsaker?.[0].gjelderFra).toEqual(parseIsoDate('2023-02-24'));
  });

  it('should fill the state with syk stuff', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    act(() => {
      kvitteringInit(sykKvittering as unknown as KvitteringInit);
    });

    expect(result.current.bruttoinntekt.endringsaarsaker?.[0].aarsak).toBe('Sykefravaer');
    expect(result.current.harRefusjonEndringer).toBe('Ja');

    expect(result.current.bruttoinntekt.endringsaarsaker?.[0]?.sykefravaer).toEqual([
      {
        fom: parseIsoDate('2023-02-06'),
        tom: parseIsoDate('2023-02-10')
      },
      {
        fom: parseIsoDate('2023-02-24'),
        tom: parseIsoDate('2023-03-06')
      }
    ]);
  });
});
