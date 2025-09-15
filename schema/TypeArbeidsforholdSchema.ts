import { z } from 'zod';
import { SelvbestemtTypeConst } from '../state/useSkjemadataStore';

const ArbeidsforholdMedArbeidsforholdSchema = z.object({
  type: z.literal(SelvbestemtTypeConst.MedArbeidsforhold),
  vedtaksperiodeId: z.uuid({
    error: (issue) => (issue.input === undefined ? 'Data er på gammelt format og ikke mulig å sende inn' : undefined)
  })
});

const ArbeidsforholdUtenArbeidsforholdSchema = z.object({
  type: z.literal(SelvbestemtTypeConst.UtenArbeidsforhold)
});

const ArbeidsforholdFiskerSchema = z.object({
  type: z.literal(SelvbestemtTypeConst.Fisker)
});

const ArbeidsforholdBehandlingsdagerSchema = z.object({
  type: z.literal(SelvbestemtTypeConst.Behandlingsdager)
});

export const TypeArbeidsforholdSchema = z.discriminatedUnion('type', [
  ArbeidsforholdMedArbeidsforholdSchema,
  ArbeidsforholdUtenArbeidsforholdSchema,
  ArbeidsforholdFiskerSchema,
  ArbeidsforholdBehandlingsdagerSchema
]);
