import { harGyldigeRefusjonEndringer } from '../../utils/harGyldigeRefusjonEndringer';

describe('harGyldigeRefusjonEndringer', () => {
  it('should return true if refusjonEndringer is defined and has at least one valid endring', () => {
    expect(harGyldigeRefusjonEndringer([{ dato: new Date(), belop: 1000 }])).toBe(true);
  });

  it('should return false if refusjonEndringer is undefined', () => {
    expect(harGyldigeRefusjonEndringer(undefined)).toBe(false);
  });

  it('should return false if refusjonEndringer is defined but has no valid endringer', () => {
    expect(harGyldigeRefusjonEndringer([{ dato: undefined, belop: undefined }])).toBe(false);
  });

  it('should return false if refusjonEndringer is defined but has no valid endringer, e.g. belop is negative', () => {
    expect(harGyldigeRefusjonEndringer([{ dato: undefined, belop: -1 }])).toBe(false);
  });
});
