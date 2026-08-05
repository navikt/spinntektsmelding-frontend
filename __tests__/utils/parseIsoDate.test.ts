import parseIsoDate from '../../utils/parseIsoDate';

describe('parseIsoDate', () => {
  it('should parse ISO formated string to date', () => {
    expect(parseIsoDate('2025-12-24')).toEqual(new Date(2025, 11, 24));
  });
});
