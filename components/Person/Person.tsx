import Heading3 from '../Heading3';
import TextLabel from '../TextLabel';
import useBoundStore from '../../state/useBoundStore';
import { shallow } from 'zustand/shallow';
import lokalStyles from './Person.module.css';
import { Alert, Skeleton, TextField } from '@navikt/ds-react';
import React from 'react';

interface PersonStatisk {
  navn: string;
  identitetsnummer: string;
  orgnrUnderenhet: string;
  virksomhetsnavn: string;
  innsenderNavn: string;
}

interface PersonProps {
  erKvittering?: boolean;
  erDelvisInnsending?: boolean;
  personStatisk?: PersonStatisk;
}

export default function Person({ erKvittering, erDelvisInnsending, personStatisk }: PersonProps) {
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

  const feilmeldingstekst = `Vi klarer ikke hente navn på ${hvilkenFeil} akkurat nå. Du kan sende inn inntektsmeldingen uansett, men kontroller at ${hvilkenSjekk} stemmer.`;

  const skjemadataErLastet = !!identitetsnummer;

  return (
    <>
      {!erKvittering && (
        <p>
          For at vi skal utbetale riktig beløp i forbindelse med sykmelding, må dere bekrefte eller oppdatere
          opplysningene vi har om den ansatte og sykefraværet.
          {(hentingAvPersondataFeilet || hentingAvArbeidsgiverdataFeilet) && (
            <Alert variant='info'>{feilmeldingstekst}</Alert>
          )}
        </p>
      )}
      {erDelvisInnsending && (
        <p>
          Da dette sykefraværet er innenfor samme arbeidsgiverperiode som forrige sykefravær trenger vi bare informasjon
          om inntekt og refusjon.
        </p>
      )}
      <div className={lokalStyles.personinfowrapper}>
        <div className={lokalStyles.denansatte}>
          <Heading3>Den ansatte</Heading3>
          <div className={lokalStyles.ytreansattwrapper}>
            {!hentingAvPersondataFeilet && (
              <div className={lokalStyles.ansattwrapper}>
                <TextLabel>Navn</TextLabel>
                <div data-cy='navn'>{personStatisk?.navn}</div>
              </div>
            )}
            <div className={lokalStyles.ansattwrapper}>
              <TextLabel>Personnummer</TextLabel>
              <div data-cy='identitetsnummer'>{personStatisk?.identitetsnummer}</div>
            </div>
          </div>
        </div>
        <div>
          <Heading3>Arbeidsgiveren</Heading3>

          <div className={lokalStyles.arbeidsgiverwrapper}>
            {!hentingAvArbeidsgiverdataFeilet && (
              <div className={lokalStyles.virksomhetsnavnwrapper}>
                <TextLabel>Virksomhetsnavn</TextLabel>
                <div className={lokalStyles.virksomhetsnavn} data-cy='virksomhetsnavn'>
                  {personStatisk?.virksomhetsnavn}
                </div>
              </div>
            )}
            {hentingAvArbeidsgiverdataFeilet && (
              <div className={lokalStyles.virksomhetsnavnwrapper}>
                <TextLabel>&nbsp;</TextLabel>
                <div className={lokalStyles.virksomhetsnavn} data-cy='virksomhetsnavn'>
                  &nbsp;
                </div>
              </div>
            )}
            <div className={lokalStyles.orgnrnavnwrapper}>
              <TextLabel>Org.nr. for underenhet</TextLabel>
              <div data-cy='orgnummer'>{personStatisk?.orgnrUnderenhet}</div>
            </div>
            <div className={lokalStyles.innsendernavnwrapper}>
              <TextLabel>Innsender</TextLabel>
              <div className={lokalStyles.virksomhetsnavn} data-cy='innsendernavn'>
                {personStatisk?.innsenderNavn}
              </div>
            </div>
            <div className={lokalStyles.telefonnrwrapper}>
              {erKvittering && (
                <>
                  <TextLabel>Telefon innsender</TextLabel>
                  <div className={lokalStyles.virksomhetsnavn} data-cy='innsendertlf'>
                    {innsenderTelefonNr}
                  </div>
                </>
              )}
              {!erKvittering && (
                <TextField
                  label='Telefon innsender'
                  type='tel'
                  autoComplete='tel'
                  defaultValue={innsenderTelefonNr}
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
