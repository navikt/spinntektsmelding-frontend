import Heading3 from '../Heading3';
import TextLabel from '../TextLabel';
import useBoundStore from '../../state/useBoundStore';
import { shallow } from 'zustand/shallow';
import lokalStyles from './Person.module.css';
import { Alert, TextField } from '@navikt/ds-react';
import Skeleton from 'react-loading-skeleton';

interface PersonProps {
  erKvittering?: boolean;
  erDelvisInnsending?: boolean;
}

export default function Person({ erKvittering, erDelvisInnsending }: PersonProps) {
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
                <div data-cy='navn'>{navn || <Skeleton />}</div>
              </div>
            )}
            <div className={lokalStyles.ansattwrapper}>
              <TextLabel>Personnummer</TextLabel>
              <div data-cy='identitetsnummer'>{identitetsnummer || <Skeleton />}</div>
            </div>
          </div>
        </div>
        <div>
          <Heading3>Arbeidsgiveren</Heading3>

          <div className={lokalStyles.arbeidsgiverwrapper}>
            {virksomhetsnavn && !hentingAvArbeidsgiverdataFeilet && (
              <div className={lokalStyles.virksomhetsnavnwrapper}>
                <TextLabel>Virksomhetsnavn</TextLabel>
                <div className={lokalStyles.virksomhetsnavn} data-cy='virksomhetsnavn'>
                  {virksomhetsnavn || <Skeleton />}
                </div>
              </div>
            )}
            <div className={lokalStyles.orgnrnavnwrapper}>
              <TextLabel>Org.nr. for underenhet</TextLabel>
              <div data-cy='orgnummer'>{orgnrUnderenhet || <Skeleton />}</div>
            </div>
            {!virksomhetsnavn && <div className={lokalStyles.virksomhetsnavnwrapper}></div>}
            {!virksomhetsnavn && (
              <div className={lokalStyles.innsendernavnwrapper}>
                <TextLabel>Innsender</TextLabel>
                <div className={lokalStyles.virksomhetsnavn} data-cy='innsendernavn'>
                  {innsenderNavn}
                </div>
              </div>
            )}
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
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
