import { EndepunktArbeidsforholdSchema } from '../schema/EndepunktArbeidsforholdSchema';
import type { OrgNode } from '../schema/OrgNodeSchema';
import { collectNestedOrgs } from './collectNestedOrgs';

export type Arbeidsgivervalg = {
  orgnrUnderenhet: string;
  virksomhetsnavn: string;
};

export function mapArbeidsforhold(data: unknown, hasError: boolean) {
  const parsed = EndepunktArbeidsforholdSchema.safeParse(data);
  if (!parsed.success || hasError) {
    return { arbeidsforhold: [], fulltNavn: '', orgnrUnderenhet: undefined, orgNavnMangler: false };
  }

  const arbeidsforhold: Arbeidsgivervalg[] = parsed.data.underenheter.flatMap((arbeidsgiver) => {
    if (!arbeidsgiver) {
      return [];
    }
    return [{ orgnrUnderenhet: arbeidsgiver.orgnrUnderenhet, virksomhetsnavn: arbeidsgiver.virksomhetsnavn }];
  });

  return {
    arbeidsforhold,
    fulltNavn: parsed.data.fulltNavn ?? 'Ukjent navn',
    orgnrUnderenhet: parsed.data.underenheter.length === 1 ? parsed.data.underenheter[0]?.orgnrUnderenhet : undefined,
    orgNavnMangler: parsed.data.underenheter.some((arbeidsgiver) => arbeidsgiver?.orgnrUnderenhet === null)
  };
}

export function mapArbeidsgiverTilganger(tilganger: OrgNode[] | undefined): Arbeidsgivervalg[] {
  if (!tilganger) return [];

  return collectNestedOrgs(tilganger).map((org) => ({
    orgnrUnderenhet: org.orgnr,
    virksomhetsnavn: org.navn
  }));
}
