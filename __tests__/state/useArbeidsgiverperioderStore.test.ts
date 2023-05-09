import { vi } from 'vitest';
import { act, renderHook, cleanup } from '@testing-library/react';
import useBoundStore from '../../state/useBoundStore';
import { MottattPeriode } from '../../state/MottattData';
import { Periode } from '../../state/state';
import { nanoid } from 'nanoid';
import { PeriodeParam } from '../../components/Bruttoinntekt/Periodevelger';

vi.mock('nanoid');

const arbeidsgiverperioder: Array<MottattPeriode> = [
  { fom: '2022-06-06', tom: '2022-07-06' },
  { fom: '2022-08-06', tom: '2022-09-06' },
  { fom: '2022-10-06', tom: '2022-11-06' }
];

const initialState = useBoundStore.getState();

describe('useBoundStore', () => {
  beforeEach(() => {
    useBoundStore.setState(initialState, true);
  });

  afterEach(() => {
    // You can chose to set the store's state to a default value here.
    vi.resetAllMocks();
    cleanup();
  });

  it('should set bestemmende fraværsdag.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.setBestemmendeFravaersdag(new Date(2022, 5, 5));
    });

    expect(result.current.bestemmendeFravaersdag).toEqual(new Date(2022, 5, 5));
  });

  it('should set the arbeidsgiver periode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    const datoSpenn: Periode[] = [
      {
        fom: new Date(2022, 4, 14),
        tom: new Date(2022, 5, 15),
        id: '1'
      }
    ];

    act(() => {
      result.current.setArbeidsgiverperioder(datoSpenn);
    });

    expect(result.current.arbeidsgiverperioder).toEqual(datoSpenn);
  });

  it('should add empty arbeidsgiver periode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    nanoid.mockReturnValue('2');

    const datoSpenn: Periode[] = [
      {
        fom: new Date(2022, 4, 14),
        tom: new Date(2022, 5, 15),
        id: '1'
      }
    ];

    const expected: Periode[] = [
      {
        fom: new Date(2022, 4, 14),
        tom: new Date(2022, 5, 15),
        id: '1'
      },
      {
        id: '2'
      }
    ];

    act(() => {
      result.current.setArbeidsgiverperioder(datoSpenn);
    });

    act(() => {
      result.current.leggTilArbeidsgiverperiode();
    });

    expect(result.current.arbeidsgiverperioder).toEqual(expected);
  });

  it.skip('should delete a arbeidsgiver periode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    // nanoid.mockReturnValue('2');

    const datoSpenn: Periode[] = [
      {
        fom: new Date(2022, 4, 14),
        tom: new Date(2022, 5, 15),
        id: '1'
      },
      {
        fom: new Date(2022, 6, 14),
        tom: new Date(2022, 7, 15),
        id: '2'
      }
    ];

    const expected: Periode[] = [
      {
        fom: new Date(2022, 4, 14),
        tom: new Date(2022, 5, 15),
        id: '1'
      }
    ];

    act(() => {
      result.current.setArbeidsgiverperioder(datoSpenn);
    });

    expect(result.current.arbeidsgiverperioder).toEqual(datoSpenn);

    act(() => {
      result.current.slettArbeidsgiverperiode('2');
    });

    expect(result.current.arbeidsgiverperioder).toEqual(expected);
  });

  it.skip('should update a arbeidsgiver periode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    // nanoid.mockReturnValue('2');

    const datoSpenn: Periode[] = [
      {
        fom: new Date(2022, 4, 14),
        tom: new Date(2022, 5, 15),
        id: '1'
      },
      {
        fom: new Date(2022, 6, 14),
        tom: new Date(2022, 7, 15),
        id: '2'
      }
    ];

    const expected: Periode[] = [
      {
        fom: new Date(2022, 4, 14),
        tom: new Date(2022, 5, 15),
        id: '1'
      },
      {
        fom: new Date(2022, 8, 14),
        tom: new Date(2022, 9, 15),
        id: '2'
      }
    ];

    act(() => {
      result.current.setArbeidsgiverperioder(datoSpenn);
    });

    expect(result.current.arbeidsgiverperioder).toEqual(datoSpenn);

    act(() => {
      result.current.setArbeidsgiverperiodeDato(
        {
          fom: new Date(2022, 8, 14),
          tom: new Date(2022, 9, 15)
        },
        '2'
      );
    });

    expect(result.current.arbeidsgiverperioder).toEqual(expected);
  });

  it('should set endretArbeidsgiverperiode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.setEndreArbeidsgiverperiode(true);
    });

    expect(result.current.endretArbeidsgiverperiode).toBeTruthy();
  });

  it('should set endringsbegrunnelse.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    act(() => {
      result.current.setEndringsbegrunnelse('Begrunnelse!');
    });

    expect(result.current.endringsbegrunnelse).toBe('Begrunnelse!');
  });

  it('should init Arbeidsgiverperiode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    nanoid.mockReturnValueOnce('1').mockReturnValueOnce('2');

    const mottattArbeidsgiverperiode: Array<MottattPeriode> = [
      {
        fom: '2022-10-01',
        tom: '2022-10-05'
      },
      {
        fom: '2022-10-10',
        tom: '2022-10-15'
      }
    ];

    act(() => {
      result.current.initArbeidsgiverperioder(mottattArbeidsgiverperiode);
    });

    expect(result.current.arbeidsgiverperioder).toEqual([
      {
        fom: new Date(2022, 9, 1),
        id: '1',
        tom: new Date(2022, 9, 5)
      },
      {
        fom: new Date(2022, 9, 10),
        id: '2',
        tom: new Date(2022, 9, 15)
      }
    ]);
  });

  it('should init Arbeidsgiverperiode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    nanoid.mockReturnValueOnce('1').mockReturnValueOnce('2');

    const mottattArbeidsgiverperiode: Array<MottattPeriode> = [
      {
        fom: '2022-10-01',
        tom: '2022-10-05'
      },
      {
        fom: '2022-10-10',
        tom: '2022-10-15'
      }
    ];

    act(() => {
      result.current.initArbeidsgiverperioder(mottattArbeidsgiverperiode);
    });

    expect(result.current.arbeidsgiverperioder).toEqual([
      {
        fom: new Date(2022, 9, 1),
        id: '1',
        tom: new Date(2022, 9, 5)
      },
      {
        fom: new Date(2022, 9, 10),
        id: '2',
        tom: new Date(2022, 9, 15)
      }
    ]);

    it('should delete an arbeidsgiverperiode for a given ID.', () => {
      const { result } = renderHook(() => useBoundStore((state) => state));

      nanoid.mockReturnValueOnce('1').mockReturnValueOnce('2');

      const mottattArbeidsgiverperiode: Array<MottattPeriode> = [
        {
          fom: '2022-10-01',
          tom: '2022-10-05'
        },
        {
          fom: '2022-10-10',
          tom: '2022-10-15'
        }
      ];

      act(() => {
        result.current.initArbeidsgiverperioder(mottattArbeidsgiverperiode);
      });

      expect(result.current.arbeidsgiverperioder).toEqual([
        {
          fom: new Date(2022, 9, 1),
          id: '1',
          tom: new Date(2022, 9, 5)
        },
        {
          fom: new Date(2022, 9, 10),
          id: '2',
          tom: new Date(2022, 9, 15)
        }
      ]);

      act(() => {
        result.current.slettArbeidsgiverperiode('2');
      });

      expect(result.current.arbeidsgiverperioder).toEqual([
        {
          fom: new Date(2022, 9, 1),
          id: '1',
          tom: new Date(2022, 9, 5)
        }
      ]);
    });

    it('should reset Arbeidsgiverperiode to its initial value.', () => {
      const { result } = renderHook(() => useBoundStore((state) => state));

      nanoid.mockReturnValueOnce('1').mockReturnValueOnce('2');

      const mottattArbeidsgiverperiode: Array<MottattPeriode> = [
        {
          fom: '2022-10-01',
          tom: '2022-10-05'
        },
        {
          fom: '2022-10-10',
          tom: '2022-10-15'
        }
      ];

      act(() => {
        result.current.initArbeidsgiverperioder(mottattArbeidsgiverperiode);
      });

      expect(result.current.arbeidsgiverperioder).toEqual([
        {
          fom: new Date(2022, 9, 1),
          id: '1',
          tom: new Date(2022, 9, 5)
        },
        {
          fom: new Date(2022, 9, 10),
          id: '2',
          tom: new Date(2022, 9, 15)
        }
      ]);

      act(() => {
        result.current.slettArbeidsgiverperiode('2');
      });

      expect(result.current.arbeidsgiverperioder).toEqual([
        {
          fom: new Date(2022, 9, 1),
          id: '1',
          tom: new Date(2022, 9, 5)
        }
      ]);

      act(() => {
        result.current.tilbakestillArbeidsgiverperiode();
      });

      expect(result.current.arbeidsgiverperioder).toEqual([
        {
          fom: new Date(2022, 9, 1),
          id: '1',
          tom: new Date(2022, 9, 5)
        },
        {
          fom: new Date(2022, 9, 10),
          id: '2',
          tom: new Date(2022, 9, 15)
        }
      ]);
    });

    it('should set the date for a arbeidsgiverperiode.', () => {
      const { result } = renderHook(() => useBoundStore((state) => state));

      nanoid.mockReturnValueOnce('1').mockReturnValueOnce('2');

      const mottattArbeidsgiverperiode: Array<MottattPeriode> = [
        {
          fom: '2022-10-01',
          tom: '2022-10-05'
        },
        {
          fom: '2022-10-10',
          tom: '2022-10-15'
        }
      ];

      act(() => {
        result.current.initArbeidsgiverperioder(mottattArbeidsgiverperiode);
      });

      expect(result.current.arbeidsgiverperioder).toEqual([
        {
          fom: new Date(2022, 9, 1),
          id: '1',
          tom: new Date(2022, 9, 5)
        },
        {
          fom: new Date(2022, 9, 10),
          id: '2',
          tom: new Date(2022, 9, 15)
        }
      ]);

      const PeriodeParam: PeriodeParam = {
        fom: new Date(2022, 10, 1),
        tom: new Date(2022, 10, 4)
      };

      act(() => {
        result.current.setArbeidsgiverperiodeDato(PeriodeParam, '2');
      });

      expect(result.current.arbeidsgiverperioder).toEqual([
        {
          fom: new Date(2022, 9, 1),
          id: '1',
          tom: new Date(2022, 9, 5)
        },
        {
          fom: new Date(2022, 10, 1),
          id: '2',
          tom: new Date(2022, 10, 4)
        }
      ]);
    });

    it('should set the date for a arbeidsgiverperiode.', () => {
      const { result } = renderHook(() => useBoundStore((state) => state));

      nanoid.mockReturnValueOnce('1').mockReturnValueOnce('2');

      const mottattArbeidsgiverperiode: Array<MottattPeriode> = [
        {
          fom: '2022-10-03',
          tom: '2022-10-05'
        },
        {
          fom: '2022-10-10',
          tom: '2022-10-15'
        }
      ];

      const mottattFravaer: Array<MottattPeriode> = [
        {
          fom: '2022-10-01',
          tom: '2022-10-05'
        },
        {
          fom: '2022-10-10',
          tom: '2022-10-15'
        }
      ];

      act(() => {
        result.current.initArbeidsgiverperioder(mottattArbeidsgiverperiode);
      });

      act(() => {
        result.current.initFravaersperiode(mottattFravaer);
      });

      expect(result.current.arbeidsgiverperioder).toEqual([
        {
          fom: new Date(2022, 9, 3),
          id: '1',
          tom: new Date(2022, 9, 5)
        },
        {
          fom: new Date(2022, 9, 10),
          id: '2',
          tom: new Date(2022, 9, 15)
        }
      ]);

      act(() => {
        result.current.tilbakestillArbeidsgiverperiode();
      });

      expect(result.current.arbeidsgiverperioder).toEqual([
        {
          fom: new Date(2022, 9, 1),
          id: '1',
          tom: new Date(2022, 9, 5)
        },
        {
          fom: new Date(2022, 10, 10),
          id: '2',
          tom: new Date(2022, 10, 15)
        }
      ]);
    });

    it('should set the date for a arbeidsgiverperiode uten andre perioder.', () => {
      const { result } = renderHook(() => useBoundStore((state) => state));

      nanoid.mockReturnValueOnce('1').mockReturnValueOnce('2');

      const mottattArbeidsgiverperiode: Array<MottattPeriode> = [
        {
          fom: '2022-10-03',
          tom: '2022-10-05'
        },
        {
          fom: '2022-10-10',
          tom: '2022-10-15'
        }
      ];

      act(() => {
        result.current.initArbeidsgiverperioder(mottattArbeidsgiverperiode);
      });

      act(() => {
        result.current.initFravaersperiode(mottattFravaer);
      });

      expect(result.current.arbeidsgiverperioder).toEqual([
        {
          fom: new Date(2022, 9, 3),
          id: '1',
          tom: new Date(2022, 9, 5)
        },
        {
          fom: new Date(2022, 9, 10),
          id: '2',
          tom: new Date(2022, 9, 15)
        }
      ]);

      act(() => {
        result.current.tilbakestillArbeidsgiverperiode();
      });

      expect(result.current.arbeidsgiverperioder).toEqual([
        {
          fom: new Date(2022, 9, 3),
          id: '1',
          tom: new Date(2022, 9, 5)
        },
        {
          fom: new Date(2022, 10, 10),
          id: '2',
          tom: new Date(2022, 10, 15)
        }
      ]);
    });

    it('should set the har blitt endret flag.', () => {
      const { result } = renderHook(() => useBoundStore((state) => state));

      nanoid.mockReturnValueOnce('1').mockReturnValueOnce('2');

      const mottattArbeidsgiverperiode: Array<MottattPeriode> = [
        {
          fom: '2022-10-03',
          tom: '2022-10-05'
        },
        {
          fom: '2022-10-10',
          tom: '2022-10-15'
        }
      ];

      const mottattFravaer: Array<MottattPeriode> = [
        {
          fom: '2022-10-01',
          tom: '2022-10-05'
        },
        {
          fom: '2022-10-10',
          tom: '2022-10-15'
        }
      ];

      act(() => {
        result.current.initArbeidsgiverperioder(mottattArbeidsgiverperiode);
      });

      act(() => {
        result.current.initFravaersperiode(mottattFravaer);
      });

      expect(result.current.arbeidsgiverperioder).toEqual([
        {
          fom: new Date(2022, 9, 3),
          id: '1',
          tom: new Date(2022, 9, 5)
        },
        {
          fom: new Date(2022, 9, 10),
          id: '2',
          tom: new Date(2022, 9, 15)
        }
      ]);

      expect(result.current.endretArbeidsgiverperiode).toBeFalsy();

      act(() => {
        result.current.harArbeidsgiverperiodenBlittEndret();
      });

      expect(result.current.endretArbeidsgiverperiode).toTruthy();
    });

    it('should not set the har blitt endret flag.', () => {
      const { result } = renderHook(() => useBoundStore((state) => state));

      nanoid.mockReturnValueOnce('1').mockReturnValueOnce('2');

      const mottattArbeidsgiverperiode: Array<MottattPeriode> = [
        {
          fom: '2022-10-01',
          tom: '2022-10-05'
        },
        {
          fom: '2022-10-10',
          tom: '2022-10-15'
        }
      ];

      const mottattFravaer: Array<MottattPeriode> = [
        {
          fom: '2022-10-01',
          tom: '2022-10-05'
        },
        {
          fom: '2022-10-10',
          tom: '2022-10-15'
        }
      ];

      act(() => {
        result.current.initArbeidsgiverperioder(mottattArbeidsgiverperiode);
      });

      act(() => {
        result.current.initFravaersperiode(mottattFravaer);
      });

      expect(result.current.arbeidsgiverperioder).toEqual([
        {
          fom: new Date(2022, 9, 3),
          id: '1',
          tom: new Date(2022, 9, 5)
        },
        {
          fom: new Date(2022, 9, 10),
          id: '2',
          tom: new Date(2022, 9, 15)
        }
      ]);

      expect(result.current.endretArbeidsgiverperiode).toBeFalsy();

      act(() => {
        result.current.harArbeidsgiverperiodenBlittEndret();
      });

      expect(result.current.endretArbeidsgiverperiode).toBeFalsy();
    });
  });

  it('should delete a periode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    nanoid.mockReturnValueOnce('1').mockReturnValueOnce('2');

    const mottattArbeidsgiverperiode: Array<MottattPeriode> = [
      {
        fom: '2022-10-01',
        tom: '2022-10-05'
      },
      {
        fom: '2022-10-10',
        tom: '2022-10-15'
      }
    ];

    act(() => {
      result.current.initArbeidsgiverperioder(mottattArbeidsgiverperiode);
    });

    expect(result.current.arbeidsgiverperioder).toEqual([
      {
        fom: new Date(2022, 9, 1),
        id: '1',
        tom: new Date(2022, 9, 5)
      },
      {
        fom: new Date(2022, 9, 10),
        id: '2',
        tom: new Date(2022, 9, 15)
      }
    ]);

    act(() => {
      result.current.slettArbeidsgiverperiode('1');
    });

    expect(result.current.arbeidsgiverperioder).toEqual([
      {
        fom: new Date(2022, 9, 10),
        id: '2',
        tom: new Date(2022, 9, 15)
      }
    ]);
  });

  it('should update a periode.', () => {
    const { result } = renderHook(() => useBoundStore((state) => state));

    nanoid.mockReturnValueOnce('1').mockReturnValueOnce('2');

    const mottattArbeidsgiverperiode: Array<MottattPeriode> = [
      {
        fom: '2022-10-01',
        tom: '2022-10-05'
      },
      {
        fom: '2022-10-10',
        tom: '2022-10-15'
      }
    ];

    act(() => {
      result.current.initArbeidsgiverperioder(mottattArbeidsgiverperiode);
    });

    act(() => {
      result.current.setArbeidsgiverperiodeDato(
        {
          fom: new Date(2022, 9, 4),
          tom: new Date(2022, 9, 6)
        },
        '1'
      );
    });

    expect(result.current.arbeidsgiverperioder).toEqual([
      {
        fom: new Date(2022, 9, 4),
        id: '1',
        tom: new Date(2022, 9, 6)
      },
      {
        fom: new Date(2022, 9, 10),
        id: '2',
        tom: new Date(2022, 9, 15)
      }
    ]);
  });
});
