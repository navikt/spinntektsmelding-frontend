import { parseISO } from 'date-fns';
import { Periode } from '../../state/state';
import finnBestemmendeFravaersdag, {
  tidPeriode,
  tilstoetendePeriode,
  tilstoetendePeriodeManuellJustering
} from '../../utils/finnBestemmendeFravaersdag';
import { describe } from 'vitest';

describe.concurrent('finnBestemmendeFravaersdag', () => {
  it('should return the correct bestemmende fraværsdag for two periode directly following each other', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2022-11-12'),
        tom: parseISO('2022-11-16')
      },
      {
        id: '2',
        fom: parseISO('2022-11-17'),
        tom: parseISO('2022-11-22')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode)).toBe('2022-11-12');
  });

  it('should return the correct bestemmende fraværsdag for two periode with one workday between', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2022-11-12'),
        tom: parseISO('2022-11-15')
      },
      {
        id: '2',
        fom: parseISO('2022-11-17'),
        tom: parseISO('2022-11-22')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode)).toBe('2022-11-17');
  });

  it('should return the correct bestemmende fraværsdag for two periode with weekend between', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2022-12-12'),
        tom: parseISO('2022-12-16')
      },
      {
        id: '2',
        fom: parseISO('2022-12-19'),
        tom: parseISO('2022-12-22')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode)).toBe('2022-12-12');
  });

  it('should return the correct bestemmende fraværsdag for two overlapping periode', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2022-12-12'),
        tom: parseISO('2022-12-17')
      },
      {
        id: '2',
        fom: parseISO('2022-12-16'),
        tom: parseISO('2022-12-22')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode)).toBe('2022-12-12');
  });

  it('should return the correct bestemmende fraværsdag for two periode with one in the other', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2022-12-12'),
        tom: parseISO('2022-12-25')
      },
      {
        id: '2',
        fom: parseISO('2022-12-16'),
        tom: parseISO('2022-12-22')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode)).toBe('2022-12-12');
  });

  it('should return the undefined bestemmende fraværsdag for two periode with one in the other', () => {
    const periode: Array<Periode> = undefined;

    expect(finnBestemmendeFravaersdag(periode)).toBeUndefined();
  });

  it('should return the correct bestemmende fraværsdag for two periode with one in the other and sorted order', () => {
    const periode: Array<Periode> = [
      {
        id: '2',
        fom: parseISO('2022-12-16'),
        tom: parseISO('2022-12-22')
      },
      {
        id: '1',
        fom: parseISO('2022-12-12'),
        tom: parseISO('2022-12-25')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode)).toBe('2022-12-12');
  });

  it('should return the correct arbeidsgiverperiode periode for short periods and a jump. Gap after 16 days periode.', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2023-01-12'),
        tom: parseISO('2023-02-12')
      },
      {
        id: '2',
        fom: parseISO('2023-02-13'),
        tom: parseISO('2023-03-10')
      },
      {
        id: '3',
        fom: parseISO('2023-03-11'),
        tom: parseISO('2023-03-29')
      },
      {
        id: '4',
        fom: parseISO('2023-03-30'),
        tom: parseISO('2023-04-16')
      },
      {
        id: '5',
        fom: parseISO('2023-05-02'),
        tom: parseISO('2023-05-07')
      }
    ];
    const agp: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2023-01-12'),
        tom: parseISO('2023-02-12')
      },
      {
        id: '2',
        fom: parseISO('2023-02-13'),
        tom: parseISO('2023-03-10')
      },
      {
        id: '3',
        fom: parseISO('2023-03-11'),
        tom: parseISO('2023-03-29')
      },
      {
        id: '4',
        fom: parseISO('2023-03-30'),
        tom: parseISO('2023-04-16')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode, agp)).toBe('2023-01-12');
  });

  it('should return the correct arbeidsgiverperiode periode for short periods and a jump. Gap before 16 days periode.', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2023-01-01'),
        tom: parseISO('2023-01-12')
      },
      {
        id: '2',
        fom: parseISO('2023-01-14'),
        tom: parseISO('2023-03-10')
      },
      {
        id: '3',
        fom: parseISO('2023-03-11'),
        tom: parseISO('2023-03-29')
      },
      {
        id: '4',
        fom: parseISO('2023-03-30'),
        tom: parseISO('2023-04-16')
      },
      {
        id: '5',
        fom: parseISO('2023-05-02'),
        tom: parseISO('2023-05-07')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode)).toBe('2023-01-14');
  });

  it('should return the correct arbeidsgiverperiode periode for shorter periods and a jump. Gap before 16 days periode.', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2023-01-01'),
        tom: parseISO('2023-01-06')
      },
      {
        id: '1.5',
        fom: parseISO('2023-01-08'),
        tom: parseISO('2023-01-12')
      },
      {
        id: '2',
        fom: parseISO('2023-01-14'),
        tom: parseISO('2023-03-10')
      },
      {
        id: '3',
        fom: parseISO('2023-03-11'),
        tom: parseISO('2023-03-29')
      },
      {
        id: '4',
        fom: parseISO('2023-03-30'),
        tom: parseISO('2023-04-16')
      },
      {
        id: '5',
        fom: parseISO('2023-05-02'),
        tom: parseISO('2023-05-07')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode)).toBe('2023-01-14');
  });

  it('should return the correct bestemmende fraværsdag when arbeidsgiverperioden is in the future', () => {
    const periode: Array<Periode> = [
      {
        id: '2',
        fom: parseISO('2022-12-16'),
        tom: parseISO('2022-12-25')
      }
    ];

    const arbeidsgiverPeriode: Array<Periode> = [
      {
        id: 'a1',
        fom: parseISO('2022-12-20'),
        tom: parseISO('2022-12-22')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode, arbeidsgiverPeriode)).toBe('2022-12-20');
  });

  it('should return the correct bestemmende fraværsdag when arbeidsgiverperioden is in the past', () => {
    const periode: Array<Periode> = [
      {
        id: '2',
        fom: parseISO('2022-12-16'),
        tom: parseISO('2022-12-25')
      }
    ];

    const arbeidsgiverPeriode: Array<Periode> = [
      {
        id: 'a1',
        fom: parseISO('2022-12-02'),
        tom: parseISO('2022-12-18')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode, arbeidsgiverPeriode)).toBe('2022-12-02');
  });

  it('should return the correct bestemmende fraværsdag when arbeidsgiverperioden is in the past and the last day is the same', () => {
    const periode: Array<Periode> = [
      {
        id: '2',
        fom: parseISO('2022-12-16'),
        tom: parseISO('2022-12-25')
      }
    ];

    const arbeidsgiverPeriode: Array<Periode> = [
      {
        id: 'a1',
        fom: parseISO('2022-12-02'),
        tom: parseISO('2022-12-16')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode, arbeidsgiverPeriode)).toBe('2022-12-02');
  });

  it('should return the correct bestemmende fraværsdag when arbeidsgiverperioden is in the past and the first day is the same', () => {
    const periode: Array<Periode> = [
      {
        id: '2',
        fom: parseISO('2022-12-16'),
        tom: parseISO('2022-12-25')
      }
    ];

    const arbeidsgiverPeriode: Array<Periode> = [
      {
        id: 'a1',
        fom: parseISO('2022-12-16'),
        tom: parseISO('2022-12-18')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode, arbeidsgiverPeriode)).toBe('2022-12-16');
  });

  it('should return the correct bestemmende fraværsdag for two periode directly following each other and forespurtBestemmende is in the past', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2022-11-12'),
        tom: parseISO('2022-11-16')
      },
      {
        id: '2',
        fom: parseISO('2022-11-17'),
        tom: parseISO('2022-11-22')
      }
    ];

    const arbeidsgiverPeriode: Array<Periode> = [
      {
        id: 'a1',
        fom: parseISO('2022-12-16'),
        tom: parseISO('2022-12-18')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode, arbeidsgiverPeriode, '2022-11-05')).toBe('2022-11-05');
  });

  it('should return the correct bestemmende fraværsdag for two periode directly following each other and forespurtBestemmende is in the future', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2022-11-12'),
        tom: parseISO('2022-11-16')
      },
      {
        id: '2',
        fom: parseISO('2022-11-17'),
        tom: parseISO('2022-11-22')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode, undefined, '2022-11-17')).toBe('2022-11-12');
  });

  it('should return the correct bestemmende fraværsdag for two periode directly following each other and forespurtBestemmende is in the future 2', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2022-11-12'),
        tom: parseISO('2022-11-16')
      },
      {
        id: '2',
        fom: parseISO('2022-11-17'),
        tom: parseISO('2022-11-22')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode, undefined, '2022-11-18')).toBe('2022-11-12');
  });

  it('should return null for tilstøtende perioder, uten helg, manuell', () => {
    const periode1: Periode = {
      id: '1',
      fom: parseISO('2023-11-29'),
      tom: parseISO('2023-12-01')
    };
    const periode2: Periode = {
      id: '2',
      fom: parseISO('2023-12-04'),
      tom: parseISO('2023-12-04')
    };
    expect(tilstoetendePeriodeManuellJustering(periode1, periode2)).toBeNull();
  });

  it('should return joined periode for tilstøtende perioder, manuell', () => {
    const periode1: Periode = {
      id: '1',
      fom: parseISO('2023-11-29'),
      tom: parseISO('2023-12-03')
    };
    const periode2: Periode = {
      id: '2',
      fom: parseISO('2023-12-04'),
      tom: parseISO('2023-12-04')
    };
    expect(tilstoetendePeriodeManuellJustering(periode1, periode2)).toEqual({
      id: '1',
      fom: parseISO('2023-11-29'),
      tom: parseISO('2023-12-04')
    });
  });

  it('should return null for nesten tilstøtende perioder, manuell', () => {
    const periode1: Periode = {
      id: '1',
      fom: parseISO('2023-11-29'),
      tom: parseISO('2023-12-02')
    };
    const periode2: Periode = {
      id: '2',
      fom: parseISO('2023-12-04'),
      tom: parseISO('2023-12-04')
    };
    expect(tilstoetendePeriodeManuellJustering(periode1, periode2)).toBeNull();
  });

  it('should return null for tilstøtende perioder, uten helg', () => {
    const periode1: Periode = {
      id: '1',
      fom: parseISO('2023-11-29'),
      tom: parseISO('2023-12-01')
    };
    const periode2: Periode = {
      id: '2',
      fom: parseISO('2023-12-04'),
      tom: parseISO('2023-12-04')
    };
    expect(tilstoetendePeriode(periode1, periode2)).toEqual({
      id: '1',
      fom: parseISO('2023-11-29'),
      tom: parseISO('2023-12-04')
    });
  });

  it('should return correct bfd when arbeidsgiverKanFlytte is true and forespurtBestemmendeFraværsdag is undefined', () => {
    const periode1: Periode[] = [
      {
        id: '1',
        fom: parseISO('2023-11-29'),
        tom: parseISO('2023-12-03')
      }
    ];
    const periode2: Periode[] = [
      {
        id: '2',
        fom: parseISO('2023-11-29'),
        tom: parseISO('2023-12-03')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode1, periode2, undefined, true)).toEqual('2023-11-29');
  });

  it('should return correct bfd when arbeidsgiverKanFlytte is false and forespurtBestemmendeFraværsdag is undefined', () => {
    const periode1: Periode[] = [
      {
        id: '1',
        fom: parseISO('2023-11-29'),
        tom: parseISO('2023-12-03')
      }
    ];
    const periode2: Periode[] = [
      {
        id: '2',
        fom: parseISO('2023-11-29'),
        tom: parseISO('2023-12-03')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode1, periode2, undefined, false)).toEqual('2023-11-29');
  });

  it('should return correct bfd when forespurtBestemmendeFraværsdag is undefined', () => {
    const periode1: Periode[] = [
      {
        id: '1',
        fom: parseISO('2023-11-29'),
        tom: parseISO('2023-12-03')
      }
    ];
    const periode2: Periode[] = [
      {
        id: '2',
        fom: parseISO('2023-11-29'),
        tom: parseISO('2023-12-03')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode1, periode2, undefined)).toEqual('2023-11-29');
  });

  it('return undefined when no params are given', () => {
    const periode1: Periode[] = [
      {
        id: '1',
        fom: parseISO('2023-11-29'),
        tom: parseISO('2023-12-03')
      }
    ];
    const periode2: Periode[] = [
      {
        id: '2',
        fom: parseISO('2023-11-29'),
        tom: parseISO('2023-12-03')
      }
    ];
    expect(finnBestemmendeFravaersdag()).toEqual(undefined);
  });

  /***** */
  it('should return correct bfd when arbeidsgiverKanFlytte is true and forespurtBestemmendeFraværsdag is undefined, different periodes', () => {
    const fravaersperioder: Periode[] = [
      {
        id: '1',
        fom: parseISO('2023-11-29'),
        tom: parseISO('2023-12-03')
      }
    ];
    const arbeidsgiverperiode: Periode[] = [
      {
        id: '2',
        fom: parseISO('2023-11-30'),
        tom: parseISO('2023-12-03')
      }
    ];
    expect(finnBestemmendeFravaersdag(fravaersperioder, arbeidsgiverperiode, undefined, true)).toEqual('2023-11-30');
  });

  it('should return correct bfd when arbeidsgiverKanFlytte is false and forespurtBestemmendeFraværsdag is undefined, different periodes', () => {
    const periode1: Periode[] = [
      {
        id: '1',
        fom: parseISO('2023-11-29'),
        tom: parseISO('2023-12-03')
      }
    ];
    const periode2: Periode[] = [
      {
        id: '2',
        fom: parseISO('2023-11-30'),
        tom: parseISO('2023-12-03')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode1, periode2, undefined, false)).toEqual('2023-11-30');
  });
  it('should return correct bfd when forespurtBestemmendeFraværsdag is undefined, different periodes', () => {
    const periode1: Periode[] = [
      {
        id: '1',
        fom: parseISO('2023-11-29'),
        tom: parseISO('2023-12-03')
      }
    ];
    const periode2: Periode[] = [
      {
        id: '2',
        fom: parseISO('2023-11-30'),
        tom: parseISO('2023-12-03')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode1, periode2, undefined)).toEqual('2023-11-30');
  });

  it('return undefined when no params are given, different periodes', () => {
    const periode1: Periode[] = [
      {
        id: '1',
        fom: parseISO('2023-11-29'),
        tom: parseISO('2023-12-03')
      }
    ];
    const periode2: Periode[] = [
      {
        id: '2',
        fom: parseISO('2023-11-30'),
        tom: parseISO('2023-12-03')
      }
    ];
    expect(finnBestemmendeFravaersdag()).toEqual(undefined);
  });

  it('should return correct bfd when arbeidsgiverKanFlytte is false and forespurtBestemmendeFraværsdag is given, different periodes', () => {
    const periode1: Periode[] = [
      {
        id: '1',
        fom: parseISO('2023-11-29'),
        tom: parseISO('2023-12-03')
      }
    ];
    const arbeidsgiverperiode: Periode[] = [
      {
        id: '2',
        fom: parseISO('2023-11-30'),
        tom: parseISO('2023-12-03')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode1, arbeidsgiverperiode, '2023-11-29', false)).toEqual('2023-11-29');
  });

  it('should return correct bfd when arbeidsgiverKanFlytte is false and forespurtBestemmendeFraværsdag is given, different periodes and arbeidsgiverperiode = []', () => {
    const periode1: Periode[] = [
      {
        id: '1',
        fom: parseISO('2023-11-29'),
        tom: parseISO('2023-12-03')
      }
    ];
    const periode2: Periode[] = [];
    expect(finnBestemmendeFravaersdag(periode1, periode2, undefined, false)).toEqual('2023-11-29');
  });

  it('should return correct bfd when agp is exactly 16 days', () => {
    const periode1: Periode[] = [
      {
        id: '1',
        fom: parseISO('2024-02-05'),
        tom: parseISO('2024-02-06')
      },
      {
        id: '2',
        fom: parseISO('2024-02-15'),
        tom: parseISO('2024-02-28')
      },
      {
        id: '3',
        fom: parseISO('2024-03-07'),
        tom: parseISO('2024-03-28')
      }
    ];
    const arbeidsgiverperiode: Periode[] = [
      {
        id: 'a1',
        fom: parseISO('2024-02-05'),
        tom: parseISO('2024-02-06')
      },
      {
        id: 'a2',
        fom: parseISO('2024-02-15'),
        tom: parseISO('2024-02-28')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode1, arbeidsgiverperiode)).toEqual('2024-03-07');
  });

  it('should return correct bfd when agp is exactly 16 days, kanSette is true', () => {
    const periode1: Periode[] = [
      {
        id: '1',
        fom: parseISO('2024-02-05'),
        tom: parseISO('2024-02-06')
      },
      {
        id: '2',
        fom: parseISO('2024-02-15'),
        tom: parseISO('2024-02-28')
      },
      {
        id: '3',
        fom: parseISO('2024-03-07'),
        tom: parseISO('2024-03-28')
      }
    ];
    const arbeidsgiverperiode: Periode[] = [
      {
        id: 'a1',
        fom: parseISO('2024-02-05'),
        tom: parseISO('2024-02-06')
      },
      {
        id: 'a2',
        fom: parseISO('2024-02-15'),
        tom: parseISO('2024-02-28')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode1, arbeidsgiverperiode, undefined, true)).toEqual('2024-03-07');
  });

  it('should return correct bfd when agp is exactly 16 days, kanSette is true, ting', () => {
    const periode1: Periode[] = [
      {
        id: '1',
        fom: parseISO('2024-02-05'),
        tom: parseISO('2024-02-06')
      },
      {
        id: '2',
        fom: parseISO('2024-02-15'),
        tom: parseISO('2024-02-28')
      },
      {
        id: '3',
        fom: parseISO('2024-03-07'),
        tom: parseISO('2024-03-24')
      }
    ];
    const arbeidsgiverperiode: Periode[] = [
      {
        id: 'a1',
        fom: parseISO('2024-02-05'),
        tom: parseISO('2024-02-06')
      },
      {
        id: 'a2',
        fom: parseISO('2024-02-15'),
        tom: parseISO('2024-02-28')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode1, arbeidsgiverperiode, parseISO('2024-02-15'), true)).toEqual(
      '2024-03-07'
    );

    expect(finnBestemmendeFravaersdag(periode1, arbeidsgiverperiode, '2024-02-15', true)).toEqual('2024-03-07');
  });

  it('should return correct bfd when agp is exactly 16 days, kanSette is true, string input', () => {
    const periode1: Periode[] = [
      {
        id: '1',
        fom: parseISO('2024-02-05'),
        tom: parseISO('2024-02-06')
      },
      {
        id: '2',
        fom: parseISO('2024-02-15'),
        tom: parseISO('2024-02-28')
      },
      {
        id: '3',
        fom: parseISO('2024-03-07'),
        tom: parseISO('2024-03-24')
      }
    ];
    const arbeidsgiverperiode: Periode[] = [
      {
        id: 'a1',
        fom: parseISO('2024-02-05'),
        tom: parseISO('2024-02-06')
      },
      {
        id: 'a2',
        fom: parseISO('2024-02-15'),
        tom: parseISO('2024-02-28')
      }
    ];

    expect(finnBestemmendeFravaersdag(periode1, arbeidsgiverperiode, '2024-02-15', true)).toEqual('2024-03-07');
  });

  it('should return correct bfd when laast til periode and eksternBestemmendefravaersdag is earliest', () => {
    const periode1: Periode[] = [
      {
        id: '1',
        fom: parseISO('2024-02-05'),
        tom: parseISO('2024-02-06')
      },
      {
        id: '2',
        fom: parseISO('2024-02-15'),
        tom: parseISO('2024-02-28')
      },
      {
        id: '3',
        fom: parseISO('2024-03-07'),
        tom: parseISO('2024-03-24')
      }
    ];
    const arbeidsgiverperiode: Periode[] = [
      {
        id: 'a1',
        fom: parseISO('2024-02-05'),
        tom: parseISO('2024-02-06')
      },
      {
        id: 'a2',
        fom: parseISO('2024-02-15'),
        tom: parseISO('2024-02-28')
      }
    ];

    expect(
      finnBestemmendeFravaersdag(periode1, arbeidsgiverperiode, '2024-02-15', true, '2024-01-02', '2024-01-03', true)
    ).toEqual('2024-01-02');
  });

  it('should return correct bfd when laast til periode and eksternBestemmendefravaersdag is latest', () => {
    const periode1: Periode[] = [
      {
        id: '1',
        fom: parseISO('2024-02-05'),
        tom: parseISO('2024-02-06')
      },
      {
        id: '2',
        fom: parseISO('2024-02-15'),
        tom: parseISO('2024-02-28')
      },
      {
        id: '3',
        fom: parseISO('2024-03-07'),
        tom: parseISO('2024-03-24')
      }
    ];
    const arbeidsgiverperiode: Periode[] = [
      {
        id: 'a1',
        fom: parseISO('2024-02-05'),
        tom: parseISO('2024-02-06')
      },
      {
        id: 'a2',
        fom: parseISO('2024-02-15'),
        tom: parseISO('2024-02-28')
      }
    ];

    expect(
      finnBestemmendeFravaersdag(periode1, arbeidsgiverperiode, '2024-02-15', true, '2024-01-05', '2024-01-03', true)
    ).toEqual('2024-01-03');
  });
  it('should return correct bfd when laast til periode and eksternBestemmendefravaersdag is missing', () => {
    const periode1: Periode[] = [
      {
        id: '1',
        fom: parseISO('2024-02-05'),
        tom: parseISO('2024-02-06')
      },
      {
        id: '2',
        fom: parseISO('2024-02-15'),
        tom: parseISO('2024-02-28')
      },
      {
        id: '3',
        fom: parseISO('2024-03-07'),
        tom: parseISO('2024-03-24')
      }
    ];
    const arbeidsgiverperiode: Periode[] = [
      {
        id: 'a1',
        fom: parseISO('2024-02-05'),
        tom: parseISO('2024-02-06')
      },
      {
        id: 'a2',
        fom: parseISO('2024-02-15'),
        tom: parseISO('2024-02-28')
      }
    ];

    expect(
      finnBestemmendeFravaersdag(periode1, arbeidsgiverperiode, '2024-02-15', true, '2024-01-05', undefined, true)
    ).toEqual('2024-01-05');
  });

  it('should return correct bfd when 2bananer', () => {
    const periode1: Periode[] = [
      {
        id: '1',
        fom: parseISO('2024-07-08'),
        tom: parseISO('2024-07-19')
      },
      {
        id: '2',
        fom: parseISO('2024-07-31'),
        tom: parseISO('2024-08-02')
      },
      {
        id: '3',
        fom: parseISO('2024-08-07'),
        tom: parseISO('2024-08-09')
      }
    ];

    const arbeidsgiverperiode: Periode[] = [];

    expect(
      finnBestemmendeFravaersdag(periode1, arbeidsgiverperiode, '2024-02-15', true, '2024-01-05', undefined, false)
    ).toEqual('2024-08-07');
  });

  it('should return correct bfd when 2bananer with agp', () => {
    const periode1: Periode[] = [
      {
        id: '1',
        fom: parseISO('2024-07-08'),
        tom: parseISO('2024-07-19')
      },
      {
        id: '2',
        fom: parseISO('2024-07-31'),
        tom: parseISO('2024-08-02')
      },
      {
        id: '3',
        fom: parseISO('2024-08-07'),
        tom: parseISO('2024-08-09')
      }
    ];

    const arbeidsgiverperiode: Periode[] = [
      {
        id: 'a1',
        fom: parseISO('2024-07-08'),
        tom: parseISO('2024-07-23')
      }
    ];

    expect(
      finnBestemmendeFravaersdag(periode1, arbeidsgiverperiode, '2024-02-15', true, '2024-01-05', undefined, false)
    ).toEqual('2024-07-31');
  });

  it('should return correct bfd when 2bananer and loads of perioder', () => {
    const periode1: tidPeriode[] = [
      {
        fom: parseISO('2023-09-01'),
        tom: parseISO('2023-09-05')
      },
      {
        fom: parseISO('2023-09-06'),
        tom: parseISO('2023-09-08')
      },
      {
        fom: parseISO('2023-09-09'),
        tom: parseISO('2023-09-15')
      },
      {
        fom: parseISO('2023-09-25'),
        tom: parseISO('2023-10-01')
      },
      {
        fom: parseISO('2023-10-02'),
        tom: parseISO('2023-10-09')
      },
      {
        fom: parseISO('2023-10-10'),
        tom: parseISO('2023-10-23')
      },
      {
        fom: parseISO('2023-10-24'),
        tom: parseISO('2023-11-07')
      },
      {
        fom: parseISO('2023-11-08'),
        tom: parseISO('2023-11-30')
      },
      {
        fom: parseISO('2023-12-01'),
        tom: parseISO('2023-12-22')
      },
      {
        fom: parseISO('2023-12-23'),
        tom: parseISO('2024-01-10')
      },
      {
        fom: parseISO('2024-01-11'),
        tom: parseISO('2024-02-02')
      },
      {
        fom: parseISO('2024-02-03'),
        tom: parseISO('2024-02-23')
      },
      {
        fom: parseISO('2024-02-24'),
        tom: parseISO('2024-03-15')
      },
      {
        fom: parseISO('2024-03-16'),
        tom: parseISO('2024-04-08')
      },
      {
        fom: parseISO('2024-04-09'),
        tom: parseISO('2024-04-29')
      },
      {
        fom: parseISO('2024-04-30'),
        tom: parseISO('2024-05-15')
      },
      {
        fom: parseISO('2024-05-16'),
        tom: parseISO('2024-05-31')
      },
      {
        fom: parseISO('2024-06-01'),
        tom: parseISO('2024-06-23')
      },
      {
        fom: parseISO('2024-06-24'),
        tom: parseISO('2024-07-15')
      },
      {
        fom: parseISO('2024-07-16'),
        tom: parseISO('2024-08-06')
      },
      {
        fom: parseISO('2024-08-07'),
        tom: parseISO('2024-08-28')
      },
      {
        fom: parseISO('2024-09-09'),
        tom: parseISO('2024-09-11')
      }
    ];

    const arbeidsgiverperiode: Periode[] = [
      {
        id: 'a1',
        fom: parseISO('2023-09-01'),
        tom: parseISO('2023-09-15')
      },
      {
        id: 'a2',
        fom: parseISO('2023-09-25'),
        tom: parseISO('2023-09-25')
      }
    ];

    expect(
      finnBestemmendeFravaersdag(periode1, arbeidsgiverperiode, undefined, true, undefined, undefined, false)
    ).toEqual('2023-09-25');
  });

  it('should return correct bfd when 2bananer and loads of perioder, uten agp', () => {
    const periode1: tidPeriode[] = [
      {
        fom: parseISO('2023-09-01'),
        tom: parseISO('2023-09-05')
      },
      {
        fom: parseISO('2023-09-06'),
        tom: parseISO('2023-09-08')
      },
      {
        fom: parseISO('2023-09-09'),
        tom: parseISO('2023-09-15')
      },
      {
        fom: parseISO('2023-09-25'),
        tom: parseISO('2023-10-01')
      },
      {
        fom: parseISO('2023-10-02'),
        tom: parseISO('2023-10-09')
      },
      {
        fom: parseISO('2023-10-10'),
        tom: parseISO('2023-10-23')
      },
      {
        fom: parseISO('2023-10-24'),
        tom: parseISO('2023-11-07')
      },
      {
        fom: parseISO('2023-11-08'),
        tom: parseISO('2023-11-30')
      },
      {
        fom: parseISO('2023-12-01'),
        tom: parseISO('2023-12-22')
      },
      {
        fom: parseISO('2023-12-23'),
        tom: parseISO('2024-01-10')
      },
      {
        fom: parseISO('2024-01-11'),
        tom: parseISO('2024-02-02')
      },
      {
        fom: parseISO('2024-02-03'),
        tom: parseISO('2024-02-23')
      },
      {
        fom: parseISO('2024-02-24'),
        tom: parseISO('2024-03-15')
      },
      {
        fom: parseISO('2024-03-16'),
        tom: parseISO('2024-04-08')
      },
      {
        fom: parseISO('2024-04-09'),
        tom: parseISO('2024-04-29')
      },
      {
        fom: parseISO('2024-04-30'),
        tom: parseISO('2024-05-15')
      },
      {
        fom: parseISO('2024-05-16'),
        tom: parseISO('2024-05-31')
      },
      {
        fom: parseISO('2024-06-01'),
        tom: parseISO('2024-06-23')
      },
      {
        fom: parseISO('2024-06-24'),
        tom: parseISO('2024-07-15')
      },
      {
        fom: parseISO('2024-07-16'),
        tom: parseISO('2024-08-06')
      },
      {
        fom: parseISO('2024-08-07'),
        tom: parseISO('2024-08-28')
      },
      {
        fom: parseISO('2024-09-09'),
        tom: parseISO('2024-09-11')
      }
    ];

    const arbeidsgiverperiode: Periode[] = [
      {
        id: 'a1',
        fom: parseISO('2023-09-01'),
        tom: parseISO('2023-09-15')
      },
      {
        id: 'a2',
        fom: parseISO('2023-09-25'),
        tom: parseISO('2023-09-25')
      }
    ];

    expect(finnBestemmendeFravaersdag(periode1, [], undefined, true, undefined, undefined, false)).toEqual(
      '2023-09-25'
    );
  });

  it('should return correct bfd (2024-08-30) when there is a weekend gap between agp and fraværsdager', () => {
    const periode1: Periode[] = [
      {
        id: '1',
        fom: parseISO('2024-09-16'),
        tom: parseISO('2024-09-19')
      }
    ];

    const arbeidsgiverperiode: Periode[] = [
      {
        id: 'a1',
        fom: parseISO('2024-08-30'),
        tom: parseISO('2024-09-14')
      }
    ];

    expect(
      finnBestemmendeFravaersdag(periode1, arbeidsgiverperiode, undefined, true, undefined, undefined, false)
    ).toEqual('2024-08-30');
  });
});
