import Heading3 from '../Heading3';
import { SkeletonLoader } from '../SkeletonLoader/SkeletonLoader';
import TextLabel from '../TextLabel';
import lokalStyles from './Person.module.css';

interface Arbeidsgiver {
  orgNavn?: string;
  orgnr?: string;
  navn?: string;
}

interface ArbeidsgiverDataVisningProps<T extends Arbeidsgiver> {
  avsender: T;
  hentingAvArbeidsgiverdataFeilet?: boolean;
  children?: React.ReactNode;
}

export default function ArbeidsgiverDataVisning({
  avsender,
  hentingAvArbeidsgiverdataFeilet,
  children
}: Readonly<ArbeidsgiverDataVisningProps<Arbeidsgiver>>) {
  const skjemadataErLastet = !!avsender.orgnr;

  return (
    <div>
      <Heading3>Arbeidsgiveren</Heading3>

      <div className={lokalStyles.arbeidsgiverWrapper}>
        {!hentingAvArbeidsgiverdataFeilet && (
          <div className={lokalStyles.virksomhetsnavnWrapper}>
            <TextLabel>Virksomhetsnavn</TextLabel>
            <div className={lokalStyles.virksomhetsnavn} data-cy='virksomhetsnavn'>
              <SkeletonLoader ferdigLastet={skjemadataErLastet} tekst={avsender.orgNavn} />
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
            <SkeletonLoader ferdigLastet={skjemadataErLastet} tekst={avsender.orgnr} />
          </div>
        </div>
        <div className={lokalStyles.innsenderNavnWrapper}>
          <TextLabel>Innsender</TextLabel>
          <div className={lokalStyles.virksomhetsnavn} data-cy='innsendernavn'>
            <SkeletonLoader ferdigLastet={skjemadataErLastet} tekst={avsender.navn} />
          </div>
        </div>
        <div className={lokalStyles.telefonWrapper}>{children}</div>
      </div>
    </div>
  );
}
