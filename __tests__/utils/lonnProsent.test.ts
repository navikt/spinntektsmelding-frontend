import lonnProsent from '../../utils/lonnProsent';

describe('lonnProsent', () => {
  it('should return half', () => {
    expect(lonnProsent(100000, 50)).toBe(50000);
  });

  it('should return a quarter', () => {
    expect(lonnProsent(100000, 25)).toBe(25000);
  });

  it('should return three quarters', () => {
    expect(lonnProsent(100000, 75)).toBe(75000);
  });
});
