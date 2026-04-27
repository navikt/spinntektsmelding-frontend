import { z } from 'zod';

const AnsettelsesforholdSchema = z.object({
  ansettelsesperioder: z.array(
    z.object({
      fom: z.string().min(1),
      tom: z.string().nullable(),
      arbeidsforholdId: z.string().min(1),
      yrkeskode: z.string().min(1),
      yrkestittel: z.string().min(1).optional(),
      stillingsprosent: z.number().min(0).max(100).optional()
    })
  )
});

export type Ansettelsesforhold = z.infer<typeof AnsettelsesforholdSchema>;
