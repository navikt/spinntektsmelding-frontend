import formatMaanedsnavn from '../../utils/formatMaanedsnavn';

describe.concurrent('formatMaanedsnavn', () => {
  it('should return Januar for 2002-01', () => {
    expect(formatMaanedsnavn('2002-01')).toBe('Januar');
  });

  it('should return Mai for 2002-05', () => {
    expect(formatMaanedsnavn('2002-05')).toBe('Mai');
  });

  it('should return Oktober for 2004-10', () => {
    expect(formatMaanedsnavn('2004-10')).toBe('Oktober');
  });

  it('should return "" for 00-00', () => {
    expect(formatMaanedsnavn('00-00')).toBe('');
  });

  it('should return "" for 99-99', () => {
    expect(formatMaanedsnavn('99-99')).toBe('');
  });

  it('should return "" for 9999', () => {
    expect(formatMaanedsnavn('9999')).toBe('');
  });
});
