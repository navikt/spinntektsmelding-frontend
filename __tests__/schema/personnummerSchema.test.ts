import { PersonnummerSchema } from '../../schema/personnummerSchema';

describe('PersonnummerSchema', () => {
  it('should validate PersonnummerSchema', () => {
    const data = '10107400090';

    expect(PersonnummerSchema.safeParse(data).success).toBe(true);
  });

  it('should invalidate PersonnummerSchema', () => {
    const data = '12345678';

    expect(PersonnummerSchema.safeParse(data).success).toBe(false);
  });
});
