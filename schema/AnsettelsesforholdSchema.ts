// { ansettelsesperioder: [ { fom: '2006-02-24', tom: null } ] }

import { z } from 'zod';

const AnsettelsesforholdSchema = z.object({
  ansettelsesperioder: z.array(
    z.object({
      fom: z.string().min(1),
      tom: z.string().nullable()
    })
  )
});

export type Ansettelsesforhold = z.infer<typeof AnsettelsesforholdSchema>;
