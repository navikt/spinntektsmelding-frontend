import { z } from 'zod/v4';
import { OrganisasjonsnummerSchema } from './OrganisasjonsnummerSchema';

export const OrgNodeSchema: z.ZodType<{
  orgnr: z.infer<typeof OrganisasjonsnummerSchema>;
  navn: string;
  underenheter: any[]; // recursive
}> = z.lazy(() =>
  z.object({
    orgnr: OrganisasjonsnummerSchema,
    navn: z.string(),
    underenheter: z.array(OrgNodeSchema)
  })
);

export type OrgNode = z.infer<typeof OrgNodeSchema>;
