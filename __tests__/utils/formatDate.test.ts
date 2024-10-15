import formatDate from '../../utils/formatDate';
import { describe } from 'vitest';

describe.concurrent('formatDate', () => {
  it('should return a nicely formatted date', () => {
    expect(formatDate(new Date(2002, 7, 8))).toBe('08.08.2002');
  });

  it('should return an empty string when input is rubbish', () => {
    expect(formatDate()).toBe('');
  });
});
