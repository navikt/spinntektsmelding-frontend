import { LocalAlert } from '@navikt/ds-react';

interface FeilVedHentingAvPersondataProps {
  sykmeldt: {
    navn?: string;
    fnr?: string;
  };
  avsender: {
    orgnr?: string;
    orgNavn?: string;
    navn?: string;
    tlf?: string;
  };
}

export default function FeilVedHentingAvPersondata({ sykmeldt, avsender }: Readonly<FeilVedHentingAvPersondataProps>) {
  const hentingAvPersondataFeilet = sykmeldt.navn === null;
  const hentingAvArbeidsgiverdataFeilet = avsender.orgNavn === null;

  const hvilkenFeil = `${sykmeldt.navn === null ? 'den ansatte' : ''} ${
    hentingAvPersondataFeilet && hentingAvArbeidsgiverdataFeilet ? 'og' : ''
  } ${hentingAvPersondataFeilet && hentingAvArbeidsgiverdataFeilet ? 'bedriften' : ''}`;

  const hvilkenSjekk = `${hentingAvPersondataFeilet ? 'fødselsnummer' : ''} ${
    hentingAvPersondataFeilet && hentingAvArbeidsgiverdataFeilet ? 'og' : ''
  } ${hentingAvPersondataFeilet && hentingAvArbeidsgiverdataFeilet ? 'organisasjonsnummer' : ''}`;

  const feilmeldingTekst = `Vi klarer ikke hente navn på ${hvilkenFeil} akkurat nå. Du kan sende inn inntektsmeldingen uansett, men kontroller at ${hvilkenSjekk} stemmer.`;

  return (
    <>
      {(hentingAvPersondataFeilet || hentingAvArbeidsgiverdataFeilet) && (
        <LocalAlert status='warning' as='div'>
          <LocalAlert.Header>
            <LocalAlert.Title as='h3'>Kunne ikke hente navn</LocalAlert.Title>
          </LocalAlert.Header>
          <LocalAlert.Content>{feilmeldingTekst}</LocalAlert.Content>
        </LocalAlert>
      )}
    </>
  );
}
