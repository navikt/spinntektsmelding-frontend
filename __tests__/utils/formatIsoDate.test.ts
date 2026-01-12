import { describe, it, expect } from 'vitest';
import formatIsoDate from '../../utils/formatIsoDate';

describe.concurrent('formatIsoDate', () => {
  it('shold return a nicely formated date', () => {
    expect(formatIsoDate(new Date(2002, 7, 8))).toBe('2002-08-08');
  });

  it('shold return an empty string when input is rubish', () => {
    expect(formatIsoDate()).toBeUndefined();
  });

  it('shold return a blank when the date is illegal', () => {
    expect(formatIsoDate(new Date(-9, -13 / 0, -18))).toBeUndefined();
  });
});
