import { describe, expect } from 'vitest';
import roundTwoDecimals from '../../utils/roundTwoDecimals';

describe.concurrent('roundTwoDecimals', () => {
  it('should round to two desimals when there are more than two desimals', () => {
    expect(roundTwoDecimals(12345.6789)).toBe(12345.68);
  });

  it('should do nothing when there are less than two desimals', () => {
    expect(roundTwoDecimals(12345)).toBe(12345);
  });

  it('should round down to two desimals when there are more than two small desimals', () => {
    expect(roundTwoDecimals(12345.1234)).toBe(12345.12);
  });
});
