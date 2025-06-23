import { z } from 'zod';

const MottattArbeidsgiverSchema = z.object({
  name: z.string(),
  type: z.string(), // e.g. 'Enterprise'
  parentOrganizationNumber: z.string().nullable(),
  organizationForm: z.string(), // e.g. 'KOMM'
  organizationNumber: z.string(), // e.g. '810007672'
  socialSecurityNumber: z.string().nullable(),
  status: z.string() // e.g. 'Active'
});

export type MottattArbeidsgiver = z.infer<typeof MottattArbeidsgiverSchema>;
