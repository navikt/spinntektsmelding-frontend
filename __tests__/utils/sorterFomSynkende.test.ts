import { describe, it, expect } from 'vitest';
import sorterFomSynkende from '../../utils/sorterFomSynkende';
import { tidPeriode } from '../../utils/finnBestemmendeFravaersdag';

describe('sorterFomSynkende', () => {
  it('should return 0 if either fom is undefined', () => {
    const a: tidPeriode = { fom: undefined };
    const b: tidPeriode = { fom: new Date() };
    expect(sorterFomSynkende(a, b)).toBe(0);
  });

  it('should return 1 if a.fom is less than b.fom', () => {
    const a: tidPeriode = { fom: new Date('2021-01-01') };
    const b: tidPeriode = { fom: new Date('2022-01-01') };
    expect(sorterFomSynkende(a, b)).toBe(1);
  });

  it('should return -1 if a.fom is greater than b.fom', () => {
    const a: tidPeriode = { fom: new Date('2022-01-01') };
    const b: tidPeriode = { fom: new Date('2021-01-01') };
    expect(sorterFomSynkende(a, b)).toBe(-1);
  });

  it('should return 0 if a.fom is equal to b.fom', () => {
    const a: tidPeriode = { fom: new Date('2022-01-01') };
    const b: tidPeriode = { fom: new Date('2022-01-01') };
    expect(sorterFomSynkende(a, b)).toBe(0);
  });
});
