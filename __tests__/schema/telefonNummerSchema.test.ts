import { TelefonNummerSchema } from '../../schema/TelefonNummerSchema';

describe('TelefonNummerSchema', () => {
  it('should validate TelefonNummerSchema', () => {
    const data = '12345678';

    expect(TelefonNummerSchema.safeParse(data).success).toBe(true);
  });

  it('should invalidate TelefonNummerSchema', () => {
    const data = '12345';

    const parsed = TelefonNummerSchema.safeParse(data);
    expect(parsed.success).toBe(false);
    expect(parsed.error).toBeDefined();
    expect(parsed?.error?.issues).toEqual([
      {
        code: 'too_small',
        inclusive: true,
        message: 'Telefonnummeret er for kort, det må være 8 siffer',
        minimum: 8,
        origin: 'string',
        path: []
      },
      {
        code: 'custom',
        path: [],
        message: 'Telefonnummeret er ikke gyldig'
      }
    ]);
  });

  it('should invalidate TelefonNummerSchema', () => {
    const data = 'abcdefgh';

    const parsed = TelefonNummerSchema.safeParse(data);
    expect(parsed.success).toBe(false);
    expect(parsed.error).toBeDefined();
    expect(parsed?.error?.issues).toEqual([
      {
        code: 'custom',
        path: [],
        message: 'Telefonnummeret er ikke gyldig'
      }
    ]);
  });

  it('should invalidate TelefonNummerSchema for invalid_type', () => {
    const data = 'abcdefgh';

    const parsed = TelefonNummerSchema.safeParse(new Date());
    expect(parsed.success).toBe(false);
    expect(parsed.error).toBeDefined();
    expect(parsed?.error?.issues).toEqual([
      {
        code: 'invalid_type',
        path: [],
        expected: 'string',
        message: 'Dette er ikke et telefonnummer'
      }
    ]);
  });

  it('should invalidate TelefonNummerSchema for manglende data', () => {
    const data = 'abcdefgh';

    const parsed = TelefonNummerSchema.safeParse(undefined);
    expect(parsed.success).toBe(false);
    expect(parsed.error).toBeDefined();
    expect(parsed?.error?.issues).toEqual([
      {
        code: 'invalid_type',
        path: [],
        expected: 'string',
        message: 'Dette er ikke et telefonnummer'
      }
    ]);
  });
  it('should invalidate TelefonNummerSchema for streng som starter med + og er kort', () => {
    const data = 'abcdefgh';

    const parsed = TelefonNummerSchema.safeParse('+123478');
    expect(parsed.success).toBe(false);
    expect(parsed.error).toBeDefined();
    expect(parsed?.error?.issues).toEqual([
      {
        code: 'too_small',
        inclusive: true,
        message: 'Telefonnummeret er for kort, det må være 8 siffer',
        minimum: 8,
        origin: 'string',
        path: []
      },
      {
        code: 'custom',
        message: 'Telefonnummeret er ikke gyldig',
        path: []
      }
    ]);
  });

  it('should invalidate TelefonNummerSchema for streng som starter med + og er kort', () => {
    const data = 'abcdefgh';

    const parsed = TelefonNummerSchema.safeParse('+1234578');
    expect(parsed.success).toBe(false);
    expect(parsed.error).toBeDefined();
    expect(parsed?.error?.issues).toEqual([
      {
        code: 'custom',
        message: 'Telefonnummeret er ikke gyldig',
        path: []
      }
    ]);
  });

  it('international number with + prefix is ok', () => {
    const data = 'abcdefgh';

    const parsed = TelefonNummerSchema.safeParse('+4712345678');
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual('+4712345678');
  });

  it('international number with 00 prefix is ok', () => {
    const data = 'abcdefgh';

    const parsed = TelefonNummerSchema.safeParse('004712345678');
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual('004712345678');
  });
});
