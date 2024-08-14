import testOrganisasjoner from '../../mockdata/testOrganisasjoner';
import { OrganisasjonsnummerSchema } from '../../schema/organisasjonsnummerSchema';

describe('OrganisasjonsnummerSchema', () => {
  it('should validate OrganisasjonsnummerSchema 0', () => {
    const data = testOrganisasjoner[0].organizationNumber;

    expect(OrganisasjonsnummerSchema.safeParse(data).success).toBe(true);
  });

  it('should validate OrganisasjonsnummerSchema 1', () => {
    const data = testOrganisasjoner[1].organizationNumber;

    expect(OrganisasjonsnummerSchema.safeParse(data).success).toBe(true);
  });

  it('should invalidate OrganisasjonsnummerSchema', () => {
    const data = '12345678';

    expect(OrganisasjonsnummerSchema.safeParse(data).success).toBe(false);
  });
});
