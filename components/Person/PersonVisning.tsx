import Heading3 from '../Heading3';
import TextLabel from '../TextLabel';
import useBoundStore from '../../state/useBoundStore';
import { shallow } from 'zustand/shallow';
import lokalStyles from './Person.module.css';
import { Skeleton } from '@navikt/ds-react';
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

  const hentingAvPersondataFeilet = feilHentingAvPersondata && feilHentingAvPersondata.length > 0;
  const hentingAvArbeidsgiverdataFeilet = feilHentingAvArbeidsgiverdata && feilHentingAvArbeidsgiverdata.length > 0;

  const skjemadataErLastet = !!sykmeldt.fnr;

  return (
    <>
      <DelvisInnsendingInfo erDelvisInnsending={erDelvisInnsending} />
      <FeilVedHentingAvPersondata
        hentingAvPersondataFeilet={hentingAvPersondataFeilet}
        hentingAvArbeidsgiverdataFeilet={hentingAvArbeidsgiverdataFeilet}
      />
      <div className={lokalStyles.personInfoWrapper}>
        <AnsattDataVisning sykmeldt={sykmeldt} hentingAvPersondataFeilet={hentingAvPersondataFeilet} />
        <div className={lokalStyles.denAnsatte}>
          <Heading3>Den ansatte</Heading3>
          <div className={lokalStyles.ytreAnsattWrapper}>
            {!hentingAvPersondataFeilet && (
              <div className={lokalStyles.ansattWrapper}>
                <TextLabel>Navn</TextLabel>
                <div data-cy='navn'>{skeletonLoader(skjemadataErLastet, sykmeldt.navn)}</div>
              </div>
            )}
            <div className={lokalStyles.ansattWrapper}>
              <TextLabel>Personnummer</TextLabel>
              <div data-cy='identitetsnummer'>
                {sykmeldt.fnr ?? <Skeleton variant='text' width='90%' height={28} />}
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
              <TextLabel>Telefon innsender</TextLabel>
              <div className={lokalStyles.virksomhetsnavn}>{avsender.tlf}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function skeletonLoader(laster: boolean, tekst?: string) {
  return laster ? tekst : <Skeleton variant='text' width='90%' height={28} />;
}
