import z from 'zod';

export const avsenderSchema = z.object({
  orgnr: z.string(),
  orgNavn: z.string(),
  navn: z.string()
});
