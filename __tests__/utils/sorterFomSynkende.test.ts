import { describe, it, expect } from 'vitest';
import sorterFomSynkende from '../../utils/sorterFomSynkende';
import { TidPeriodeSchema } from '../../schema/TidPeriodeSchema';

describe('sorterFomSynkende', () => {
  it('should return 0 if either fom is undefined', () => {
    const a: TidPeriodeSchema = { fom: undefined };
    const b: TidPeriodeSchema = { fom: new Date() };
    expect(sorterFomSynkende(a, b)).toBe(0);
  });

  it('should return 1 if a.fom is less than b.fom', () => {
    const a: TidPeriodeSchema = { fom: new Date('2021-01-01') };
    const b: TidPeriodeSchema = { fom: new Date('2022-01-01') };
    expect(sorterFomSynkende(a, b)).toBe(1);
  });

  it('should return -1 if a.fom is greater than b.fom', () => {
    const a: TidPeriodeSchema = { fom: new Date('2022-01-01') };
    const b: TidPeriodeSchema = { fom: new Date('2021-01-01') };
    expect(sorterFomSynkende(a, b)).toBe(-1);
  });

  it('should return 0 if a.fom is equal to b.fom', () => {
    const a: TidPeriodeSchema = { fom: new Date('2022-01-01') };
    const b: TidPeriodeSchema = { fom: new Date('2022-01-01') };
    expect(sorterFomSynkende(a, b)).toBe(0);
  });
});
