import { describe, it, expect } from 'vitest';
import sjekkOmFerieMaaneder from '../../utils/sjekkOmFerieMaaneder';
import { HistoriskInntekt } from '../../schema/historiskInntektSchema';

describe('sjekkOmFerieMaaneder', () => {
  it('should return true if there are months between May and August', () => {
    const tidligereinntekt: Array<HistoriskInntekt> = [
      { maaned: '2023-05', inntekt: 10000 },
      { maaned: '2023-06', inntekt: 15000 }
    ];
    expect(sjekkOmFerieMaaneder(tidligereinntekt)).toBe(true);
  });

  it('should return false if there are no months between May and August', () => {
    const tidligereinntekt: Array<HistoriskInntekt> = [
      { maaned: '2023-04', inntekt: 10000 },
      { maaned: '2023-09', inntekt: 15000 }
    ];
    expect(sjekkOmFerieMaaneder(tidligereinntekt)).toBe(false);
  });

  it('should return false if tidligereinntekt is undefined', () => {
    expect(sjekkOmFerieMaaneder(undefined)).toBe(false);
  });

  it('should return false if tidligereinntekt is an empty array', () => {
    expect(sjekkOmFerieMaaneder([])).toBe(false);
  });
});
