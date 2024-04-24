import parseIsoDate from '../../utils/parseIsoDate';
import perioderInneholderHelgeopphold from '../../utils/perioderInneholderHelgeopphold';
import timezone_mock from 'timezone-mock';

timezone_mock.register('UTC');

describe('perioderInneholderHelgeopphold', () => {
  it('should return true if perioder contain a weekend gap of 2-3 days between Friday and Monday', () => {
    const perioder = [
      { fom: parseIsoDate('2022-01-10'), tom: parseIsoDate('2022-01-14'), id: '2' },
      { fom: parseIsoDate('2022-01-01'), tom: parseIsoDate('2022-01-07'), id: '1' }
    ];
    expect(perioderInneholderHelgeopphold(perioder)).toBe(true);
  });

  it('should return false if perioder do not contain a weekend gap of 2-3 days between Friday and Monday', () => {
    const perioder = [
      { fom: parseIsoDate('2022-01-05'), tom: parseIsoDate('2022-01-07'), id: '2' },
      { fom: parseIsoDate('2022-01-01'), tom: parseIsoDate('2022-01-03'), id: '1' }
    ];
    expect(perioderInneholderHelgeopphold(perioder)).toBe(false);
  });

  it('should return true if perioder contain a weekend gap of 1 day', () => {
    const perioder = [
      { fom: parseIsoDate('2022-01-09'), tom: parseIsoDate('2022-01-13'), id: '2' },
      { fom: parseIsoDate('2022-01-01'), tom: parseIsoDate('2022-01-07'), id: '1' }
    ];
    expect(perioderInneholderHelgeopphold(perioder)).toBe(true);
  });

  it('should return false if perioder contain a weekend gap of more than 3 days', () => {
    const perioder = [
      { fom: parseIsoDate('2022-01-01'), tom: parseIsoDate('2022-01-04'), id: '1' },
      { fom: parseIsoDate('2022-01-06'), tom: parseIsoDate('2022-01-08'), id: '2' }
    ];
    expect(perioderInneholderHelgeopphold(perioder)).toBe(false);
  });

  it('should return false if perioder contain invalid dates', () => {
    const perioder = [
      { fom: undefined, tom: parseIsoDate('2022-01-03'), id: '1' },
      { fom: parseIsoDate('2022-01-06'), tom: undefined, id: '2' }
    ];
    expect(perioderInneholderHelgeopphold(perioder)).toBe(false);
  });

  it('should return true if perioder contain weekend gap', () => {
    const perioder = [
      {
        fom: new Date('2024-02-20T00:00:00.000Z'),
        tom: new Date('2024-03-01T00:00:00.000Z'),
        id: 'UoNlt6XCeouVcU8tCbYvF'
      },
      {
        id: 'ec1n_P5F_G2iXCTq-foFg',
        tom: new Date('2024-03-08T00:00:00.000Z'),
        fom: new Date('2024-03-04T00:00:00.000Z')
      }
    ];

    expect(perioderInneholderHelgeopphold(perioder)).toBe(true);
  });
});
