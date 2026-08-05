import Heading3 from '../Heading3';
import { SkeletonLoader } from '../SkeletonLoader/SkeletonLoader';
import TextLabel from '../TextLabel';
import lokalStyling from './Person.module.css';

interface Arbeidsgiver {
  orgNavn?: string;
  orgnr?: string;
  navn?: string;
}

interface ArbeidsgiverDataVisningProps<T extends Arbeidsgiver> {
  avsender: T;
  children?: React.ReactNode;
}

export default function ArbeidsgiverDataVisning({
  avsender,
  children
}: Readonly<ArbeidsgiverDataVisningProps<Arbeidsgiver>>) {
  const skjemadataErLastet = !!avsender.orgnr;
  const hentingAvArbeidsgiverdataFeilet = avsender.orgNavn === null;
  return (
    <div>
      <Heading3>Arbeidsgiveren</Heading3>

      <div className={lokalStyling.arbeidsgiverWrapper}>
        {!hentingAvArbeidsgiverdataFeilet && (
          <div className={lokalStyling.virksomhetsnavnWrapper}>
            <TextLabel>Virksomhetsnavn</TextLabel>
            <div className={lokalStyling.virksomhetsnavn} data-cy='virksomhetsnavn'>
              <SkeletonLoader ferdigLastet={skjemadataErLastet} tekst={avsender.orgNavn} />
            </div>
          </div>
        )}
        {hentingAvArbeidsgiverdataFeilet && (
          <div className={lokalStyling.virksomhetsnavnWrapper}>
            <TextLabel>&nbsp;</TextLabel>
            <div className={lokalStyling.virksomhetsnavn} data-cy='virksomhetsnavn'>
              &nbsp;
            </div>
          </div>
        )}
        <div className={lokalStyling.orgnrNavnWrapper}>
          <TextLabel>Orgnr. for underenhet</TextLabel>
          <div data-cy='orgnummer'>
            <SkeletonLoader ferdigLastet={skjemadataErLastet} tekst={avsender.orgnr} />
          </div>
        </div>
        <div className={lokalStyling.innsenderNavnWrapper}>
          <TextLabel>Innsender</TextLabel>
          <div className={lokalStyling.virksomhetsnavn} data-cy='innsendernavn'>
            <SkeletonLoader ferdigLastet={skjemadataErLastet} tekst={avsender.navn} />
          </div>
        </div>
        <div className={lokalStyling.telefonWrapper}>{children}</div>
      </div>
    </div>
  );
}
