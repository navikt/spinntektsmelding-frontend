import z from 'zod';

export const AvsenderSchema = z.object({
  orgnr: z.string(),
  orgNavn: z.string(),
  navn: z.string()
});
