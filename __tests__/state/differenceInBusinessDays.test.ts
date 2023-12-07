import differenceInBusinessDays from '../../utils/differenceInBusinessDays';

describe('differenceInBusinessDays', () => {
  it('should return the correct number of business days between two dates', () => {
    const endDate = new Date(2022, 0, 19); // Wednesday
    const startDate = new Date(2022, 0, 16); // Sunday
    expect(differenceInBusinessDays(endDate, startDate)).toBe(2);
  });

  it('should return a negative number of business days if the start date is after the end date', () => {
    const endDate = new Date(2022, 0, 14); // Friday
    const startDate = new Date(2022, 0, 19); // Wednesday
    expect(differenceInBusinessDays(endDate, startDate)).toBe(-3);
  });

  it('should return 0 if the start date and end date are the same', () => {
    const endDate = new Date(2022, 0, 19); // Wednesday
    const startDate = new Date(2022, 0, 19); // Wednesday
    expect(differenceInBusinessDays(endDate, startDate)).toBe(0);
  });

  it('should include the end date in the calculation if includeEndDate option is true', () => {
    const endDate = new Date(2022, 0, 14); // Friday
    const startDate = new Date(2022, 0, 19); // Wednesday
    const options = { includeEndDate: true };
    expect(differenceInBusinessDays(endDate, startDate, options)).toBe(-4);
  });

  it('should exclude the start date from the calculation if includeStartDate option is false', () => {
    const endDate = new Date(2022, 0, 19); // Wednesday
    const startDate = new Date(2022, 0, 14); // Friday
    const options = { includeStartDate: false };
    expect(differenceInBusinessDays(endDate, startDate, options)).toBe(2);
  });

  // Add more test cases as needed
});
