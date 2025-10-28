import { describe, it, expect } from 'vitest';
import getEgenmeldingsperioderFromSykmelding from '../../utils/getEgenmeldingsperioderFromSykmelding';

describe('getEgenmeldingsperioderFromSykmelding', () => {
  it('returns empty array for empty input', () => {
    expect(getEgenmeldingsperioderFromSykmelding([])).toEqual([]);
  });

  it('returns empty array when period has no egenmeldingsdagerFraSykmelding', () => {
    expect(getEgenmeldingsperioderFromSykmelding([{ other: 'value' }])).toEqual([]);
  });

  it('merges unordered contiguous dates into a single period', () => {
    const input = [
      {
        egenmeldingsdagerFraSykmelding: ['2024-01-05', '2024-01-03', '2024-01-04']
      }
    ];
    expect(getEgenmeldingsperioderFromSykmelding(input)).toEqual([{ fom: '2024-01-03', tom: '2024-01-05' }]);
  });

  it('splits periods when there is a gap larger than one day', () => {
    const input = [
      {
        egenmeldingsdagerFraSykmelding: ['2024-01-01', '2024-01-02', '2024-01-04']
      }
    ];
    expect(getEgenmeldingsperioderFromSykmelding(input)).toEqual([
      { fom: '2024-01-01', tom: '2024-01-02' },
      { fom: '2024-01-04', tom: '2024-01-04' }
    ]);
  });

  it('handles duplicate dates correctly', () => {
    const input = [
      {
        egenmeldingsdagerFraSykmelding: ['2024-01-01', '2024-01-01', '2024-01-02']
      }
    ];
    expect(getEgenmeldingsperioderFromSykmelding(input)).toEqual([{ fom: '2024-01-01', tom: '2024-01-02' }]);
  });

  it('processes multiple sykmelding periods separately', () => {
    const input = [
      { egenmeldingsdagerFraSykmelding: ['2024-01-01', '2024-01-02'] },
      { egenmeldingsdagerFraSykmelding: ['2024-01-10', '2024-01-11'] }
    ];
    expect(getEgenmeldingsperioderFromSykmelding(input)).toEqual([
      { fom: '2024-01-01', tom: '2024-01-02' },
      { fom: '2024-01-10', tom: '2024-01-11' }
    ]);
  });

  it('does not merge adjacent days across different periods', () => {
    const input = [
      { egenmeldingsdagerFraSykmelding: ['2024-01-01'] },
      { egenmeldingsdagerFraSykmelding: ['2024-01-02'] }
    ];
    expect(getEgenmeldingsperioderFromSykmelding(input)).toEqual([
      { fom: '2024-01-01', tom: '2024-01-01' },
      { fom: '2024-01-02', tom: '2024-01-02' }
    ]);
  });

  it('returns empty when egenmeldingsdagerFraSykmelding is empty array', () => {
    const input = [{ egenmeldingsdagerFraSykmelding: [] }];
    expect(getEgenmeldingsperioderFromSykmelding(input)).toEqual([]);
  });
});
