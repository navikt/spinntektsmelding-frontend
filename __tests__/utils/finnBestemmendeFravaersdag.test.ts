import { parseISO } from 'date-fns';
import { Periode } from '../../state/state';
import finnBestemmendeFravaersdag, {
  tilstoetendePeriode,
  tilstoetendePeriodeManuellJustering
} from '../../utils/finnBestemmendeFravaersdag';

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
    expect(finnBestemmendeFravaersdag(periode)).toBe('2023-01-12');
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
    expect(finnBestemmendeFravaersdag(periode, arbeidsgiverPeriode)).toBe('2022-12-16');
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
    expect(finnBestemmendeFravaersdag(periode, arbeidsgiverPeriode)).toBe('2022-12-16');
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
    expect(finnBestemmendeFravaersdag(periode, undefined, '2022-11-05')).toBe('2022-11-05');
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
});
