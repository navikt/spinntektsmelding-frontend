import isValidUUID from '../../utils/isValidUUID';
import { describe, it, expect } from 'vitest';

describe.concurrent('isValidUUID', () => {
  it('shold return true for the correct number of digits', () => {
    expect(isValidUUID('12345678-3456-5678-2457-123456789012')).toBeTruthy();
  });

  it('shold return return true for a valid UUID', () => {
    expect(isValidUUID('8d50ef20-37b5-4829-ad83-56219e70b375')).toBeTruthy();
  });

  it('shold return false for some random nonsens', () => {
    expect(isValidUUID('randomno-nsen-s829-ad83-56219e70b375')).toBeFalsy();
  });
});
