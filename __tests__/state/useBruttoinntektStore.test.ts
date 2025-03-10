import { act, renderHook, cleanup } from '@testing-library/react';
import useBoundStore from '../../state/useBoundStore';
import { vi } from 'vitest';
import feiltekster from '../../utils/feiltekster';
import { finnAktuelleInntekter, sorterInntekter } from '../../state/useBruttoinntektStore';
import { HistoriskInntekt } from '../../state/state';
import parseIsoDate from '../../utils/parseIsoDate';

const inputInntekt: number = 40000;
const tidligereInntekt: Array<HistoriskInntekt> = [
  { maaned: '2002-02', inntekt: 33000 },
  { maaned: '2002-03', inntekt: 44000 },
  { maaned: '2002-04', inntekt: 55000 },
  { maaned: '2002-05', inntekt: 55000 },
  { maaned: '2002-06', inntekt: 55000 },
  { maaned: '2002-07', inntekt: 55000 },
  { maaned: '2002-08', inntekt: 50000 },
  { maaned: '2002-09', inntekt: 45000 },
  { maaned: '2002-10', inntekt: 55000 }
];

describe('useBoundStore', () => {
  afterEach(() => {
    // You can chose to set the store's state to a default value here.
    vi.resetAllMocks();
    cleanup();
  });

  it('should initialize the data.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    expect(result.current.bruttoinntekt?.bruttoInntekt).toEqual(40000);
    expect(result.current.bruttoinntekt?.manueltKorrigert).toBeFalsy();
    expect(result.current.tidligereInntekt?.length).toBe(3);
  });

  it('should set ny maanedsinntekt.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setNyMaanedsinntektOgRefusjonsbeloep('56000,23');
    });

    expect(result.current.bruttoinntekt?.bruttoInntekt).toBe(56000.23);
  });

  it('should return an error when ny maanedsinntekt = -1.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setNyMaanedsinntektOgRefusjonsbeloep('-1');
    });

    expect(result.current.bruttoinntekt?.bruttoInntekt).toBe(-1);
    expect(result.current.feilmeldinger).toContainEqual({
      felt: 'inntekt.beregnetInntekt',
      text: feiltekster.BRUTTOINNTEKT_MANGLER
    });
  });

  it('should return undefined when ny maanedsinntekt = 0.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setNyMaanedsinntektOgRefusjonsbeloep('0');
    });

    expect(result.current.bruttoinntekt?.bruttoInntekt).toBe(0);
    expect(result.current.feilmeldinger[1]).toBeUndefined();
  });

  it('should return an error when ny maanedsinntekt = 0. Skjema er blankt, ikke preutfylt', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setBareNyMaanedsinntekt('-1');
    });

    expect(result.current.bruttoinntekt?.bruttoInntekt).toBe(-1);
    expect(result.current.feilmeldinger).toContainEqual({
      felt: 'inntekt.beregnetInntekt',
      text: feiltekster.BRUTTOINNTEKT_MANGLER
    });
  });

  it('should setBareNyMaanedsinntekt string', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setBareNyMaanedsinntekt('1234,56');
    });

    expect(result.current.bruttoinntekt?.bruttoInntekt).toBe(1234.56);
    expect(result.current.feilmeldinger.length).toBe(0);
  });

  it('should setBareNyMaanedsinntekt number', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setBareNyMaanedsinntekt(1234.56);
    });

    expect(result.current.bruttoinntekt?.bruttoInntekt).toBe(1234.56);
    expect(result.current.feilmeldinger.length).toBe(0);
  });

  it('should tilbakestille endringsaarsak', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setEndringsaarsaker([{ aarsak: 'Bonus' }]);
      result.current.setNyMaanedsinntektOgRefusjonsbeloep('56000,23');
    });

    act(() => {
      result.current.tilbakestillMaanedsinntekt();
    });

    expect(result.current.bruttoinntekt?.endringAarsak?.aarsak).toBeUndefined();
    expect(result.current.bruttoinntekt?.manueltKorrigert).toBeFalsy();
    expect(result.current.bruttoinntekt?.bruttoInntekt).toBe(40000);
  });

  it('should find a liste of 3 current inntekter', () => {
    const inntekter = finnAktuelleInntekter(tidligereInntekt, new Date(2002, 9, 9));

    const expected = [
      {
        inntekt: 45000,
        maaned: '2002-09'
      },
      {
        inntekt: 50000,
        maaned: '2002-08'
      },
      {
        inntekt: 55000,
        maaned: '2002-07'
      }
    ];

    expect(inntekter).toEqual(expected);
  });

  it('should find an empty liste when there are no current inntekter', () => {
    const inntekter = finnAktuelleInntekter(undefined, new Date(2002, 9, 9));

    expect(inntekter).toEqual([]);
  });

  it('should find an empty liste when there are no current inntekter', () => {
    const inntekter = finnAktuelleInntekter([], new Date(2002, 9, 9));

    expect(inntekter).toEqual([]);
  });

  it('should find a liste of no current inntekter as they are too old', () => {
    const inntekter = finnAktuelleInntekter(tidligereInntekt, new Date(2003, 9, 9));

    expect(inntekter).toEqual([]);
  });

  it('should find a liste of 2 current inntekter', () => {
    const inntekter = finnAktuelleInntekter(tidligereInntekt, new Date(2002, 3, 9));

    const expected = [
      {
        inntekt: 44000,
        maaned: '2002-03'
      },
      {
        inntekt: 33000,
        maaned: '2002-02'
      }
    ];

    expect(inntekter).toEqual(expected);
  });

  it.skip('should rekalkulerBruttoinntekt', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.rekalkulerBruttoinntekt(new Date(2002, 11, 11));
    });

    expect(result.current.bruttoinntekt?.endrinAarsak).toBeUndefined();
    expect(result.current.bruttoinntekt?.manueltKorrigert).toBeFalsy();
    expect(result.current.bruttoinntekt?.bruttoInntekt).toBe(50000);
    expect(result.current.tidligereInntekt).toEqual([
      {
        inntekt: 55000,
        maaned: '2002-10'
      },
      {
        inntekt: 45000,
        maaned: '2002-09'
      },
      {
        inntekt: 50000,
        maaned: '2002-08'
      }
    ]);
  });

  it('should setEndringAarsakGjelderFra', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setEndringAarsakGjelderFra(new Date(2002, 10, 11));
    });

    expect(result.current.bruttoinntekt.endringAarsak.gjelderFra).toEqual(parseIsoDate('2002-11-11'));
  });

  it('should setEndringAarsakGjelderFra', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setEndringAarsakGjelderFra(new Date(2002, 10, 11));
    });

    expect(result.current.bruttoinntekt.endringAarsak.gjelderFra).toEqual(parseIsoDate('2002-11-11'));
  });

  it('should setEndringAarsakBleKjent', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setEndringAarsakBleKjent(new Date(2002, 10, 11));
    });

    expect(result.current.bruttoinntekt.endringAarsak.bleKjent).toEqual(parseIsoDate('2002-11-11'));
  });

  it('should setEndringAarsakGjelderFra, 2', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setEndringAarsakGjelderFra(new Date(2002, 10, 11));
    });

    expect(result.current.bruttoinntekt.endringAarsak.gjelderFra).toEqual(parseIsoDate('2002-11-11'));
  });

  it('should setEndringAarsakGjelderFra, 3', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setEndringAarsakGjelderFra(new Date(2002, 10, 11));
    });

    expect(result.current.bruttoinntekt.endringAarsak.gjelderFra).toEqual(parseIsoDate('2002-11-11'));
  });

  it('should setTidligereInntekter', () => {
    const tidligereInntekt: Array<HistoriskInntekt> = [
      { maaned: '2002-02', inntekt: 33000 },
      { maaned: '2002-03', inntekt: 44000 },
      { maaned: '2002-04', inntekt: 55000 }
    ];
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.setTidligereInntekter(tidligereInntekt);
    });

    expect(result.current.tidligereInntekt).toEqual([
      {
        inntekt: 33000,
        maaned: '2002-02'
      },
      {
        inntekt: 44000,
        maaned: '2002-03'
      },
      {
        inntekt: 55000,
        maaned: '2002-04'
      }
    ]);
  });

  it('should return 0 when maaned are equal', () => {
    const retval = sorterInntekter({ maaned: '2002-01', inntekt: 0 }, { maaned: '2002-01', inntekt: 0 });

    expect(retval).toBe(0);
  });

  it('should return -1 when first maaned is bigger than last', () => {
    const retval = sorterInntekter({ maaned: '2002-02', inntekt: 0 }, { maaned: '2002-01', inntekt: 0 });

    expect(retval).toBe(-1);
  });

  it('should return 1 when first maaned is smaller than last', () => {
    const retval = sorterInntekter({ maaned: '2002-02', inntekt: 0 }, { maaned: '2002-03', inntekt: 0 });

    expect(retval).toBe(1);
  });

  it('should setEndringAarsak', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setEndringAarsak({
        aarsak: 'Ferie',
        ferier: [{ fom: new Date(2002, 10, 11), tom: new Date(2002, 10, 11) }]
      });
    });

    expect(result.current.bruttoinntekt.endringAarsak?.aarsak).toBe('Ferie');
    expect(result.current.bruttoinntekt.endringAarsak?.ferier).toEqual([
      { fom: parseIsoDate('2002-11-11'), tom: parseIsoDate('2002-11-11') }
    ]);
  });

  it('should setEndringAarsak with date as strings', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setEndringAarsak({
        aarsak: 'Ferie',
        ferier: [{ fom: '2002-11-11', tom: '2002-11-11' }]
      });
    });

    expect(result.current.bruttoinntekt.endringAarsak?.aarsak).toBe('Ferie');
    expect(result.current.bruttoinntekt.endringAarsak?.ferier).toEqual([
      { fom: parseIsoDate('2002-11-11'), tom: parseIsoDate('2002-11-11') }
    ]);
  });

  it('should setEndringAarsak', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setEndringAarsak({
        aarsak: 'Ferie',
        ferier: [{ fom: new Date(2002, 10, 11), tom: new Date(2002, 10, 11) }]
      });
    });

    expect(result.current.bruttoinntekt.endringAarsak?.aarsak).toBe('Ferie');
    expect(result.current.bruttoinntekt.endringAarsak?.ferier).toEqual([
      { fom: parseIsoDate('2002-11-11'), tom: parseIsoDate('2002-11-11') }
    ]);
  });

  it('should setEndringAarsak with date as strings', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setEndringAarsak({
        aarsak: 'Ferie',
        ferier: [{ fom: '2002-11-11', tom: '2002-11-11' }]
      });
    });

    expect(result.current.bruttoinntekt.endringAarsak?.aarsak).toBe('Ferie');
    expect(result.current.bruttoinntekt.endringAarsak?.ferier).toEqual([
      { fom: parseIsoDate('2002-11-11'), tom: parseIsoDate('2002-11-11') }
    ]);
  });

  it('should setEndringsaarsaker', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setEndringsaarsaker([
        {
          aarsak: 'Ferie',
          ferier: [{ fom: new Date(2002, 10, 11), tom: new Date(2002, 10, 11) }]
        },
        {
          aarsak: 'NyStilling',
          gjelderFra: new Date(2002, 10, 11)
        },
        {
          aarsak: 'Tariffendring',
          bleKjent: new Date(2002, 10, 11),
          gjelderFra: new Date(2002, 10, 11)
        },
        {
          aarsak: 'Sykefravaer',
          sykefravaer: [{ fom: new Date(2002, 10, 11), tom: new Date(2002, 10, 11) }]
        },
        {
          aarsak: 'Permittering',
          permitteringer: [{ fom: new Date(2002, 10, 11), tom: new Date(2002, 10, 11) }]
        },
        {
          aarsak: 'Permisjon',
          permisjoner: [{ fom: new Date(2002, 10, 11), tom: new Date(2002, 10, 11) }]
        }
      ]);
    });
    expect(result.current.bruttoinntekt.endringsaarsaker).toEqual([
      {
        aarsak: 'Ferie',
        ferier: [
          {
            fom: parseIsoDate('2002-11-11'),
            tom: parseIsoDate('2002-11-11')
          }
        ]
      },
      {
        aarsak: 'NyStilling',
        gjelderFra: parseIsoDate('2002-11-11')
      },
      {
        aarsak: 'Tariffendring',
        bleKjent: parseIsoDate('2002-11-11'),
        gjelderFra: parseIsoDate('2002-11-11')
      },
      {
        aarsak: 'Sykefravaer',
        sykefravaer: [
          {
            fom: parseIsoDate('2002-11-11'),
            tom: parseIsoDate('2002-11-11')
          }
        ]
      },
      {
        aarsak: 'Permittering',
        permitteringer: [
          {
            fom: parseIsoDate('2002-11-11'),
            tom: parseIsoDate('2002-11-11')
          }
        ]
      },
      {
        aarsak: 'Permisjon',
        permisjoner: [
          {
            fom: parseIsoDate('2002-11-11'),
            tom: parseIsoDate('2002-11-11')
          }
        ]
      }
    ]);
  });

  it('should setEndringsaarsaker with date as strings', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setEndringsaarsaker([
        {
          aarsak: 'Ferie',
          ferier: [{ fom: '2002-11-11', tom: '2002-11-11' }]
        },
        {
          aarsak: 'NyStilling',
          gjelderFra: '2002-11-11'
        },
        {
          aarsak: 'Tariffendring',
          bleKjent: '2002-11-11',
          gjelderFra: '2002-11-11'
        },
        {
          aarsak: 'Sykefravaer',
          sykefravaer: [{ fom: '2002-11-11', tom: '2002-11-11' }]
        },
        {
          aarsak: 'Permittering',
          permitteringer: [{ fom: '2002-11-11', tom: '2002-11-11' }]
        },
        {
          aarsak: 'Permisjon',
          permisjoner: [{ fom: '2002-11-11', tom: '2002-11-11' }]
        }
      ]);
    });
    expect(result.current.bruttoinntekt.endringsaarsaker).toEqual([
      {
        aarsak: 'Ferie',
        ferier: [
          {
            fom: parseIsoDate('2002-11-11'),
            tom: parseIsoDate('2002-11-11')
          }
        ]
      },
      {
        aarsak: 'NyStilling',
        gjelderFra: parseIsoDate('2002-11-11')
      },
      {
        aarsak: 'Tariffendring',
        bleKjent: parseIsoDate('2002-11-11'),
        gjelderFra: parseIsoDate('2002-11-11')
      },
      {
        aarsak: 'Sykefravaer',
        sykefravaer: [
          {
            fom: parseIsoDate('2002-11-11'),
            tom: parseIsoDate('2002-11-11')
          }
        ]
      },
      {
        aarsak: 'Permittering',
        permitteringer: [
          {
            fom: parseIsoDate('2002-11-11'),
            tom: parseIsoDate('2002-11-11')
          }
        ]
      },
      {
        aarsak: 'Permisjon',
        permisjoner: [
          {
            fom: parseIsoDate('2002-11-11'),
            tom: parseIsoDate('2002-11-11')
          }
        ]
      }
    ]);
  });

  it('should slettBruttoinntekt.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    expect(result.current.bruttoinntekt?.bruttoInntekt).toEqual(40000);
    expect(result.current.bruttoinntekt?.manueltKorrigert).toBeFalsy();
    expect(result.current.tidligereInntekt?.length).toBe(3);

    act(() => {
      result.current.slettBruttoinntekt();
    });

    expect(result.current.bruttoinntekt?.bruttoInntekt).toBeUndefined();
    expect(result.current.bruttoinntekt?.manueltKorrigert).toBeFalsy();
    expect(result.current.bruttoinntekt?.endringAarsak).toBeUndefined();
  });
});
