import { describe, it, expect } from 'vitest';
import sorterFomSynkende from '../../utils/sorterFomSynkende';
import { TidPeriode } from '../../schema/TidPeriodeSchema';

describe('sorterFomSynkende', () => {
  it('should return 0 if either fom is undefined', () => {
    const a: TidPeriode = { fom: undefined };
    const b: TidPeriode = { fom: new Date() };
    expect(sorterFomSynkende(a, b)).toBe(0);
  });

  it('should return 1 if a.fom is less than b.fom', () => {
    const a: TidPeriode = { fom: new Date('2021-01-01') };
    const b: TidPeriode = { fom: new Date('2022-01-01') };
    expect(sorterFomSynkende(a, b)).toBe(1);
  });

  it('should return -1 if a.fom is greater than b.fom', () => {
    const a: TidPeriode = { fom: new Date('2022-01-01') };
    const b: TidPeriode = { fom: new Date('2021-01-01') };
    expect(sorterFomSynkende(a, b)).toBe(-1);
  });

  it('should return 0 if a.fom is equal to b.fom', () => {
    const a: TidPeriode = { fom: new Date('2022-01-01') };
    const b: TidPeriode = { fom: new Date('2022-01-01') };
    expect(sorterFomSynkende(a, b)).toBe(0);
  });
});
