import numberOfDaysInRanges from '../../utils/numberOfDaysInRanges';

describe('numberOfDaysInRange', () => {
  it('should return two when start and end is adjacent', () => {
    expect(numberOfDaysInRanges([{ fom: new Date(2023, 1, 1), tom: new Date(2023, 1, 2), id: '1' }])).toBe(2);
  });

  it('should return 7 when start and end is 3 days appart and start and end is 2 days apart, in 2 periods', () => {
    expect(
      numberOfDaysInRanges([
        { fom: new Date(2023, 1, 1), tom: new Date(2023, 1, 2), id: '1' },
        { fom: new Date(2023, 2, 1), tom: new Date(2023, 2, 5), id: '2' }
      ])
    ).toBe(7);
  });

  it('should return 12 when we have periods of 2, 5 and 5 days', () => {
    expect(
      numberOfDaysInRanges([
        { fom: new Date(2023, 1, 1), tom: new Date(2023, 1, 2), id: '1' },
        { fom: new Date(2023, 2, 1), tom: new Date(2023, 2, 5), id: '2' },
        { fom: new Date(2023, 3, 1), tom: new Date(2023, 3, 5), id: '3' }
      ])
    ).toBe(12);
  });

  it('should return two when start and end is adjacent, FravaaersPeriode', () => {
    expect(numberOfDaysInRanges([{ fom: new Date(2023, 1, 1), tom: new Date(2023, 1, 2) }])).toBe(2);
  });

  it('should return 7 when start and end is 3 days appart and start and end is 2 days apart, in 2 periods, FravaaersPeriode', () => {
    expect(
      numberOfDaysInRanges([
        { fom: new Date(2023, 1, 1), tom: new Date(2023, 1, 2) },
        { fom: new Date(2023, 2, 1), tom: new Date(2023, 2, 5) }
      ])
    ).toBe(7);
  });

  it('should return 12 when we have periods of 2, 5 and 5 days, FravaaersPeriode', () => {
    expect(
      numberOfDaysInRanges([
        { fom: new Date(2023, 1, 1), tom: new Date(2023, 1, 2) },
        { fom: new Date(2023, 2, 1), tom: new Date(2023, 2, 5) },
        { fom: new Date(2023, 3, 1), tom: new Date(2023, 3, 5) }
      ])
    ).toBe(12);
  });
});
