import { describe, it, expect } from 'vitest';
import { dedupeFeilmeldinger, type FeltFeil } from '../../utils/dedupeFeilmeldinger';

describe('dedupeFeilmeldinger', () => {
  it('fjerner dupliserte strenger og beholder første forekomst', () => {
    const res = dedupeFeilmeldinger(['A', 'B', 'A', 'C', 'B']);
    expect(res).toEqual(['A', 'B', 'C']);
  });

  it('fjerner dupliserte (felt,text)-par', () => {
    const a: FeltFeil = { felt: 'f1', text: 'T1' };
    const b: FeltFeil = { felt: 'f2', text: 'T2' };
    const res = dedupeFeilmeldinger([a, b, { felt: 'f1', text: 'T1' }, b]);
    expect(res).toEqual([a, b]);
  });

  it('behandler ulikt felt med samme text som unike', () => {
    const res = dedupeFeilmeldinger([
      { felt: 'a', text: 'Samme' },
      { felt: 'b', text: 'Samme' }
    ]);
    expect(res.length).toBe(2);
  });

  it('behandler undefined felt likt når text er lik', () => {
    const res = dedupeFeilmeldinger([{ text: 'X' }, { text: 'X' }, { felt: undefined, text: 'X' }]);
    expect(res).toEqual([{ text: 'X' }]);
  });

  it('blandet strenger og objekter dedupes separat', () => {
    const res = dedupeFeilmeldinger(['A', { felt: 'f', text: 'A' }, 'A', { felt: 'f', text: 'A' }]);
    expect(res).toEqual(['A', { felt: 'f', text: 'A' }]);
  });
});
