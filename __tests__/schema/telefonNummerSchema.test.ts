import { TelefonNummerSchema } from '../../schema/telefonNummerSchema';

describe('TelefonNummerSchema', () => {
  it('should validate TelefonNummerSchema', () => {
    const data = '12345678';

    expect(TelefonNummerSchema.safeParse(data).success).toBe(true);
  });

  it('should invalidate TelefonNummerSchema', () => {
    const data = '12345';

    expect(TelefonNummerSchema.safeParse(data).success).toBe(false);
  });
});
