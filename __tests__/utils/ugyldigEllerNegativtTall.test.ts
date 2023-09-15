import ugyldigEllerNegativtTall from '../../utils/ugyldigEllerNegativtTall';

describe('ugyldigEllerNegativtTall', () => {
  it('ugyldigEllerNegativtTall returns true for negative numbers', () => {
    const result = ugyldigEllerNegativtTall(-1);
    expect(result).toBe(true);
  });

  it('ugyldigEllerNegativtTall returns true for NaN', () => {
    const result = ugyldigEllerNegativtTall(NaN);
    expect(result).toBe(true);
  });

  it('ugyldigEllerNegativtTall returns true for null', () => {
    const result = ugyldigEllerNegativtTall(null);
    expect(result).toBe(true);
  });

  it('ugyldigEllerNegativtTall returns true for undefined', () => {
    const result = ugyldigEllerNegativtTall(undefined);
    expect(result).toBe(true);
  });

  it('ugyldigEllerNegativtTall returns false for positive numbers', () => {
    const result = ugyldigEllerNegativtTall(1);
    expect(result).toBe(false);
  });

  it('ugyldigEllerNegativtTall returns false for zero', () => {
    const result = ugyldigEllerNegativtTall(0);
    expect(result).toBe(false);
  });
});
