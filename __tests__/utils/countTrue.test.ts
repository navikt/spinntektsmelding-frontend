import { describe, it, expect } from 'vitest';
import { countTrue } from '../../utils/countTrue';

describe('countTrue', () => {
  it('returns 1 for a single true', () => {
    expect(countTrue(true)).toBe(1);
  });

  it('returns 0 for a single false', () => {
    expect(countTrue(false)).toBe(0);
  });

  it('returns 0 for non-boolean primitives', () => {
    expect(countTrue(0)).toBe(0);
    expect(countTrue('true')).toBe(0);
    expect(countTrue(null)).toBe(0);
    expect(countTrue(undefined)).toBe(0);
  });

  it('counts trues in a flat array', () => {
    const data = [true, false, true, true, false];
    expect(countTrue(data)).toBe(3);
  });

  it('counts trues in a nested array', () => {
    const data = [true, [false, [true, [true]]], false];
    expect(countTrue(data)).toBe(3);
  });

  it('counts trues in a flat object', () => {
    const data = { a: true, b: false, c: true };
    expect(countTrue(data)).toBe(2);
  });

  it('counts trues in a nested object', () => {
    const data = {
      x: true,
      y: { y1: false, y2: { y21: true, y22: null } },
      z: { z1: { z11: { z111: true } } }
    };
    expect(countTrue(data)).toBe(3);
  });

  it('counts trues in a mix of arrays and objects', () => {
    const data = [{ a: true, b: [false, true, { c: true }] }, false, [true, { d: false, e: [true, [false, true]] }]];
    // a, b[1], c, array[0], e[0], e[1][1] => 6 trues
    expect(countTrue(data)).toBe(6);
  });

  it('ignores functions and symbols', () => {
    const data = {
      a: true,
      b: () => true,
      c: Symbol('true'),
      d: { nested: true }
    };
    expect(countTrue(data)).toBe(2);
  });
});
