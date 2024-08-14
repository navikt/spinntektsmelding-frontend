import { apiPeriodeSchema } from '../../schema/apiPeriodeSchema';

describe('apiPeriodeSchema', () => {
  it('should not validate wrong apiPeriodeSchema', () => {
    const data = {
      fom: new Date('2021-01-01'),
      tom: new Date('2021-01-02')
    };

    const expected = {
      fom: '2021-01-01',
      tom: '2021-01-02'
    };

    const parsed = apiPeriodeSchema.safeParse(data);
    expect(parsed.success).toBe(false);
    expect(parsed.data).not.toEqual(expected);
  });

  it('should validate apiPeriodeSchema', () => {
    const data = {
      fom: '2021-01-01',
      tom: '2021-01-02'
    };

    const expected = {
      fom: '2021-01-01',
      tom: '2021-01-02'
    };

    const parsed = apiPeriodeSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });
});
