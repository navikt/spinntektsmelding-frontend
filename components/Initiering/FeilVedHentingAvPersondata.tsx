import { LocalAlert } from '@navikt/ds-react';

interface FeilVedHentingAvPersondataProps {
  fulltNavnMangler?: boolean;
  orgNavnMangler?: boolean;
}

export default function FeilVedHentingAvPersondata({
  fulltNavnMangler,
  orgNavnMangler
}: Readonly<FeilVedHentingAvPersondataProps>) {
  const hentingAvPersondataFeilet = fulltNavnMangler;
  const hentingAvArbeidsgiverdataFeilet = orgNavnMangler;

  const hvilkenFeil = `${hentingAvPersondataFeilet ? 'den ansatte' : ''}${
    hentingAvPersondataFeilet && hentingAvArbeidsgiverdataFeilet ? ' og ' : ''
  }${hentingAvArbeidsgiverdataFeilet ? 'bedriften' : ''}`.trim();

  const hvilkenSjekk = `${hentingAvPersondataFeilet ? 'fødselsnummer' : ''}${
    hentingAvPersondataFeilet && hentingAvArbeidsgiverdataFeilet ? ' og ' : ''
  }${hentingAvArbeidsgiverdataFeilet ? 'organisasjonsnummer' : ''}`.trim();

  const feilmeldingTekst = `Vi klarer ikke hente navn på ${hvilkenFeil} akkurat nå. Du kan sende inn inntektsmeldingen uansett, men kontroller at ${hvilkenSjekk} stemmer.`;

  return (
    <>
      {(hentingAvPersondataFeilet || hentingAvArbeidsgiverdataFeilet) && (
        <LocalAlert status='warning'>
          <LocalAlert.Header>
            <LocalAlert.Title>Kunne ikke hente navn</LocalAlert.Title>
          </LocalAlert.Header>
          <LocalAlert.Content>{feilmeldingTekst}</LocalAlert.Content>
        </LocalAlert>
      )}
    </>
  );
}
