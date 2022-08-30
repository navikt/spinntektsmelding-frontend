import formatIsoDate from '../../utils/formatIsoDate';

describe('formatIsoDate', () => {
  it('shold return a nicely formated date', () => {
    expect(formatIsoDate(new Date(2002, 7, 8))).toBe('2002-08-08');
  });

  it('shold return an empty string when input is rubish', () => {
    expect(formatIsoDate()).toBe('');
  });
});
