import { parseISO } from 'date-fns';
import { Periode } from '../../state/state';
import finnBestemmendeFravaersdag from '../../utils/finnBestemmendeFravaersdag';

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

  it('should return the correct arbeidsgiverperiode periode for short periods and a jump', () => {
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
    expect(finnBestemmendeFravaersdag(periode)).toBe('2023-05-02');
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
});
