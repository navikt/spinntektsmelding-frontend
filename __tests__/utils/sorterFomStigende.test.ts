import { describe, it, expect } from 'vitest';
import sorterFomStigende from '../../utils/sorterFomStigende';
import parseIsoDate from '../../utils/parseIsoDate';
import { tidPeriode } from '../../schema/tidPeriode';

describe('sorterFomStigende', () => {
  it('should return 0 if either fom is undefined', () => {
    const a: tidPeriode = { fom: undefined };
    const b: tidPeriode = { fom: parseIsoDate('2023-01-01')! };
    expect(sorterFomStigende(a, b)).toBe(0);
  });

  it('should return 1 if a.fom is greater than b.fom', () => {
    const a: tidPeriode = { fom: parseIsoDate('2023-02-01')! };
    const b: tidPeriode = { fom: parseIsoDate('2023-01-01')! };
    expect(sorterFomStigende(a, b)).toBe(1);
  });

  it('should return -1 if a.fom is less than b.fom', () => {
    const a: tidPeriode = { fom: parseIsoDate('2023-01-01')! };
    const b: tidPeriode = { fom: parseIsoDate('2023-02-01')! };
    expect(sorterFomStigende(a, b)).toBe(-1);
  });

  it('should return 0 if a.fom is equal to b.fom', () => {
    const a: tidPeriode = { fom: parseIsoDate('2023-01-01')! };
    const b: tidPeriode = { fom: parseIsoDate('2023-01-01')! };
    expect(sorterFomStigende(a, b)).toBe(0);
  });
});
