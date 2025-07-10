import { z } from 'zod';

const ArbeidsforholdMedArbeidsforholdSchema = z.object({
  type: z.literal('MedArbeidsforhold'),
  vedtaksperiodeId: z.string({ required_error: 'Data er på gammelt format og ikke mulig å sende inn' }).uuid()
});

const ArbeidsforholdUtenArbeidsforholdSchema = z.object({
  type: z.literal('UtenArbeidsforhold')
});

const ArbeidsforholdFiskerSchema = z.object({
  type: z.literal('Fisker')
});

export const TypeArbeidsforholdSchema = z.discriminatedUnion('type', [
  ArbeidsforholdMedArbeidsforholdSchema,
  ArbeidsforholdUtenArbeidsforholdSchema,
  ArbeidsforholdFiskerSchema
]);
