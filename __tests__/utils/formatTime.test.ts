import formatTime from '../../utils/formatTime';
import timezone_mock from 'timezone-mock';

timezone_mock.register('UTC');

describe('formatTime', () => {
  it('formats a date correctly', () => {
    const date = new Date('2022-01-01T12:34:56Z');
    expect(formatTime(date)).toEqual('12:34');
  });

  it('formats a date with leading zeros correctly', () => {
    const date = new Date('2022-01-01T09:08:07Z');
    expect(formatTime(date)).toEqual('09:08');
  });
});
