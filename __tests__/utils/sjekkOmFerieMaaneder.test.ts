import { describe, it, expect } from 'vitest';
import sjekkOmFerieMaaneder from '../../utils/sjekkOmFerieMaaneder';
import { HistoriskInntekt } from '../../schema/HistoriskInntektSchema';

describe('sjekkOmFerieMaaneder', () => {
  it('should return true if there are months between May and August', () => {
    const tidligereinntekt: HistoriskInntekt = new Map([
      ['2023-05', 10000],
      ['2023-06', 15000]
    ]);
    expect(sjekkOmFerieMaaneder(tidligereinntekt)).toBe(true);
  });

  it('should return false if there are no months between May and August', () => {
    const tidligereinntekt: HistoriskInntekt = new Map([
      ['2023-04', 10000],
      ['2023-09', 15000]
    ]);
    expect(sjekkOmFerieMaaneder(tidligereinntekt)).toBe(false);
  });

  it('should return false if tidligereinntekt is undefined', () => {
    expect(sjekkOmFerieMaaneder(undefined)).toBe(false);
  });

  it('should return false if tidligereinntekt is an empty array', () => {
    expect(sjekkOmFerieMaaneder(new Map([]))).toBe(false);
  });
});
