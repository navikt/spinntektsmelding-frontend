import Heading3 from '../Heading3';
import TextLabel from '../TextLabel';
import useBoundStore from '../../state/useBoundStore';
import { shallow } from 'zustand/shallow';
import lokalStyles from './Person.module.css';
import { Skeleton, TextField } from '@navikt/ds-react';
import Heading2 from '../Heading2/Heading2';
import Skillelinje from '../Skillelinje/Skillelinje';
import { useFormContext } from 'react-hook-form';
import DelvisInnsendingInfo from './DelvisInnsendingInfo';
import FeilVedHentingAvPersondata from './FeilVedHentingAvPersondata';
import AnsattDataVisning from './AnsattDataVisning';

interface PersonProps {
  erDelvisInnsending?: boolean;
}

export default function Person({ erDelvisInnsending }: Readonly<PersonProps>) {
  const [sykmeldt, avsender, feilHentingAvPersondata, feilHentingAvArbeidsgiverdata] = useBoundStore(
    (state) => [state.sykmeldt, state.avsender, state.feilHentingAvPersondata, state.feilHentingAvArbeidsgiverdata],
    shallow
  );
  const {
    formState: { errors },
    register
  } = useFormContext();

  const hentingAvPersondataFeilet = feilHentingAvPersondata && feilHentingAvPersondata.length > 0;
  const hentingAvArbeidsgiverdataFeilet = feilHentingAvArbeidsgiverdata && feilHentingAvArbeidsgiverdata.length > 0;

  const skjemadataErLastet = !!sykmeldt.fnr;

  return (
    <>
      <Heading2 size='large'>Inntektsmelding</Heading2>
      <p>
        For at vi skal utbetale riktig beløp i forbindelse med sykmelding, må du bekrefte eller oppdatere opplysningene
        vi har om den ansatte og sykefraværet. Den ansatte kan se inntektsmeldinger som er sendt inn.
      </p>
      <Skillelinje />

      <FeilVedHentingAvPersondata
        hentingAvPersondataFeilet={hentingAvPersondataFeilet}
        hentingAvArbeidsgiverdataFeilet={hentingAvArbeidsgiverdataFeilet}
      />

      <DelvisInnsendingInfo erDelvisInnsending={erDelvisInnsending} />

      <div className={lokalStyles.personInfoWrapper}>
        <AnsattDataVisning sykmeldt={sykmeldt} hentingAvPersondataFeilet={hentingAvPersondataFeilet} />
        <div>
          <Heading3>Arbeidsgiveren</Heading3>

          <div className={lokalStyles.arbeidsgiverWrapper}>
            {!hentingAvArbeidsgiverdataFeilet && (
              <div className={lokalStyles.virksomhetsnavnWrapper}>
                <TextLabel>Virksomhetsnavn</TextLabel>
                <div className={lokalStyles.virksomhetsnavn} data-cy='virksomhetsnavn'>
                  {avsender.orgNavn ?? <Skeleton variant='text' width='90%' height={28} />}
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
              <div data-cy='orgnummer'>{avsender.orgnr ?? <Skeleton variant='text' width='90%' height={28} />}</div>
            </div>
            <div className={lokalStyles.innsenderNavnWrapper}>
              <TextLabel>Innsender</TextLabel>
              <div className={lokalStyles.virksomhetsnavn} data-cy='innsendernavn'>
                {skeletonLoader(skjemadataErLastet, avsender.navn)}
              </div>
            </div>
            <div className={lokalStyles.telefonWrapper}>
              <TextField
                label='Telefon innsender'
                type='tel'
                autoComplete='tel'
                readOnly={!skjemadataErLastet}
                {...register('avsenderTlf')}
                error={errors.avsenderTlf?.message as string}
              />
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
