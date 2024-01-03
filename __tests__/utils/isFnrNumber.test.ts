import isFnrNumber from '../../utils/isFnrNumber';

describe('isFnrNumber', () => {
  it('returns true for a valid FNR number', () => {
    const validFnr = '10107400090';
    const result = isFnrNumber(validFnr);
    expect(result).toBe(true);
  });

  it('returns false for an invalid FNR number', () => {
    const invalidFnr = '123456789';
    const result = isFnrNumber(invalidFnr);
    expect(result).toBe(false);
  });
});
