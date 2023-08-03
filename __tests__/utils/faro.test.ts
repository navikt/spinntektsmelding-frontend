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

  it('should throw when errorlevel is undefined', () => {
    expect(() => pinoLevelToFaroLevel(undefined)).toThrowError(`Unknown level: undefined`);
  });

  it('should throw when errorlevel is null', () => {
    expect(() => pinoLevelToFaroLevel(null)).toThrowError(`Unknown level: null`);
  });

  it('should throw when errorlevel is empty string', () => {
    expect(() => pinoLevelToFaroLevel('')).toThrowError(`Unknown level: `);
  });

  it('should throw when errorlevel is number', () => {
    expect(() => pinoLevelToFaroLevel(1)).toThrowError(`Unknown level: 1`);
  });

  it('should throw when errorlevel is object', () => {
    expect(() => pinoLevelToFaroLevel({})).toThrowError(`Unknown level: [object Object]`);
  });

  it('should throw when errorlevel is array', () => {
    expect(() => pinoLevelToFaroLevel([])).toThrowError(`Unknown level: `);
  });

  it('should throw when errorlevel is boolean', () => {
    expect(() => pinoLevelToFaroLevel(true)).toThrowError(`Unknown level: true`);
  });
});
