import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { requireEnv } from '../../../utils/api/validateEnv';

describe('requireEnv', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return env value when set', () => {
    process.env.TEST_VAR = 'test-value';
    expect(requireEnv('TEST_VAR')).toBe('test-value');
  });

  it('should throw error when env var is not set', () => {
    delete process.env.MISSING_VAR;
    expect(() => requireEnv('MISSING_VAR')).toThrow('Missing required environment variable: MISSING_VAR');
  });

  it('should throw error when env var is empty string', () => {
    process.env.EMPTY_VAR = '';
    expect(() => requireEnv('EMPTY_VAR')).toThrow('Missing required environment variable: EMPTY_VAR');
  });

  it('should handle multiple different env vars', () => {
    process.env.VAR_A = 'value-a';
    process.env.VAR_B = 'value-b';
    expect(requireEnv('VAR_A')).toBe('value-a');
    expect(requireEnv('VAR_B')).toBe('value-b');
  });
});
