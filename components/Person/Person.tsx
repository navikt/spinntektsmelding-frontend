import Heading3 from '../Heading3';
import TextLabel from '../TextLabel';
import useBoundStore from '../../state/useBoundStore';
import { shallow } from 'zustand/shallow';
import lokalStyles from './Person.module.css';
import { Alert, Skeleton, TextField } from '@navikt/ds-react';

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

  const feilmeldingTekst = `Vi klarer ikke hente navn på ${hvilkenFeil} akkurat nå. Du kan sende inn inntektsmeldingen uansett, men kontroller at ${hvilkenSjekk} stemmer.`;

  const skjemadataErLastet = !!identitetsnummer;

  return (
    <>
      {!erKvittering && (
        <p>
          For at vi skal utbetale riktig beløp i forbindelse med sykmelding, må dere bekrefte eller oppdatere
          opplysningene vi har om den ansatte og sykefraværet. Vi gjør dere oppmerksom på at den ansatte vil få tilgang
          til å se innsendt informasjon etter personopplysningslovens artikkel 15 og forvaltningsloven § 18.
          {(hentingAvPersondataFeilet || hentingAvArbeidsgiverdataFeilet) && (
            <Alert variant='info'>{feilmeldingTekst}</Alert>
          )}
        </p>
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
                <div data-cy='navn'>{skeletonLoader(skjemadataErLastet, navn)}</div>
              </div>
            )}
            <div className={lokalStyles.ansattWrapper}>
              <TextLabel>Personnummer</TextLabel>
              <div data-cy='identitetsnummer'>
                {identitetsnummer || <Skeleton variant='text' width='90%' height={28} />}
              </div>
            </div>
          </div>
        </div>
        <div>
          <Heading3>Arbeidsgiveren</Heading3>

          <div className={lokalStyles.arbeidsgiverWrapper}>
            {!hentingAvArbeidsgiverdataFeilet && (
              <div className={lokalStyles.virksomhetsnavnWrapper}>
                <TextLabel>Virksomhetsnavn</TextLabel>
                <div className={lokalStyles.virksomhetsnavn} data-cy='virksomhetsnavn'>
                  {virksomhetsnavn || <Skeleton variant='text' width='90%' height={28} />}
                </div>
              </div>
            )}
            {hentingAvArbeidsgiverdataFeilet && (
              <div className={lokalStyles.virksomhetsnavnWrapper}>
                <TextLabel>&nbsp;</TextLabel>
                <div className={lokalStyles.virksomhetsnavn} data-cy='virksomhetsnavn'>
                  &nbsp;
                </div>
              </div>
            )}
            <div className={lokalStyles.orgnrNavnWrapper}>
              <TextLabel>Org.nr. for underenhet</TextLabel>
              <div data-cy='orgnummer'>{orgnrUnderenhet ?? <Skeleton variant='text' width='90%' height={28} />}</div>
            </div>
            <div className={lokalStyles.innsenderNavnWrapper}>
              <TextLabel>Innsender</TextLabel>
              <div className={lokalStyles.virksomhetsnavn} data-cy='innsendernavn'>
                {skeletonLoader(skjemadataErLastet, innsenderNavn)}
              </div>
            </div>
            <div className={lokalStyles.telefonWrapper}>
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

function skeletonLoader(laster: boolean, tekst?: string) {
  return laster ? tekst : <Skeleton variant='text' width='90%' height={28} />;
}
