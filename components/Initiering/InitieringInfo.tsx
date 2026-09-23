import type { ArbeidsgiverSelect } from '../SelectArbeidsgiver/SelectArbeidsgiver';

export function OrganisasjonInfo({
  orgNr,
  arbeidsforhold
}: Readonly<{ orgNr?: string; arbeidsforhold: ArbeidsgiverSelect[] }>) {
  if (!arbeidsforhold.length || !orgNr) {
    return null;
  }

  const virksomhetsnavn = arbeidsforhold.find(
    (arbeidsgiver) => arbeidsgiver.orgnrUnderenhet === orgNr
  )?.virksomhetsnavn;

  return (
    <div>
      <p>{virksomhetsnavn}</p>
    </div>
  );
}

export function PersonInfo({ navn, fnr }: Readonly<{ navn?: string; fnr?: string }>) {
  if (!navn || !fnr) {
    return null;
  }

  const fDatoSiffer = fnr.substring(0, 6).split('');
  const fDato = `${startFDato(fDatoSiffer[0])}${fDatoSiffer[1]}.${fDatoSiffer[2]}${fDatoSiffer[3]}.${fDatoSiffer[4]}${fDatoSiffer[5]}`;

  return (
    <>
      Inntektsmelding {navn} f.{fDato}
    </>
  );
}

function startFDato(siffer: string): string {
  return Number(siffer) > 3 ? (Number(siffer) - 4).toString() : siffer;
}
