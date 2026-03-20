import z from 'zod';

export const KvitteringEksterntSystemSchema = z.object({
  avsenderSystem: z.string(),
  referanse: z.string(),
  tidspunkt: z.iso.datetime()
});

export type KvitteringEksterntSystem = z.infer<typeof KvitteringEksterntSystemSchema>;
