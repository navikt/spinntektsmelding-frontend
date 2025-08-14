import { z } from 'zod/v4';

const ArbeidsforholdMedArbeidsforholdSchema = z.object({
  type: z.literal('MedArbeidsforhold'),
  vedtaksperiodeId: z.uuid({
    error: (issue) => (issue.input === undefined ? 'Data er på gammelt format og ikke mulig å sende inn' : undefined)
  })
});

const ArbeidsforholdUtenArbeidsforholdSchema = z.object({
  type: z.literal('UtenArbeidsforhold')
});

const ArbeidsforholdFiskerSchema = z.object({
  type: z.literal('Fisker')
});

const ArbeidsforholdBehandlingsdagerSchema = z.object({
  type: z.literal('Behandlingsdager')
});

export const TypeArbeidsforholdSchema = z.discriminatedUnion('type', [
  ArbeidsforholdMedArbeidsforholdSchema,
  ArbeidsforholdUtenArbeidsforholdSchema,
  ArbeidsforholdFiskerSchema,
  ArbeidsforholdBehandlingsdagerSchema
]);
