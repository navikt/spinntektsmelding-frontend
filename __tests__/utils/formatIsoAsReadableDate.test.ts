import { describe } from 'vitest';
import formatIsoAsReadableDate from '../../utils/formatIsoAsReadableDate';

describe.concurrent('formatIsoAsReadableDate', () => {
  it('should return a nicely formated date', () => {
    expect(formatIsoAsReadableDate(new Date(2002, 7, 8))).toBe('08.08.2002');
  });

  it('shold return an empty string when input is rubish', () => {
    expect(formatIsoAsReadableDate()).toBe('');
  });
});
