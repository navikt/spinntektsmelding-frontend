import { ApiPeriodeSchema } from '../../schema/ApiPeriodeSchema';

describe('ApiPeriodeSchema', () => {
  it('should not validate wrong ApiPeriodeSchema', () => {
    const data = {
      fom: new Date('2021-01-01'),
      tom: new Date('2021-01-02')
    };

    const expected = {
      fom: '2021-01-01',
      tom: '2021-01-02'
    };

    const parsed = ApiPeriodeSchema.safeParse(data);
    expect(parsed.success).toBe(false);
    expect(parsed.data).not.toEqual(expected);
  });

  it('should validate ApiPeriodeSchema', () => {
    const data = {
      fom: '2021-01-01',
      tom: '2021-01-02'
    };

    const expected = {
      fom: '2021-01-01',
      tom: '2021-01-02'
    };

    const parsed = ApiPeriodeSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual(expected);
  });
});
