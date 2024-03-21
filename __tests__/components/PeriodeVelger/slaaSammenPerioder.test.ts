import slaaSammenPerioder, { SammenslaattPeriode } from '../../../components/PeriodeVelger/slaaSammenPerioder';

describe('sammenslaattePerioder', () => {
  it('should merge consecutive periods with less than 16 days gap', () => {
    const perioder = [
      { fom: new Date('2022-01-01'), tom: new Date('2022-01-10'), id: '1' },
      { fom: new Date('2022-01-11'), tom: new Date('2022-01-20'), id: '2' },
      { fom: new Date('2022-01-21'), tom: new Date('2022-01-25'), id: '3' }
    ];

    const result = slaaSammenPerioder(perioder);

    const expected: SammenslaattPeriode[] = [
      {
        fom: new Date('2022-01-01'),
        tom: new Date('2022-01-25'),
        id: '3',
        periode: [
          { fom: new Date('2022-01-01'), tom: new Date('2022-01-10'), id: '1' },
          { fom: new Date('2022-01-11'), tom: new Date('2022-01-20'), id: '2' },
          { fom: new Date('2022-01-21'), tom: new Date('2022-01-25'), id: '3' }
        ]
      }
    ];

    expect(result).toEqual(expected);
  });

  it('should not merge periods with more than 16 days gap', () => {
    const perioder = [
      { fom: new Date('2022-01-01'), tom: new Date('2022-01-05'), id: '1' },
      { fom: new Date('2022-01-22'), tom: new Date('2022-01-25'), id: '2' }
    ];

    const result = slaaSammenPerioder(perioder);

    const expected: SammenslaattPeriode[] = [
      { fom: new Date('2022-01-22'), tom: new Date('2022-01-25'), id: '2' },
      { fom: new Date('2022-01-01'), tom: new Date('2022-01-05'), id: '1' }
    ];

    expect(result).toEqual(expected);
  });

  it('should handle empty input', () => {
    const perioder: SammenslaattPeriode[] = [];

    const result = slaaSammenPerioder(perioder);

    const expected: SammenslaattPeriode[] = [];

    expect(result).toEqual(expected);
  });
});
