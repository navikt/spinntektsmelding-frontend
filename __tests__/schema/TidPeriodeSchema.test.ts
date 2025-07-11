import { describe, it, expect } from 'vitest';

import { z } from 'zod';
import { TidPeriode, TidPeriodeSchema } from '../../schema/TidPeriodeSchema';

describe('TidPeriodeSchema', () => {
  it('parses when both fom and tom are valid Date objects', () => {
    const input = { fom: new Date('2021-01-01'), tom: new Date('2021-01-31') };
    const result = TidPeriodeSchema.parse(input);
    expect(result).toEqual(input);
  });

  it('parses when only fom is provided', () => {
    const input = { fom: new Date('2022-02-02') };
    const result = TidPeriodeSchema.parse(input);
    const expected: TidPeriode = { fom: input.fom };
    expect(result).toEqual(expected);
  });

  it('parses when only tom is provided', () => {
    const input = { tom: new Date('2023-03-03') };
    const result = TidPeriodeSchema.parse(input);
    const expected: TidPeriode = { tom: input.tom };
    expect(result).toEqual(expected);
  });

  it('parses when neither fom nor tom is provided', () => {
    const result = TidPeriodeSchema.parse({});
    expect(result).toEqual({});
  });

  it('fails when fom is not a Date', () => {
    const input = { fom: '2021-01-01' };
    const safe = TidPeriodeSchema.safeParse(input);
    expect(safe.success).toBe(false);
    if (!safe.success) {
      expect(safe.error.issues[0].path).toEqual(['fom']);
    }
  });

  it('fails when tom is null', () => {
    const input = { tom: null };
    const safe = TidPeriodeSchema.safeParse(input);
    expect(safe.success).toBe(false);
    if (!safe.success) {
      expect(safe.error.issues[0].path).toEqual(['tom']);
    }
  });

  it('removes extra unknown fields', () => {
    const input = { extra: 123 };
    const safe = TidPeriodeSchema.safeParse(input);
    // Unknown keys are allowed but we want to ensure invalid types for our schema don't slip through
    expect(safe.success).toBe(true);
    expect((safe.data as any).extra).toBeUndefined();
    // But parsing the known fields still yields an empty object
    expect(Object.keys(safe.data)).toEqual([]);
  });
});
