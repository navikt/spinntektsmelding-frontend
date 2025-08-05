import { vi, expect } from 'vitest';
import useBoundStore from '../../state/useBoundStore';
import { act, cleanup, renderHook } from '@testing-library/react';
import useKvitteringInit from '../../state/useKvitteringInit';
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
import { z } from 'zod/v4';
import MottattKvitteringSchema, { kvitteringNavNoSchema } from '../../schema/MottattKvitteringSchema';
import eksterntSystem from '../../mockdata/kvittering-eksternt-system.json';
import kvitteringMedRefusjonSluttdato from '../../mockdata/kvittering-delvis-refusjon.json';

type KvitteringData = z.infer<typeof MottattKvitteringSchema>;
type KvitteringNavNo = z.infer<typeof kvitteringNavNoSchema>;

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
      kvitteringInit(mottattKvittering);
    });

    const skjema = mottattKvittering.kvitteringNavNo.skjema;

    expect(result.current.sykmeldt.navn).toEqual(mottattKvittering.kvitteringNavNo.sykmeldt.navn);
    expect(result.current.sykmeldt.fnr).toEqual(mottattKvittering.kvitteringNavNo.sykmeldt.fnr);
    expect(result.current.avsender.orgnr).toEqual(mottattKvittering.kvitteringNavNo.avsender.orgnr);
    expect(result.current.avsender.orgNavn).toEqual(mottattKvittering.kvitteringNavNo.avsender.orgNavn);

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

    const navNo = annenMottattKvittering.kvitteringNavNo as KvitteringNavNo;

    expect(result.current.sykmeldt.navn).toEqual(navNo.sykmeldt.navn);
    expect(result.current.sykmeldt.fnr).toEqual(navNo.sykmeldt.fnr);
    expect(result.current.avsender.orgnr).toEqual(navNo.avsender.orgnr);
    expect(result.current.avsender.orgNavn).toEqual(navNo.avsender.orgNavn);

    expect(result.current.fullLonnIArbeidsgiverPerioden?.status).toBe('Nei');
    expect(result.current.fullLonnIArbeidsgiverPerioden?.begrunnelse).toBe('LovligFravaer');
    expect(result.current.fullLonnIArbeidsgiverPerioden?.utbetalt).toBe(30000);

    expect(result.current.bruttoinntekt.endringAarsaker?.[0].aarsak).toBe('Tariffendring');
    // expect(result.current.bruttoinntekt.manueltKorrigert).toBeTruthy();
    expect(result.current.egenmeldingsperioder).toEqual([]);
    expect(result.current.harRefusjonEndringer).toBe('Ja');
    expect(result.current.bruttoinntekt.endringAarsaker?.[0].gjelderFra).toEqual(parseIsoDate('2023-02-24'));
    expect(result.current.bruttoinntekt.endringAarsaker?.[0].bleKjent).toEqual(parseIsoDate('2023-03-31'));
  });

  it('should fill the state with ferie stuff', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    act(() => {
      kvitteringInit(ferieKvittering as KvitteringData);
    });

    expect(result.current.bruttoinntekt.endringAarsaker?.[0].aarsak).toBe('Ferie');
    expect(result.current.harRefusjonEndringer).toBe('Ja');

    expect(result.current.bruttoinntekt.endringAarsaker?.[0].ferier).toEqual([
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

    expect(result.current.bruttoinntekt.endringAarsaker?.[0].aarsak).toBe('VarigLoennsendring');
    expect(result.current.harRefusjonEndringer).toBe('Ja');

    expect(result.current.bruttoinntekt.endringAarsaker?.[0].gjelderFra).toEqual(parseIsoDate('2023-02-24'));
  });

  it('should fill the state with permisjon stuff', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    act(() => {
      kvitteringInit(permisjonKvittering as unknown as KvitteringInit);
    });

    expect(result.current.bruttoinntekt.endringAarsaker?.[0].aarsak).toBe('Permisjon');
    expect(result.current.harRefusjonEndringer).toBe('Ja');

    expect(result.current.bruttoinntekt.endringAarsaker?.[0].permisjoner).toEqual([
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

    expect(result.current.bruttoinntekt.endringAarsaker?.[0].aarsak).toBe('Permittering');
    expect(result.current.harRefusjonEndringer).toBe('Ja');

    expect(result.current.bruttoinntekt.endringAarsaker?.[0].permitteringer).toEqual([
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

    expect(result.current.bruttoinntekt.endringAarsaker?.[0].aarsak).toBe('NyStilling');
    expect(result.current.harRefusjonEndringer).toBe('Ja');

    expect(result.current.bruttoinntekt.endringAarsaker?.[0].gjelderFra).toEqual(parseIsoDate('2023-02-24'));
  });

  it('should fill the state with NyStillingsprosent stuff', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    act(() => {
      kvitteringInit(nyStillingsprosentKvittering as unknown as KvitteringInit);
    });

    expect(result.current.bruttoinntekt.endringAarsaker?.[0].aarsak).toBe('NyStillingsprosent');
    expect(result.current.harRefusjonEndringer).toBe('Ja');

    expect(result.current.bruttoinntekt.endringAarsaker?.[0].gjelderFra).toEqual(parseIsoDate('2023-02-24'));
  });

  it('should fill the state with syk stuff', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    act(() => {
      kvitteringInit(sykKvittering as unknown as KvitteringInit);
    });

    expect(result.current.bruttoinntekt.endringAarsaker?.[0].aarsak).toBe('Sykefravaer');
    expect(result.current.harRefusjonEndringer).toBe('Ja');

    expect(result.current.bruttoinntekt.endringAarsaker?.[0]?.sykefravaer).toEqual([
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

  it('should set the status for eksternt system', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    act(() => {
      kvitteringInit(eksterntSystem as unknown as KvitteringInit);
    });

    expect(result.current.kvitteringEksterntSystem).toEqual(eksterntSystem.kvitteringEkstern);
  });

  it('should set the refusjon sluttdato in the correct place', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    act(() => {
      kvitteringInit(kvitteringMedRefusjonSluttdato as unknown as KvitteringInit);
    });

    expect(result.current.refusjonEndringer).toEqual([
      {
        beloep: 1234,
        dato: parseIsoDate('2023-04-13')
      },
      {
        beloep: 12345,
        dato: parseIsoDate('2023-04-20')
      },
      {
        beloep: 0,
        dato: parseIsoDate('2023-04-19')
      }
    ]);
  });

  it('should set the refusjon sluttdato in the correct place, even when there are no endringer', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    kvitteringMedRefusjonSluttdato.kvitteringNavNo.skjema.refusjon.endringer = [];

    act(() => {
      kvitteringInit(kvitteringMedRefusjonSluttdato as unknown as KvitteringInit);
    });

    expect(result.current.refusjonEndringer).toEqual([
      {
        beloep: 0,
        dato: parseIsoDate('2023-04-19')
      }
    ]);
  });

  it('should set the innsendingstidspunkt', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    act(() => {
      kvitteringInit(kvitteringMedRefusjonSluttdato as unknown as KvitteringInit);
    });

    expect(result.current.kvitteringInnsendt).toEqual(new Date(kvitteringMedRefusjonSluttdato.kvitteringNavNo.mottatt));
    expect(result.current.kvitteringInnsendt).toBeInstanceOf(Date);
  });
});
