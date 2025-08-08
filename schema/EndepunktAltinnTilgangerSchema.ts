import { z } from 'zod/v4';

type Underenhet = {
  orgnr: string;
  erSlettet: boolean;
  altinn3Tilganger: string[];
  altinn2Tilganger: string[];
  underenheter: Underenhet[];
  navn: string;
  organisasjonsform: string;
};

const UnderenhetSchema: z.ZodType<Underenhet> = z.object({
  orgnr: z.string(),
  erSlettet: z.boolean(),
  altinn3Tilganger: z.array(z.string()),
  altinn2Tilganger: z.array(z.string()),
  underenheter: z.array(z.lazy(() => UnderenhetSchema)),
  navn: z.string(),
  organisasjonsform: z.string()
});

export const EndepunktAltinnTilgangerSchema = z.object({
  hierarki: z.array(
    z.object({
      orgnr: z.string(),
      erSlettet: z.boolean(),
      altinn3Tilganger: z.array(z.string()),
      altinn2Tilganger: z.array(z.string()),
      underenheter: UnderenhetSchema.array(),
      navn: z.string(),
      organisasjonsform: z.string()
    })
  ),
  orgNrTilTilganger: z.record(z.string(), z.array(z.string())),
  tilgangTilOrgNr: z.record(z.string(), z.array(z.string())),
  error: z.boolean()
});
export type EndepunktAltinnTilganger = z.infer<typeof EndepunktAltinnTilgangerSchema>;
