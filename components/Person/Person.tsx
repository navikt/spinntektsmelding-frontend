import Heading3 from '../Heading3';
import TextLabel from '../TextLabel';
import useBoundStore from '../../state/useBoundStore';
import { shallow } from 'zustand/shallow';
import lokalStyles from './Person.module.css';
import { Alert, TextField } from '@navikt/ds-react';
import Heading2 from '../Heading2/Heading2';
import Skillelinje from '../Skillelinje/Skillelinje';

interface PersonProps {
  erKvittering?: boolean;
  erDelvisInnsending?: boolean;
  personInfo?: {
    navn: string;
    identitetsnummer: string;
    orgnrUnderenhet: string;
    virksomhetsnavn: string;
    innsenderTelefonNr: string;
    innsenderNavn: string;
  };
}

export default function Person({ erKvittering, erDelvisInnsending, personInfo }: PersonProps) {
  const [
    navn,
    identitetsnummer,
    orgnrUnderenhet,
    virksomhetsnavn,
    innsenderTelefonNr,
    innsenderNavn,
    setInnsenderTelefon,
    feilHentingAvPersondata,
    feilHentingAvArbeidsgiverdata,
    visFeilmeldingsTekst
  ] = useBoundStore(
    (state) => [
      state.navn,
      state.identitetsnummer,
      state.orgnrUnderenhet,
      state.virksomhetsnavn,
      state.innsenderTelefonNr,
      state.innsenderNavn,
      state.setInnsenderTelefon,
      state.feilHentingAvPersondata,
      state.feilHentingAvArbeidsgiverdata,
      state.visFeilmeldingsTekst
    ],
    shallow
  );

  const changeTlfNr = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInnsenderTelefon(event.target.value);
  };

  const hentingAvPersondataFeilet = feilHentingAvPersondata && feilHentingAvPersondata.length > 0;
  const hentingAvArbeidsgiverdataFeilet = feilHentingAvArbeidsgiverdata && feilHentingAvArbeidsgiverdata.length > 0;

  const hvilkenFeil = `${hentingAvPersondataFeilet ? 'den ansatte' : ''} ${
    hentingAvPersondataFeilet && hentingAvArbeidsgiverdataFeilet ? 'og' : ''
  } ${hentingAvPersondataFeilet && hentingAvArbeidsgiverdataFeilet ? 'bedriften' : ''}`;

  const hvilkenSjekk = `${hentingAvPersondataFeilet ? 'personnummer' : ''} ${
    hentingAvPersondataFeilet && hentingAvArbeidsgiverdataFeilet ? 'og' : ''
  } ${hentingAvPersondataFeilet && hentingAvArbeidsgiverdataFeilet ? 'organisasjonsnummer' : ''}`;

  const feilmeldingTekst = `Vi klarer ikke hente navn på ${hvilkenFeil} akkurat nå. Du kan sende inn inntektsmeldingen uansett, men kontroller at ${hvilkenSjekk} stemmer.`;

  const skjemadataErLastet = !!identitetsnummer;

  let visningVirksomhetsnavn = virksomhetsnavn;
  if (hentingAvArbeidsgiverdataFeilet) {
    visningVirksomhetsnavn = '&nbsp;';
  }

  return (
    <>
      {!erKvittering && (
        <>
          <Heading2 size='large'>Inntektsmelding</Heading2>
          <p>
            For at vi skal utbetale riktig beløp i forbindelse med sykmelding, må dere bekrefte eller oppdatere
            opplysningene vi har om den ansatte og sykefraværet. Vi gjør dere oppmerksom på at den ansatte vil få
            tilgang til å se innsendt informasjon etter personopplysningslovens artikkel 15 og forvaltningsloven § 18.
          </p>
          <Skillelinje />
          {(hentingAvPersondataFeilet || hentingAvArbeidsgiverdataFeilet) && (
            <Alert variant='info'>{feilmeldingTekst}</Alert>
          )}
        </>
      )}
      {erDelvisInnsending && (
        <p>
          Da dette sykefraværet er innenfor samme arbeidsgiverperiode som forrige sykefravær trenger vi bare informasjon
          om inntekt og refusjon.
        </p>
      )}
      <div className={lokalStyles.personInfoWrapper}>
        <div className={lokalStyles.denAnsatte}>
          <Heading3>Den ansatte</Heading3>
          <div className={lokalStyles.ytreAnsattWrapper}>
            {!hentingAvPersondataFeilet && (
              <div className={lokalStyles.ansattWrapper}>
                <TextLabel>Navn</TextLabel>
                <div data-cy='navn'>{personInfo?.navn || navn}</div>
              </div>
            )}
            <div className={lokalStyles.ansattWrapper}>
              <TextLabel>Personnummer</TextLabel>
              <div data-cy='identitetsnummer'>{personInfo?.identitetsnummer || identitetsnummer}</div>
            </div>
          </div>
        </div>
        <div>
          <Heading3>Arbeidsgiveren</Heading3>

          <div className={lokalStyles.arbeidsgiverWrapper}>
            <div className={lokalStyles.virksomhetsnavnWrapper}>
              <TextLabel>Virksomhetsnavn</TextLabel>
              <div className={lokalStyles.virksomhetsnavn} data-cy='virksomhetsnavn'>
                {personInfo?.virksomhetsnavn || visningVirksomhetsnavn}
              </div>
            </div>

            <div className={lokalStyles.orgnrNavnWrapper}>
              <TextLabel>Orgnr. for underenhet</TextLabel>
              <div data-cy='orgnummer'>{personInfo?.orgnrUnderenhet ?? orgnrUnderenhet}</div>
            </div>
            <div className={lokalStyles.innsenderNavnWrapper}>
              <TextLabel>Innsender</TextLabel>
              <div className={lokalStyles.virksomhetsnavn} data-cy='innsendernavn'>
                {personInfo?.innsenderNavn ?? innsenderNavn}
              </div>
            </div>
            <div className={lokalStyles.telefonWrapper}>
              {erKvittering && (
                <>
                  <TextLabel>Telefon innsender</TextLabel>
                  <div className={lokalStyles.virksomhetsnavn} data-cy='innsendertlf'>
                    {personInfo?.innsenderTelefonNr ?? innsenderTelefonNr}
                  </div>
                </>
              )}
              {!erKvittering && (
                <TextField
                  label='Telefon innsender'
                  type='tel'
                  autoComplete='tel'
                  defaultValue={personInfo?.innsenderTelefonNr ?? innsenderTelefonNr}
                  onChange={changeTlfNr}
                  data-cy='innsendertlf'
                  error={visFeilmeldingsTekst('telefon')}
                  id='telefon'
                  readOnly={!skjemadataErLastet}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
