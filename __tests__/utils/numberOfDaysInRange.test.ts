import numberOfDaysInRange from '../../utils/numberOfDaysInRange';

describe('numberOfDaysInRange', () => {
  it('should return two when start and end is adjacent', () => {
    expect(numberOfDaysInRange(new Date(2023, 1, 1), new Date(2023, 1, 2))).toBe(2);
  });

  it('should return 5 when start and end is 3 days appart', () => {
    expect(numberOfDaysInRange(new Date(2023, 1, 1), new Date(2023, 1, 5))).toBe(5);
  });

  it('should return 1 when start and end is the same', () => {
    expect(numberOfDaysInRange(new Date(2023, 1, 1), new Date(2023, 1, 5))).toBe(5);
  });

  it('should return 33 when start and end is 31 days apart', () => {
    expect(numberOfDaysInRange(new Date(2023, 1, 1), new Date(2023, 2, 5))).toBe(33);
  });
});
