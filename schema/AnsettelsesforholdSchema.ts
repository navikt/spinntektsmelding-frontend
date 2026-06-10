import { z } from 'zod';

const AnsettelsesforholdSchema = z.object({
  ansettelsesforhold: z.array(
    z.object({
      startdato: z.iso.date(),
      yrkesbeskrivelse: z.string().min(1),
      stillingsprosent: z.number().min(0).max(100)
    })
  )
});

export type Ansettelsesforhold = z.infer<typeof AnsettelsesforholdSchema>;
