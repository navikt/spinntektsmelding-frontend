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
import { KvitteringNavNoSchema, MottattKvitteringSchema } from '../../schema/MottattKvitteringSchema';
import eksterntSystem from '../../mockdata/kvittering-eksternt-system.json';
import kvitteringMedRefusjonSluttdato from '../../mockdata/kvittering-delvis-refusjon.json';

type KvitteringData = z.infer<typeof MottattKvitteringSchema>;
type KvitteringNavNo = z.infer<typeof KvitteringNavNoSchema>;

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

  it('should set the refusjon to yes if there are endringer', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    kvitteringMedRefusjonSluttdato.kvitteringNavNo.skjema.refusjon = {
      beloepPerMaaned: 0.0,
      endringer: [
        {
          beloep: 41000.4,
          startdato: '2024-08-05'
        }
      ]
    };

    act(() => {
      kvitteringInit(kvitteringMedRefusjonSluttdato as unknown as KvitteringInit);
    });

    expect(result.current.harRefusjonEndringer).toBe('Ja');
    expect(result.current.refusjonEndringer).toEqual([
      {
        beloep: 41000.4,
        dato: parseIsoDate('2024-08-05')
      }
    ]);
    expect(result.current.lonnISykefravaeret.beloep).toBe(0.0);
  });

  it('should set the refusjon to No if there are no endringer', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    kvitteringMedRefusjonSluttdato.kvitteringNavNo.skjema.refusjon = {
      beloepPerMaaned: 0.0,
      endringer: []
    };

    act(() => {
      kvitteringInit(kvitteringMedRefusjonSluttdato as unknown as KvitteringInit);
    });

    expect(result.current.harRefusjonEndringer).toBe('Nei');
    expect(result.current.refusjonEndringer).toEqual([]);
    expect(result.current.lonnISykefravaeret.beloep).toBe(0.0);
  });

  it('should set naturalytelser when present in kvittering', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    const kvitteringMedNaturalytelser = {
      ...mottattKvittering,
      kvitteringNavNo: {
        ...mottattKvittering.kvitteringNavNo,
        skjema: {
          ...mottattKvittering.kvitteringNavNo.skjema,
          inntekt: {
            ...mottattKvittering.kvitteringNavNo.skjema.inntekt
          },
          naturalytelser: [
            {
              naturalytelse: 'ELEKTRONISKKOMMUNIKASJON',
              verdiBeloep: 500,
              sluttdato: '2023-03-01'
            },
            {
              naturalytelse: 'BIL',
              verdiBeloep: 3000,
              sluttdato: '2023-03-15'
            }
          ]
        }
      }
    };

    act(() => {
      kvitteringInit(kvitteringMedNaturalytelser as unknown as KvitteringData);
    });

    expect(result.current.naturalytelser).toEqual([
      {
        naturalytelse: 'ELEKTRONISKKOMMUNIKASJON',
        verdiBeloep: 500,
        sluttdato: parseIsoDate('2023-03-01')
      },
      {
        naturalytelse: 'BIL',
        verdiBeloep: 3000,
        sluttdato: parseIsoDate('2023-03-15')
      }
    ]);
  });

  it('should set empty naturalytelser array when none present', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    const kvitteringUtenNaturalytelser = {
      ...mottattKvittering,
      kvitteringNavNo: {
        ...mottattKvittering.kvitteringNavNo,
        skjema: {
          ...mottattKvittering.kvitteringNavNo.skjema,
          inntekt: {
            ...mottattKvittering.kvitteringNavNo.skjema.inntekt
          },
          naturalytelser: []
        }
      }
    };

    act(() => {
      kvitteringInit(kvitteringUtenNaturalytelser as unknown as KvitteringData);
    });

    expect(result.current.naturalytelser).toEqual([]);
  });

  it('should set empty naturalytelser array when naturalytelser is undefined', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    const kvitteringUndefinedNaturalytelser = {
      ...mottattKvittering,
      kvitteringNavNo: {
        ...mottattKvittering.kvitteringNavNo,
        skjema: {
          ...mottattKvittering.kvitteringNavNo.skjema,
          inntekt: {
            ...mottattKvittering.kvitteringNavNo.skjema.inntekt
          },
          naturalytelser: undefined
        }
      }
    };

    act(() => {
      kvitteringInit(kvitteringUndefinedNaturalytelser as unknown as KvitteringData);
    });

    expect(result.current.naturalytelser).toEqual([]);
  });

  it('should handle single naturalytelse correctly', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    const kvitteringMedEnNaturalytelse = {
      ...mottattKvittering,
      kvitteringNavNo: {
        ...mottattKvittering.kvitteringNavNo,
        skjema: {
          ...mottattKvittering.kvitteringNavNo.skjema,
          inntekt: {
            ...mottattKvittering.kvitteringNavNo.skjema.inntekt
          },
          naturalytelser: [
            {
              naturalytelse: 'KOSTDOEGN',
              verdiBeloep: 1500,
              sluttdato: '2023-04-01'
            }
          ]
        }
      }
    };

    act(() => {
      kvitteringInit(kvitteringMedEnNaturalytelse as unknown as KvitteringData);
    });

    expect(result.current.naturalytelser).toHaveLength(1);
    expect(result.current.naturalytelser[0]).toEqual({
      naturalytelse: 'KOSTDOEGN',
      verdiBeloep: 1500,
      sluttdato: parseIsoDate('2023-04-01')
    });
  });

  it('should handle naturalytelse with zero value', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    const kvitteringMedNullverdi = {
      ...mottattKvittering,
      kvitteringNavNo: {
        ...mottattKvittering.kvitteringNavNo,
        skjema: {
          ...mottattKvittering.kvitteringNavNo.skjema,
          inntekt: {
            ...mottattKvittering.kvitteringNavNo.skjema.inntekt
          },
          naturalytelser: [
            {
              naturalytelse: 'LOSJI',
              verdiBeloep: 0,
              sluttdato: '2023-05-01'
            }
          ]
        }
      }
    };

    act(() => {
      kvitteringInit(kvitteringMedNullverdi as unknown as KvitteringData);
    });

    expect(result.current.naturalytelser).toEqual([
      {
        naturalytelse: 'LOSJI',
        verdiBeloep: 0,
        sluttdato: parseIsoDate('2023-05-01')
      }
    ]);
  });

  it('should handle all naturalytelse types', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const { result: resp } = renderHook(() => useKvitteringInit());

    const kvitteringInit = resp.current;

    const kvitteringMedAlleTyper = {
      ...mottattKvittering,
      kvitteringNavNo: {
        ...mottattKvittering.kvitteringNavNo,
        skjema: {
          ...mottattKvittering.kvitteringNavNo.skjema,
          inntekt: {
            ...mottattKvittering.kvitteringNavNo.skjema.inntekt
          },
          naturalytelser: [
            { naturalytelse: 'ELEKTRONISKKOMMUNIKASJON', verdiBeloep: 500, sluttdato: '2023-03-01' },
            { naturalytelse: 'AKSJERGRUNNFONDSBEVISTITILUNDERKURS', verdiBeloep: 1000, sluttdato: '2023-03-02' },
            { naturalytelse: 'LOSJI', verdiBeloep: 2000, sluttdato: '2023-03-03' },
            { naturalytelse: 'KOSTDOEGN', verdiBeloep: 150, sluttdato: '2023-03-04' },
            { naturalytelse: 'BESØKSREISERHJABORTETIANSEN', verdiBeloep: 800, sluttdato: '2023-03-05' },
            { naturalytelse: 'KOSTBESPARELSEIHJEMMET', verdiBeloep: 600, sluttdato: '2023-03-06' },
            { naturalytelse: 'RENTEFORDELLAN', verdiBeloep: 400, sluttdato: '2023-03-07' },
            { naturalytelse: 'BIL', verdiBeloep: 5000, sluttdato: '2023-03-08' },
            { naturalytelse: 'KOSTDAGER', verdiBeloep: 75, sluttdato: '2023-03-09' },
            { naturalytelse: 'BOLIG', verdiBeloep: 8000, sluttdato: '2023-03-10' },
            { naturalytelse: 'SKATTEPLIKTIGDELFORSIKRINGER', verdiBeloep: 300, sluttdato: '2023-03-11' },
            { naturalytelse: 'FRITRANSPORT', verdiBeloep: 1200, sluttdato: '2023-03-12' },
            { naturalytelse: 'OPSJONER', verdiBeloep: 10000, sluttdato: '2023-03-13' },
            { naturalytelse: 'TILSKUDDFINANSTAB', verdiBeloep: 250, sluttdato: '2023-03-14' },
            { naturalytelse: 'INNBETALINGPENSJONSTILATJENESTEPENSJON', verdiBeloep: 3500, sluttdato: '2023-03-15' },
            { naturalytelse: 'YRKESBIL', verdiBeloep: 4000, sluttdato: '2023-03-16' },
            { naturalytelse: 'ANNET', verdiBeloep: 100, sluttdato: '2023-03-17' }
          ]
        }
      }
    };

    act(() => {
      kvitteringInit(kvitteringMedAlleTyper as unknown as KvitteringData);
    });

    expect(result.current.naturalytelser).toHaveLength(17);
    expect(result.current.naturalytelser[0].naturalytelse).toBe('ELEKTRONISKKOMMUNIKASJON');
    expect(result.current.naturalytelser[16].naturalytelse).toBe('ANNET');
  });

  describe('handleInntekt - endringAarsaker', () => {
    it('should set single endringAarsak when present', async () => {
      const { result } = renderHook(() => useBoundStore((state) => state));

      const { result: resp } = renderHook(() => useKvitteringInit());

      const kvitteringInit = resp.current;

      const kvitteringMedEnkelAarsak = {
        ...mottattKvittering,
        kvitteringNavNo: {
          ...mottattKvittering.kvitteringNavNo,
          skjema: {
            ...mottattKvittering.kvitteringNavNo.skjema,
            inntekt: {
              ...mottattKvittering.kvitteringNavNo.skjema.inntekt,
              endringAarsak: { aarsak: 'Ferie', ferier: [{ fom: '2023-02-24', tom: '2023-03-31' }] },
              endringAarsaker: undefined
            }
          }
        }
      };

      act(() => {
        kvitteringInit(kvitteringMedEnkelAarsak as unknown as KvitteringData);
      });

      expect(result.current.bruttoinntekt.endringAarsaker).toEqual([
        { aarsak: 'Ferie', ferier: [{ fom: parseIsoDate('2023-02-24'), tom: parseIsoDate('2023-03-31') }] }
      ]);
    });

    it('should set multiple endringAarsaker when present', async () => {
      const { result } = renderHook(() => useBoundStore((state) => state));

      const { result: resp } = renderHook(() => useKvitteringInit());

      const kvitteringInit = resp.current;

      const kvitteringMedFlereAarsaker = {
        ...mottattKvittering,
        kvitteringNavNo: {
          ...mottattKvittering.kvitteringNavNo,
          skjema: {
            ...mottattKvittering.kvitteringNavNo.skjema,
            inntekt: {
              ...mottattKvittering.kvitteringNavNo.skjema.inntekt,
              endringAarsak: undefined,
              endringAarsaker: [
                { aarsak: 'Ferie', ferier: [{ fom: '2023-02-24', tom: '2023-03-31' }] },
                { aarsak: 'Permisjon', permisjoner: [{ fom: '2023-02-24', tom: '2023-03-31' }] },
                { aarsak: 'Sykefravaer', sykefravaer: [{ fom: '2023-02-24', tom: '2023-03-31' }] }
              ]
            }
          }
        }
      };

      act(() => {
        kvitteringInit(kvitteringMedFlereAarsaker as unknown as KvitteringData);
      });

      expect(result.current.bruttoinntekt.endringAarsaker).toEqual([
        { aarsak: 'Ferie', ferier: [{ fom: parseIsoDate('2023-02-24'), tom: parseIsoDate('2023-03-31') }] },
        { aarsak: 'Permisjon', permisjoner: [{ fom: parseIsoDate('2023-02-24'), tom: parseIsoDate('2023-03-31') }] },
        { aarsak: 'Sykefravaer', sykefravaer: [{ fom: parseIsoDate('2023-02-24'), tom: parseIsoDate('2023-03-31') }] }
      ]);
    });

    it('should prioritize endringAarsaker over endringAarsak when both present', async () => {
      const { result } = renderHook(() => useBoundStore((state) => state));

      const { result: resp } = renderHook(() => useKvitteringInit());

      const kvitteringInit = resp.current;

      const kvitteringMedBegge = {
        ...mottattKvittering,
        kvitteringNavNo: {
          ...mottattKvittering.kvitteringNavNo,
          skjema: {
            ...mottattKvittering.kvitteringNavNo.skjema,
            inntekt: {
              ...mottattKvittering.kvitteringNavNo.skjema.inntekt,
              endringAarsak: { aarsak: 'Ferie', ferier: [{ fom: '2023-02-24', tom: '2023-03-31' }] },
              endringAarsaker: [
                { aarsak: 'Permisjon', permisjoner: [{ fom: '2023-02-24', tom: '2023-03-31' }] },
                { aarsak: 'Bonus' }
              ]
            }
          }
        }
      };

      act(() => {
        kvitteringInit(kvitteringMedBegge as unknown as KvitteringData);
      });

      expect(result.current.bruttoinntekt.endringAarsaker).toEqual([
        { aarsak: 'Permisjon', permisjoner: [{ fom: parseIsoDate('2023-02-24'), tom: parseIsoDate('2023-03-31') }] },
        { aarsak: 'Bonus' }
      ]);
    });

    it('should not set endringAarsaker when neither is present', async () => {
      const { result } = renderHook(() => useBoundStore((state) => state));

      const { result: resp } = renderHook(() => useKvitteringInit());

      const kvitteringInit = resp.current;

      const kvitteringUtenAarsaker = {
        ...mottattKvittering,
        kvitteringNavNo: {
          ...mottattKvittering.kvitteringNavNo,
          skjema: {
            ...mottattKvittering.kvitteringNavNo.skjema,
            inntekt: {
              ...mottattKvittering.kvitteringNavNo.skjema.inntekt,
              endringAarsak: undefined,
              endringAarsaker: undefined
            }
          }
        }
      };

      const initialAarsaker = result.current.bruttoinntekt.endringAarsaker;

      act(() => {
        kvitteringInit(kvitteringUtenAarsaker as unknown as KvitteringData);
      });

      expect(result.current.bruttoinntekt.endringAarsaker).toEqual(initialAarsaker);
    });

    it('should handle empty endringAarsaker array', async () => {
      const { result } = renderHook(() => useBoundStore((state) => state));

      const { result: resp } = renderHook(() => useKvitteringInit());

      const kvitteringInit = resp.current;

      const kvitteringMedTomArray = {
        ...mottattKvittering,
        kvitteringNavNo: {
          ...mottattKvittering.kvitteringNavNo,
          skjema: {
            ...mottattKvittering.kvitteringNavNo.skjema,
            inntekt: {
              ...mottattKvittering.kvitteringNavNo.skjema.inntekt,
              endringAarsak: undefined,
              endringAarsaker: []
            }
          }
        }
      };

      act(() => {
        kvitteringInit(kvitteringMedTomArray as unknown as KvitteringData);
      });

      expect(result.current.bruttoinntekt.endringAarsaker).toEqual([]);
    });

    it('should handle endringAarsak with Tariffendring type', async () => {
      const { result } = renderHook(() => useBoundStore((state) => state));

      const { result: resp } = renderHook(() => useKvitteringInit());

      const kvitteringInit = resp.current;

      const kvitteringMedTariff = {
        ...mottattKvittering,
        kvitteringNavNo: {
          ...mottattKvittering.kvitteringNavNo,
          skjema: {
            ...mottattKvittering.kvitteringNavNo.skjema,
            inntekt: {
              ...mottattKvittering.kvitteringNavNo.skjema.inntekt,
              endringAarsak: {
                aarsak: 'Tariffendring',
                gjelderFra: '2023-01-01',
                bleKjent: '2023-02-01'
              },
              endringAarsaker: undefined
            }
          }
        }
      };

      act(() => {
        kvitteringInit(kvitteringMedTariff as unknown as KvitteringData);
      });

      expect(result.current.bruttoinntekt.endringAarsaker).toEqual([
        {
          aarsak: 'Tariffendring',
          gjelderFra: parseIsoDate('2023-01-01'),
          bleKjent: parseIsoDate('2023-02-01')
        }
      ]);
    });

    it('should handle endringAarsaker with mixed types', async () => {
      const { result } = renderHook(() => useBoundStore((state) => state));

      const { result: resp } = renderHook(() => useKvitteringInit());

      const kvitteringInit = resp.current;

      const kvitteringMedMiksedeTyper = {
        ...mottattKvittering,
        kvitteringNavNo: {
          ...mottattKvittering.kvitteringNavNo,
          skjema: {
            ...mottattKvittering.kvitteringNavNo.skjema,
            inntekt: {
              ...mottattKvittering.kvitteringNavNo.skjema.inntekt,
              endringAarsak: undefined,
              endringAarsaker: [
                {
                  aarsak: 'Ferie',
                  ferier: [
                    {
                      fom: '2023-02-24',
                      tom: '2023-03-31'
                    }
                  ]
                },
                {
                  aarsak: 'Tariffendring',
                  gjelderFra: '2023-01-01',
                  bleKjent: '2023-02-01'
                },
                {
                  aarsak: 'VarigLoennsendring',
                  gjelderFra: '2023-03-01'
                }
              ]
            }
          }
        }
      };

      act(() => {
        kvitteringInit(kvitteringMedMiksedeTyper as unknown as KvitteringData);
      });

      expect(result.current.bruttoinntekt.endringAarsaker).toEqual([
        {
          aarsak: 'Ferie',
          ferier: [
            {
              fom: parseIsoDate('2023-02-24'),
              tom: parseIsoDate('2023-03-31')
            }
          ]
        },
        {
          aarsak: 'Tariffendring',
          gjelderFra: parseIsoDate('2023-01-01'),
          bleKjent: parseIsoDate('2023-02-01')
        },
        {
          aarsak: 'VarigLoennsendring',
          gjelderFra: parseIsoDate('2023-03-01')
        }
      ]);
    });

    it('should not set endringAarsaker when inntekt is missing', async () => {
      const { result } = renderHook(() => useBoundStore((state) => state));

      const { result: resp } = renderHook(() => useKvitteringInit());

      const kvitteringInit = resp.current;

      const kvitteringUtenInntekt = {
        ...mottattKvittering,
        kvitteringNavNo: {
          ...mottattKvittering.kvitteringNavNo,
          skjema: {
            ...mottattKvittering.kvitteringNavNo.skjema,
            inntekt: undefined
          }
        }
      };

      const initialAarsaker = result.current.bruttoinntekt.endringAarsaker;

      act(() => {
        kvitteringInit(kvitteringUtenInntekt as unknown as KvitteringData);
      });

      expect(result.current.bruttoinntekt.endringAarsaker).toEqual(initialAarsaker);
    });

    it('should not set endringAarsaker when beloep is missing', async () => {
      const { result } = renderHook(() => useBoundStore((state) => state));

      const { result: resp } = renderHook(() => useKvitteringInit());

      const kvitteringInit = resp.current;

      const kvitteringUtenBeloep = {
        ...mottattKvittering,
        kvitteringNavNo: {
          ...mottattKvittering.kvitteringNavNo,
          skjema: {
            ...mottattKvittering.kvitteringNavNo.skjema,
            inntekt: {
              beloep: undefined,
              endringAarsaker: [{ aarsak: 'Ferie' }]
            }
          }
        }
      };

      const initialAarsaker = result.current.bruttoinntekt.endringAarsaker;

      act(() => {
        kvitteringInit(kvitteringUtenBeloep as unknown as KvitteringData);
      });

      expect(result.current.bruttoinntekt.endringAarsaker).toEqual(initialAarsaker);
    });
  });
});
