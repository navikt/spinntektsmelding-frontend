import validerBekreftelse from '../../validators/validerBekreftelse';
import { expect, it, describe } from 'vitest';

describe('validerBekreftelse', () => {
  it('should return true when stuff is confirmed', () => {
    expect(validerBekreftelse(true)).toBe(true);
  });

  it('should return false when stuff is not confirmed', () => {
    expect(validerBekreftelse(false)).toBe(false);
  });
});
