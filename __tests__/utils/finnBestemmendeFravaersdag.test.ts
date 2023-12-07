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
        fom: parseISO('2018-01-12'),
        tom: parseISO('2018-02-12')
      },
      {
        id: '2',
        fom: parseISO('2018-02-13'),
        tom: parseISO('2018-03-10')
      },
      {
        id: '3',
        fom: parseISO('2018-03-11'),
        tom: parseISO('2018-03-29')
      },
      {
        id: '4',
        fom: parseISO('2018-03-30'),
        tom: parseISO('2018-04-16')
      },
      {
        id: '5',
        fom: parseISO('2018-05-02'),
        tom: parseISO('2018-05-07')
      }
    ];
    expect(finnBestemmendeFravaersdag(periode)).toBe('2018-05-02');
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

  it('should return the correct bestemmende fraværsdag when arbeidsgiverperioden is in the past and the last day is the same, eller?', () => {
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

  it.skip('should return the correct bestemmende fraværsdag for two periode directly following each other and forespurtBestemmende is in the past', () => {
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
  /*
  arbeidsgiverperiode tilstede
*/
  it('should return the correct bestemmende fraværsdag for arbeidsgiverperiode med gap til egenmeldingsperioder', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-02-03'),
        tom: parseISO('2018-02-06')
      },
      {
        id: '2',
        fom: parseISO('2018-02-07'),
        tom: parseISO('2018-02-28')
      }
    ];

    const arbeidsgiverPeriode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-01-10'),
        tom: parseISO('2018-01-26')
      }
    ];

    expect(finnBestemmendeFravaersdag(periode, arbeidsgiverPeriode)).toBe('2018-02-03');
  });

  it('should return the correct bestemmende fraværsdag for arbeidsgiverperiode med gap til sykmeldingsperioder', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-06-08'),
        tom: parseISO('2018-06-29')
      }
    ];

    const arbeidsgiverPeriode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-03-13'),
        tom: parseISO('2018-03-29')
      }
    ];

    expect(finnBestemmendeFravaersdag(periode, arbeidsgiverPeriode)).toBe('2018-06-08');
  });

  it('should return the correct bestemmende fraværsdag for kun én arbeidsgiverperiode', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-01-04'),
        tom: parseISO('2018-01-31')
      }
    ];

    const arbeidsgiverPeriode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-01-01'),
        tom: parseISO('2018-01-16')
      }
    ];

    expect(finnBestemmendeFravaersdag(periode, arbeidsgiverPeriode)).toBe('2018-01-01');
  });

  it('should return the correct bestemmende fraværsdag for flere arbeidsgiverperioder kant i kant behandles som enkelt arbeidsgiverperiode', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-02-03'),
        tom: parseISO('2018-02-05')
      },
      {
        id: '2',
        fom: parseISO('2018-02-06'),
        tom: parseISO('2018-02-28')
      }
    ];

    const arbeidsgiverPeriode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-02-01'),
        tom: parseISO('2018-02-12')
      },
      {
        id: '2',
        fom: parseISO('2018-02-13'),
        tom: parseISO('2018-02-16')
      }
    ];

    expect(finnBestemmendeFravaersdag(periode, arbeidsgiverPeriode)).toBe('2018-02-01');
  });

  it('should return the correct bestemmende fraværsdag for flere arbeidsgiverperioder med hverdagsgap', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-03-06'),
        tom: parseISO('2018-03-07')
      },
      {
        id: '2',
        fom: parseISO('2018-03-11'),
        tom: parseISO('2018-03-31')
      }
    ];

    const arbeidsgiverPeriode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-03-01'),
        tom: parseISO('2018-03-08')
      },
      {
        id: '2',
        fom: parseISO('2018-03-10'),
        tom: parseISO('2018-03-17')
      }
    ];

    expect(finnBestemmendeFravaersdag(periode, arbeidsgiverPeriode)).toBe('2018-03-10');
  });

  it('should return the correct bestemmende fraværsdag for arbeidsgiverperiode kant i kant med sykmeldingsperioder', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-01-22'),
        tom: parseISO('2018-02-22')
      }
    ];

    const arbeidsgiverPeriode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-01-05'),
        tom: parseISO('2018-01-21')
      }
    ];

    expect(finnBestemmendeFravaersdag(periode, arbeidsgiverPeriode)).toBe('2018-01-05');
  });

  it('should return the correct bestemmende fraværsdag for arbeidsgiverperiode med gap til egenmeldingsperioder', () => {
    const arbeidsgiverPeriode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-01-10'),
        tom: parseISO('2018-01-26')
      }
    ];

    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-02-03'),
        tom: parseISO('2018-02-06')
      },
      {
        id: '2',
        fom: parseISO('2018-02-07'),
        tom: parseISO('2018-02-28')
      }
    ];

    expect(finnBestemmendeFravaersdag(periode, arbeidsgiverPeriode)).toBe('2018-02-03');
  });

  it('should return the correct bestemmende fraværsdag for arbeidsgiverperiode med gap til sykmeldingsperioder', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-06-08'),
        tom: parseISO('2018-06-29')
      }
    ];

    const arbeidsgiverPeriode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-03-13'),
        tom: parseISO('2018-03-29')
      }
    ];

    expect(finnBestemmendeFravaersdag(periode, arbeidsgiverPeriode)).toBe('2018-06-08');
  });

  /*
    arbeidsgiverperoide ikke tilstede
  */
  it('should return the correct bestemmende fraværsdag for uten egenmeldinger, kun én sykmeldingperiode', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-09-17'),
        tom: parseISO('2018-10-31')
      }
    ];

    expect(finnBestemmendeFravaersdag(periode, undefined)).toBe('2018-09-17');
  });

  it('should return the correct bestemmende fraværsdag for uten egenmeldinger, flere sykmeldingperioder uten gap', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-06-21'),
        tom: parseISO('2018-07-01')
      },
      {
        id: '2',
        fom: parseISO('2018-07-02'),
        tom: parseISO('2018-07-25')
      }
    ];

    expect(finnBestemmendeFravaersdag(periode, undefined)).toBe('2018-06-21');
  });

  it('should return the correct bestemmende fraværsdag for uten egenmeldinger, flere sykmeldingperioder med helgegap', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-08-02'),
        tom: parseISO('2018-08-03')
      },
      {
        id: '2',
        fom: parseISO('2018-08-06'),
        tom: parseISO('2018-08-29')
      }
    ];

    expect(finnBestemmendeFravaersdag(periode, undefined)).toBe('2018-08-02');
  });

  it('should return the correct bestemmende fraværsdag for uten egenmeldinger, flere sykmeldingperioder med hverdagsgap', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-11-05'),
        tom: parseISO('2018-11-11')
      },
      {
        id: '2',
        fom: parseISO('2018-11-14'),
        tom: parseISO('2018-11-28')
      }
    ];

    expect(finnBestemmendeFravaersdag(periode, undefined)).toBe('2018-11-14');
  });

  it('should return the correct bestemmende fraværsdag for kun én egenmeldingsperiode, uten gap til enkelt sykmeldingperiode', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-05-02'),
        tom: parseISO('2018-05-02')
      },
      {
        id: '2',
        fom: parseISO('2018-05-03'),
        tom: parseISO('2018-05-25')
      }
    ];

    expect(finnBestemmendeFravaersdag(periode, undefined)).toBe('2018-05-02');
  });

  it('should return the correct bestemmende fraværsdag for kun én egenmeldingsperiode, med helgegap til enkelt sykmeldingperiode', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-03-02'),
        tom: parseISO('2018-03-03')
      },
      {
        id: '2',
        fom: parseISO('2018-03-05'),
        tom: parseISO('2018-03-30')
      }
    ];

    expect(finnBestemmendeFravaersdag(periode, undefined)).toBe('2018-03-02');
  });

  it('should return the correct bestemmende fraværsdag for flere egenmeldings- og sykmeldingperioder uten gap', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-07-02'),
        tom: parseISO('2018-07-02')
      },
      {
        id: '2',
        fom: parseISO('2018-07-03'),
        tom: parseISO('2018-07-04')
      },
      {
        id: '3',
        fom: parseISO('2018-07-05'),
        tom: parseISO('2018-07-25')
      },
      {
        id: '4',
        fom: parseISO('2018-07-26'),
        tom: parseISO('2018-07-29')
      },
      {
        id: '5',
        fom: parseISO('2018-07-30'),
        tom: parseISO('2018-08-12')
      }
    ];

    expect(finnBestemmendeFravaersdag(periode, undefined)).toBe('2018-07-02');
  });

  it('should return the correct bestemmende fraværsdag for flere egenmeldings- og sykmeldingperioder med helgegap', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-08-07'),
        tom: parseISO('2018-08-10')
      },
      {
        id: '2',
        fom: parseISO('2018-08-12'),
        tom: parseISO('2018-08-17')
      },
      {
        id: '3',
        fom: parseISO('2018-08-20'),
        tom: parseISO('2018-08-31')
      },
      {
        id: '4',
        fom: parseISO('2018-09-01'),
        tom: parseISO('2018-09-19')
      }
    ];

    expect(finnBestemmendeFravaersdag(periode, undefined)).toBe('2018-08-07');
  });

  it('should return the correct bestemmende fraværsdag for flere egenmeldings- og sykmeldingperioder med hverdagsgap', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-12-03'),
        tom: parseISO('2018-12-06')
      },
      {
        id: '2',
        fom: parseISO('2018-12-10'),
        tom: parseISO('2018-12-16')
      },
      {
        id: '3',
        fom: parseISO('2018-12-17'),
        tom: parseISO('2018-12-20')
      },
      {
        id: '4',
        fom: parseISO('2018-12-21'),
        tom: parseISO('2018-12-29')
      }
    ];

    expect(finnBestemmendeFravaersdag(periode, undefined)).toBe('2018-12-10');
  });

  it('should return the correct bestemmende fraværsdag og tåler usorterte egenmeldings- og sykmeldingsperioder', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-02-04'),
        tom: parseISO('2018-02-04')
      },
      {
        id: '2',
        fom: parseISO('2018-02-02'),
        tom: parseISO('2018-02-03')
      },
      {
        id: '3',
        fom: parseISO('2018-02-13'),
        tom: parseISO('2018-02-19')
      },
      {
        id: '4',
        fom: parseISO('2018-02-20'),
        tom: parseISO('2018-02-27')
      },
      {
        id: '5',
        fom: parseISO('2018-02-04'),
        tom: parseISO('2018-02-13')
      },
      {
        id: '6',
        fom: parseISO('2018-02-28'),
        tom: parseISO('2018-02-28')
      }
    ];

    expect(finnBestemmendeFravaersdag(periode, undefined)).toBe('2018-02-02');
  });

  it('should return the correct bestemmende fraværsdag og tåler egenmeldingsperioder mellom sykmeldingsperiodene', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-04-06'),
        tom: parseISO('2018-04-09')
      },
      {
        id: '2',
        fom: parseISO('2018-04-19'),
        tom: parseISO('2018-04-21')
      },
      {
        id: '3',
        fom: parseISO('2018-04-10'),
        tom: parseISO('2018-04-18')
      },
      {
        id: '4',
        fom: parseISO('2018-04-22'),
        tom: parseISO('2018-04-29')
      }
    ];

    expect(finnBestemmendeFravaersdag(periode, undefined)).toBe('2018-04-06');
  });

  it('should return the correct bestemmende fraværsdag og tåler overlappende egenmeldings- og sykmeldingsperioder', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2018-10-01'),
        tom: parseISO('2018-10-05')
      },
      {
        id: '2',
        fom: parseISO('2018-10-04'),
        tom: parseISO('2018-10-07')
      },
      {
        id: '3',
        fom: parseISO('2018-10-06'),
        tom: parseISO('2018-10-14')
      },
      {
        id: '4',
        fom: parseISO('2018-10-07'),
        tom: parseISO('2018-10-10')
      },
      {
        id: '5',
        fom: parseISO('2018-10-07'),
        tom: parseISO('2018-10-19')
      },
      {
        id: '6',
        fom: parseISO('2018-10-19'),
        tom: parseISO('2018-10-24')
      }
    ];

    expect(finnBestemmendeFravaersdag(periode, undefined)).toBe('2018-10-01');
  });
});
