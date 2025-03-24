import { Alert } from '@navikt/ds-react';

interface FeilVedHentingAvPersondataProps {
  hentingAvPersondataFeilet?: boolean;
  hentingAvArbeidsgiverdataFeilet?: boolean;
}

export default function FeilVedHentingAvPersondata({
  hentingAvPersondataFeilet,
  hentingAvArbeidsgiverdataFeilet
}: Readonly<FeilVedHentingAvPersondataProps>) {
  const hvilkenFeil = `${hentingAvPersondataFeilet ? 'den ansatte' : ''} ${
    hentingAvPersondataFeilet && hentingAvArbeidsgiverdataFeilet ? 'og' : ''
  } ${hentingAvPersondataFeilet && hentingAvArbeidsgiverdataFeilet ? 'bedriften' : ''}`;

  const hvilkenSjekk = `${hentingAvPersondataFeilet ? 'personnummer' : ''} ${
    hentingAvPersondataFeilet && hentingAvArbeidsgiverdataFeilet ? 'og' : ''
  } ${hentingAvPersondataFeilet && hentingAvArbeidsgiverdataFeilet ? 'organisasjonsnummer' : ''}`;

  const feilmeldingTekst = `Vi klarer ikke hente navn på ${hvilkenFeil} akkurat nå. Du kan sende inn inntektsmeldingen uansett, men kontroller at ${hvilkenSjekk} stemmer.`;

  return (
    <>
      {(hentingAvPersondataFeilet || hentingAvArbeidsgiverdataFeilet) && (
        <Alert variant='info'>{feilmeldingTekst}</Alert>
      )}
    </>
  );
}
