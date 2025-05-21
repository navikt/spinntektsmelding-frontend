import { RefusjonEndringSchema } from '../../schema/ApiRefusjonEndringSchema';

describe('RefusjonEndringSchema', () => {
  it('should validate RefusjonEndringSchema', () => {
    const data = {
      startdato: '2021-01-01',
      beloep: 1000
    };

    const expected = {
      startdato: '2021-01-01',
      beloep: 1000
    };

    const parsed = RefusjonEndringSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });

  it('should invalidate RefusjonEndringSchema', () => {
    const data = {
      beloep: 1000
    };

    expect(RefusjonEndringSchema.safeParse(data).success).toBe(false);
  });
});
