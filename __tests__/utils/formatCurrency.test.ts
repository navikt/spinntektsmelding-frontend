import formatCurrency from '../../utils/formatCurrency';

describe('formatCurrency', () => {
  it('should return a correctly rounded number for 123', () => {
    expect(formatCurrency(123)).toBe('123,00');
  });

  it('should return a correctly rounded number for 35678.4', () => {
    expect(formatCurrency(35678.4)).toMatch(/35\s678,40/);
  });

  it('should return a correctly rounded number for 0', () => {
    expect(formatCurrency(0)).toBe('0,00');
  });

  it('should return a correctly rounded number for 123.4567', () => {
    expect(formatCurrency(123.4567)).toBe('123,46');
  });

  it('should return a correctly rounded number for undefined', () => {
    expect(formatCurrency(undefined)).toBe('');
  });
});
