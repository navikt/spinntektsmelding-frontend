import Heading3 from '../Heading3';
import TextLabel from '../TextLabel';
import useBoundStore from '../../state/useBoundStore';
import { shallow } from 'zustand/shallow';
import lokalStyles from './PersonData.module.css';
import { Alert, Skeleton, TextField } from '@navikt/ds-react';
import { useFormContext } from 'react-hook-form';
import Heading2 from '../Heading2/Heading2';
import Skillelinje from '../Skillelinje/Skillelinje';

type PersonData = {
  navn: string;
  identitetsnummer: string;
  virksomhetsnavn: string;
  orgnrUnderenhet: string;
  innsenderNavn: string;
  innsenderTelefonNr?: string;
};

interface PersonDataProps {
  erKvittering?: boolean;
  erDelvisInnsending?: boolean;
  personData?: PersonData;
}

export default function PersonData({ erKvittering, erDelvisInnsending, personData }: PersonDataProps) {
  const [feilHentingAvPersondata, feilHentingAvArbeidsgiverdata] = useBoundStore(
    (state) => [state.feilHentingAvPersondata, state.feilHentingAvArbeidsgiverdata],
    shallow
  );

  const {
    formState: { errors },
    register
  } = useFormContext();

  const hentingAvPersondataFeilet = feilHentingAvPersondata && feilHentingAvPersondata.length > 0;
  const hentingAvArbeidsgiverdataFeilet = feilHentingAvArbeidsgiverdata && feilHentingAvArbeidsgiverdata.length > 0;

  const hvilkenFeil = `${hentingAvPersondataFeilet ? 'den ansatte' : ''} ${
    hentingAvPersondataFeilet && hentingAvArbeidsgiverdataFeilet ? 'og' : ''
  } ${hentingAvPersondataFeilet && hentingAvArbeidsgiverdataFeilet ? 'bedriften' : ''}`;

  const hvilkenSjekk = `${hentingAvPersondataFeilet ? 'personnummer' : ''} ${
    hentingAvPersondataFeilet && hentingAvArbeidsgiverdataFeilet ? 'og' : ''
  } ${hentingAvPersondataFeilet && hentingAvArbeidsgiverdataFeilet ? 'organisasjonsnummer' : ''}`;

  const feilmeldingTekst = `Vi klarer ikke hente navn på ${hvilkenFeil} akkurat nå. Du kan sende inn inntektsmeldingen uansett, men kontroller at ${hvilkenSjekk} stemmer.`;

  const skjemadataErLastet = !!personData?.identitetsnummer;

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
                <div data-cy='navn'>{skeletonLoader(skjemadataErLastet, personData?.navn)}</div>
              </div>
            )}
            <div className={lokalStyles.ansattWrapper}>
              <TextLabel>Personnummer</TextLabel>
              <div data-cy='identitetsnummer'>
                {personData?.identitetsnummer || <Skeleton variant='text' width='90%' height={28} />}
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
                  {personData?.virksomhetsnavn || <Skeleton variant='text' width='90%' height={28} />}
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
              <TextLabel>Orgnr. for underenhet</TextLabel>
              <div data-cy='orgnummer'>
                {personData?.orgnrUnderenhet ?? <Skeleton variant='text' width='90%' height={28} />}
              </div>
            </div>
            <div className={lokalStyles.innsenderNavnWrapper}>
              <TextLabel>Innsender</TextLabel>
              <div className={lokalStyles.virksomhetsnavn} data-cy='innsendernavn'>
                {skeletonLoader(skjemadataErLastet, personData?.innsenderNavn)}
              </div>
            </div>
            <div className={lokalStyles.telefonWrapper}>
              {erKvittering && (
                <>
                  <TextLabel>Telefon innsender</TextLabel>
                  <div className={lokalStyles.virksomhetsnavn} data-cy='innsendertlf'>
                    {personData?.innsenderTelefonNr}
                  </div>
                </>
              )}
              {!erKvittering && (
                <TextField
                  label='Telefon innsender'
                  type='tel'
                  autoComplete='tel'
                  data-cy='innsendertlf'
                  error={errors.telefon?.message as string}
                  readOnly={!skjemadataErLastet}
                  {...register('telefon' as const)}
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
