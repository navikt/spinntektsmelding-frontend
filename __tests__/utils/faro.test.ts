import { LogLevel } from '@grafana/faro-web-sdk';
import { pinoLevelToFaroLevel } from '../../utils/faro';
import { describe } from 'vitest';

describe('pinoLevelToFaroLevel', () => {
  it('should return trace level', () => {
    expect(pinoLevelToFaroLevel('trace')).toBe(LogLevel.TRACE);
  });

  it('should return debug level', () => {
    expect(pinoLevelToFaroLevel('debug')).toBe(LogLevel.DEBUG);
  });

  it('should return info level', () => {
    expect(pinoLevelToFaroLevel('info')).toBe(LogLevel.INFO);
  });

  it('should return warn level', () => {
    expect(pinoLevelToFaroLevel('warn')).toBe(LogLevel.WARN);
  });

  it('should return error level', () => {
    expect(pinoLevelToFaroLevel('error')).toBe(LogLevel.ERROR);
  });

  it('should throw when errorlevel is unknown', () => {
    expect(() => pinoLevelToFaroLevel('unexpected-level')).toThrowError(`Unknown level: unexpected-level`);
  });
});
