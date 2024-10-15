import formatDate from '../../utils/formatDate';
import { describe } from 'vitest';

describe.concurrent('formatDate', () => {
  it('shold return a nicely formated date', () => {
    expect(formatDate(new Date(2002, 7, 8))).toBe('08.08.2002');
  });

  it('shold return an empty string when input is rubish', () => {
    expect(formatDate()).toBe('');
  });
});
