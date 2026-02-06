import { act, renderHook, cleanup } from '@testing-library/react';
import useBoundStore from '../../state/useBoundStore';
import { vi } from 'vitest';
import feiltekster from '../../utils/feiltekster';
import { finnAktuelleInntekter } from '../../state/useBruttoinntektStore';
import parseIsoDate from '../../utils/parseIsoDate';
import { HistoriskInntekt } from '../../schema/HistoriskInntektSchema';
import { enableMapSet } from 'immer';
enableMapSet();

const inputInntekt: number = 40000;
const tidligereInntekt: HistoriskInntekt = {
  '2002-02': 33000,
  '2002-03': 44000,
  '2002-04': 55000,
  '2002-05': 55000,
  '2002-06': 55000,
  '2002-07': 55000,
  '2002-08': 50000,
  '2002-09': 45000,
  '2002-10': 55000,
  '2002-11': 50000
};

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
    expect(result.current.tidligereInntekt?.size).toBe(3);
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
      result.current.setEndringAarsaker([{ aarsak: 'Bonus' }]);
      result.current.setBareNyMaanedsinntekt('56000,23');
    });

    act(() => {
      result.current.tilbakestillMaanedsinntekt();
    });

    expect(result.current.bruttoinntekt?.endringAarsaker?.[0]?.aarsak).toBe('Bonus');
    expect(result.current.bruttoinntekt?.manueltKorrigert).toBeFalsy();
    expect(result.current.bruttoinntekt?.bruttoInntekt).toBe(40000);
  });

  it('should find a liste of 3 current inntekter', () => {
    const inntekter = finnAktuelleInntekter(tidligereInntekt, new Date(2002, 9, 9));

    const expected = new Map([
      ['2002-09', 45000],
      ['2002-08', 50000],
      ['2002-07', 55000]
    ]);

    expect(inntekter).toEqual(expected);
  });

  it('should find an empty liste when there are no current inntekter', () => {
    const inntekter = finnAktuelleInntekter(null, new Date(2002, 9, 9));

    expect(inntekter).toEqual(new Map([]));
  });

  it('should find an empty liste when there are no current inntekter', () => {
    const inntekter = finnAktuelleInntekter({}, new Date(2002, 9, 9));

    expect(inntekter).toEqual(new Map([]));
  });

  it('should find a liste of no current inntekter as they are too old', () => {
    const inntekter = finnAktuelleInntekter(tidligereInntekt, new Date(2003, 9, 9));

    expect(inntekter).toEqual(new Map([]));
  });

  it('should find a liste of 2 current inntekter', () => {
    const inntekter = finnAktuelleInntekter(tidligereInntekt, new Date(2002, 3, 9));

    const expected = new Map([
      ['2002-03', 44000],
      ['2002-02', 33000]
    ]);

    expect(inntekter).toEqual(expected);
  });

  it('should rekalkulerBruttoinntekt', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setPaakrevdeOpplysninger(['arbeidsgiverperiode', 'inntekt', 'refusjon']);
    });

    act(() => {
      result.current.rekalkulerBruttoinntekt(new Date(2002, 11, 11));
    });

    expect(result.current.bruttoinntekt?.endringAarsaker).toBeUndefined();
    expect(result.current.bruttoinntekt?.manueltKorrigert).toBeFalsy();
    expect(result.current.bruttoinntekt?.bruttoInntekt).toBe(50000);
    expect(result.current.tidligereInntekt).toEqual(
      new Map([
        ['2002-11', 50000],
        ['2002-10', 55000],
        ['2002-09', 45000]
      ])
    );
  });

  it('should setTidligereInntekter', () => {
    const tidligereInntektData: HistoriskInntekt = {
      '2002-02': 33000,
      '2002-03': 44000,
      '2002-04': 55000
    };
    const { result } = renderHook(() => useBoundStore((state) => state));

    const inntekter = new Map([
      ...Object.entries(tidligereInntektData),
      ['2002-09', 45000],
      ['2002-10', 55000],
      ['2002-11', 50000]
    ]);

    act(() => {
      result.current.setTidligereInntekter(tidligereInntektData);
    });

    expect(result.current.tidligereInntekt).toEqual(inntekter);
  });

  it('should setEndringAarsak', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setEndringAarsaker([
        {
          aarsak: 'Ferie',
          ferier: [{ fom: new Date(2002, 10, 11), tom: new Date(2002, 10, 11) }]
        }
      ]);
    });

    expect(result.current.bruttoinntekt.endringAarsaker?.[0].aarsak).toBe('Ferie');
    const endringAarsak1 = result.current.bruttoinntekt.endringAarsaker?.[0];
    expect(endringAarsak1?.aarsak === 'Ferie' && endringAarsak1.ferier).toEqual([
      { fom: parseIsoDate('2002-11-11'), tom: parseIsoDate('2002-11-11') }
    ]);
  });

  it('should setEndringAarsak with date as strings', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setEndringAarsaker([
        {
          aarsak: 'Ferie',
          ferier: [{ fom: '2002-11-11', tom: '2002-11-11' }]
        }
      ]);
    });

    expect(result.current.bruttoinntekt.endringAarsaker?.[0].aarsak).toBe('Ferie');
    const endringAarsak2 = result.current.bruttoinntekt.endringAarsaker?.[0];
    expect(endringAarsak2?.aarsak === 'Ferie' && endringAarsak2.ferier).toEqual([
      { fom: parseIsoDate('2002-11-11'), tom: parseIsoDate('2002-11-11') }
    ]);
  });

  it('should setEndringAarsak', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setEndringAarsaker([
        {
          aarsak: 'Ferie',
          ferier: [{ fom: new Date(2002, 10, 11), tom: new Date(2002, 10, 11) }]
        }
      ]);
    });

    expect(result.current.bruttoinntekt.endringAarsaker?.[0]?.aarsak).toBe('Ferie');
    const endringAarsak3 = result.current.bruttoinntekt.endringAarsaker?.[0];
    expect(endringAarsak3?.aarsak === 'Ferie' && endringAarsak3.ferier).toEqual([
      { fom: parseIsoDate('2002-11-11'), tom: parseIsoDate('2002-11-11') }
    ]);
  });

  it('should setEndringAarsaker', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setEndringAarsaker([
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
    expect(result.current.bruttoinntekt.endringAarsaker).toEqual([
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

  it('should setEndringAarsaker with date as strings', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.initBruttoinntekt(inputInntekt, tidligereInntekt, new Date(2002, 10, 11));
    });

    act(() => {
      result.current.setEndringAarsaker([
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
    expect(result.current.bruttoinntekt.endringAarsaker).toEqual([
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
});

describe('finnAktuelleInntekter sortering', () => {
  it('should return inntekter sorted in descending order by date', () => {
    const tidligereInntekt: HistoriskInntekt = {
      '2023-01': 1000,
      '2023-03': 3000,
      '2023-02': 2000
    };
    const bestemmendeFravaersdag = new Date(2023, 3, 15); // April 2023

    const result = finnAktuelleInntekter(tidligereInntekt, bestemmendeFravaersdag);
    const keys = Array.from(result.keys());

    expect(keys).toEqual(['2023-03', '2023-02', '2023-01']);
  });

  it('should sort correctly across year boundaries', () => {
    const tidligereInntekt: HistoriskInntekt = {
      '2022-11': 1000,
      '2023-01': 3000,
      '2022-12': 2000
    };
    const bestemmendeFravaersdag = new Date(2023, 1, 15); // Februar 2023

    const result = finnAktuelleInntekter(tidligereInntekt, bestemmendeFravaersdag);
    const keys = Array.from(result.keys());

    expect(keys).toEqual(['2023-01', '2022-12', '2022-11']);
  });

  it('should handle null values and still sort correctly', () => {
    const tidligereInntekt: HistoriskInntekt = {
      '2023-01': null,
      '2023-03': 3000,
      '2023-02': null
    };
    const bestemmendeFravaersdag = new Date(2023, 3, 15); // April 2023

    const result = finnAktuelleInntekter(tidligereInntekt, bestemmendeFravaersdag);
    const keys = Array.from(result.keys());

    expect(keys).toEqual(['2023-03', '2023-02', '2023-01']);
  });

  it('should return max 3 inntekter sorted by date', () => {
    const tidligereInntekt: HistoriskInntekt = {
      '2023-01': 1000,
      '2023-02': 2000,
      '2023-03': 3000,
      '2023-04': 4000,
      '2023-05': 5000
    };
    const bestemmendeFravaersdag = new Date(2023, 5, 15); // Juni 2023

    const result = finnAktuelleInntekter(tidligereInntekt, bestemmendeFravaersdag);
    const keys = Array.from(result.keys());

    expect(keys).toEqual(['2023-05', '2023-04', '2023-03']);
    expect(result.size).toBe(3);
  });
});
