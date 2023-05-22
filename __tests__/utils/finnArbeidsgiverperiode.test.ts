import { parseISO } from 'date-fns';
import { Periode } from '../../state/state';
import finnArbeidsgiverperiode from '../../utils/finnArbeidsgiverperiode';

describe.concurrent('finnArbeidsgiverperiode', () => {
  it('should return the correct arbeidsgiverperiode for two periode directly following each other', () => {
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
    expect(finnArbeidsgiverperiode(periode)).toEqual([
      {
        id: '1',
        fom: parseISO('2022-11-12'),
        tom: parseISO('2022-11-22')
      }
    ]);
  });

  it('should return the correct arbeidsgiverperiode for two periode with one workday between', () => {
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
    expect(finnArbeidsgiverperiode(periode)).toEqual([
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
    ]);
  });

  it('should return the correct arbeidsgiverperiode for two periode with weekend between', () => {
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
    expect(finnArbeidsgiverperiode(periode)).toEqual([
      {
        id: '1',
        fom: parseISO('2022-12-12'),
        tom: parseISO('2022-12-22')
      }
    ]);
  });

  it('should return the correct arbeidsgiverperiode for two overlapping periode', () => {
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
    expect(finnArbeidsgiverperiode(periode)).toEqual([
      {
        id: '1',
        fom: parseISO('2022-12-12'),
        tom: parseISO('2022-12-22')
      }
    ]);
  });

  it('should return the correct arbeidsgiverperiode for two periode with one in the other', () => {
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
    expect(finnArbeidsgiverperiode(periode)).toEqual([
      {
        id: '1',
        fom: parseISO('2022-12-12'),
        tom: parseISO('2022-12-25')
      }
    ]);
  });

  it('should return the correct arbeidsgiverperiode for two long periode with some time between', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2022-05-01'),
        tom: parseISO('2022-05-25')
      },
      {
        id: '2',
        fom: parseISO('2022-06-01'),
        tom: parseISO('2022-06-23')
      }
    ];
    expect(finnArbeidsgiverperiode(periode)).toEqual([
      {
        id: '1',
        fom: parseISO('2022-05-01'),
        tom: parseISO('2022-05-16')
      }
    ]);
  });

  it('should return the correct arbeidsgiverperiode for not so long periode with some time between', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2023-02-06'),
        tom: parseISO('2023-02-17')
      },
      {
        id: '2',
        fom: parseISO('2023-02-22'),
        tom: parseISO('2023-03-03')
      }
    ];
    expect(finnArbeidsgiverperiode(periode)).toEqual([
      {
        id: '1',
        fom: parseISO('2023-02-06'),
        tom: parseISO('2023-02-17')
      },
      {
        id: '2',
        fom: parseISO('2023-02-22'),
        tom: parseISO('2023-02-25')
      }
    ]);
  });

  it('should return the correct arbeidsgiverperiode for one long periode', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2022-05-01'),
        tom: parseISO('2022-05-25')
      }
    ];
    expect(finnArbeidsgiverperiode(periode)).toEqual([
      {
        id: '1',
        fom: parseISO('2022-05-01'),
        tom: parseISO('2022-05-16')
      }
    ]);
  });

  it('should return the correct arbeidsgiverperiode for one supershort periode', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2022-05-01'),
        tom: parseISO('2022-05-01')
      }
    ];
    expect(finnArbeidsgiverperiode(periode)).toEqual([
      {
        id: '1',
        fom: parseISO('2022-05-01'),
        tom: parseISO('2022-05-01')
      }
    ]);
  });

  it('should return the correct arbeidsgiverperiode for three not so long periode with some time between', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2023-02-06'),
        tom: parseISO('2023-02-09')
      },
      {
        id: '2',
        fom: parseISO('2023-02-12'),
        tom: parseISO('2023-02-15')
      },
      {
        id: '3',
        fom: parseISO('2023-02-22'),
        tom: parseISO('2023-02-25')
      }
    ];
    expect(finnArbeidsgiverperiode(periode)).toEqual([
      {
        id: '1',
        fom: parseISO('2023-02-06'),
        tom: parseISO('2023-02-09')
      },
      {
        id: '2',
        fom: parseISO('2023-02-12'),
        tom: parseISO('2023-02-15')
      },
      {
        id: '3',
        fom: parseISO('2023-02-22'),
        tom: parseISO('2023-02-25')
      }
    ]);
  });

  it('should return the correct arbeidsgiverperiode for three longer periode with some time between', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2023-02-06'),
        tom: parseISO('2023-02-10')
      },
      {
        id: '2',
        fom: parseISO('2023-02-12'),
        tom: parseISO('2023-02-20')
      },
      {
        id: '3',
        fom: parseISO('2023-02-22'),
        tom: parseISO('2023-02-25')
      }
    ];
    expect(finnArbeidsgiverperiode(periode)).toEqual([
      {
        id: '1',
        fom: parseISO('2023-02-06'),
        tom: parseISO('2023-02-20')
      },
      {
        id: '3',
        fom: parseISO('2023-02-22'),
        tom: parseISO('2023-02-22')
      }
    ]);
  });

  it('should return the correct arbeidsgiverperiode periode of 16 days', () => {
    const periode: Array<Periode> = [
      {
        id: '1',
        fom: parseISO('2023-02-01'),
        tom: parseISO('2023-02-16')
      }
    ];
    expect(finnArbeidsgiverperiode(periode)).toEqual([
      {
        id: '1',
        fom: parseISO('2023-02-01'),
        tom: parseISO('2023-02-16')
      }
    ]);
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
    expect(finnArbeidsgiverperiode(periode)).toEqual([
      {
        id: '1',
        fom: parseISO('2023-01-02'),
        tom: parseISO('2023-01-27')
      }
    ]);
  });
});
