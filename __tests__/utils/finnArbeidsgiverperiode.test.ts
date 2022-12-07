import { parseISO } from 'date-fns';
import { Periode } from '../../state/state';
import finnArbeidsgiverperiode from '../../utils/finnArbeidsgiverperiode';

describe('finnArbeidsgiverperiode', () => {
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
        fom: parseISO('2022-11-12'),
        tom: parseISO('2022-11-15')
      },
      {
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
        fom: parseISO('2022-12-12'),
        tom: parseISO('2022-12-25')
      }
    ]);
  });
});
