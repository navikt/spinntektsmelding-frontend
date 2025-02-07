import { describe, it, expect } from 'vitest';
import safelyParseJSON from '../../utils/safelyParseJson';

describe('safelyParseJSON', () => {
  it('should parse valid JSON response', async () => {
    const mockResponse = {
      json: async () => ({ key: 'value' })
    } as Response;

    const result = await safelyParseJSON(mockResponse);
    expect(result).toEqual({ key: 'value' });
  });

  it('should return empty array for invalid JSON response', async () => {
    const mockResponse = {
      json: async () => {
        throw new Error('Invalid JSON');
      }
    } as unknown as Response;

    const result = await safelyParseJSON(mockResponse);
    expect(result).toEqual([]);
  });
});
