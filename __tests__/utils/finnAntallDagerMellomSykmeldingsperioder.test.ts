import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { finnAntallDagerMellomSykmeldingsperioder } from '../../utils/finnAntallDagerMellomSykmeldingsperioder';

vi.mock('./finnBestemmendeFravaersdag', () => ({
  finnSorterteUnikePerioder: vi.fn()
}));

const mockedSorter = () =>
  (require('./finnBestemmendeFravaersdag') as any).finnSorterteUnikePerioder as ReturnType<typeof vi.fn>;

function p(fom: Date | undefined, tom: Date | undefined) {
  return { fom, tom };
}

describe('finnAntallDagerMellomSykmeldingsperioder', () => {
  beforeEach(() => {
    mockedSorter().mockReset();
  });

  it('returns 0 for empty array', () => {
    mockedSorter().mockReturnValue([]);
    const result = finnAntallDagerMellomSykmeldingsperioder([]);
    expect(result).toBe(0);
    expect(mockedSorter()).toHaveBeenCalledWith([]);
  });

  it('returns 0 for a single period', () => {
    const periods = [p(new Date(2023, 0, 1), new Date(2023, 0, 5))];
    mockedSorter().mockReturnValue(periods);
    const result = finnAntallDagerMellomSykmeldingsperioder(periods);
    expect(result).toBe(0);
  });

  it('returns max gap between multiple periods', () => {
    const a = p(new Date(2023, 0, 1), new Date(2023, 0, 5));
    const b = p(new Date(2023, 0, 10), new Date(2023, 0, 12));
    const c = p(new Date(2023, 0, 20), new Date(2023, 0, 21));
    mockedSorter().mockReturnValue([a, b, c]);
    const result = finnAntallDagerMellomSykmeldingsperioder([c, a, b]); // unsorted input
    expect(result).toBe(8); // max(5,8)
    expect(mockedSorter()).toHaveBeenCalledWith([c, a, b]);
  });

  it('skips periods missing fom or tom (currentValue) in calculation', () => {
    const first = p(new Date(2023, 0, 1), new Date(2023, 0, 5));
    const incomplete = p(undefined, new Date(2023, 0, 10)); // skipped
    const third = p(new Date(2023, 0, 20), new Date(2023, 0, 22));
    mockedSorter().mockReturnValue([first, incomplete, third]);
    const result = finnAntallDagerMellomSykmeldingsperioder([first, incomplete, third]);
    // gaps considered: index 1 skipped; index 2: diff between third.fom (20) and incomplete.tom (10) = 10
    expect(result).toBe(10);
  });

  it('returns larger gap when later gap exceeds earlier one', () => {
    const a = p(new Date(2023, 0, 1), new Date(2023, 0, 2));
    const b = p(new Date(2023, 0, 4), new Date(2023, 0, 5)); // gap 2
    const c = p(new Date(2023, 0, 15), new Date(2023, 0, 16)); // gap 10
    mockedSorter().mockReturnValue([a, b, c]);
    const result = finnAntallDagerMellomSykmeldingsperioder([a, b, c]);
    expect(result).toBe(10);
  });
});
