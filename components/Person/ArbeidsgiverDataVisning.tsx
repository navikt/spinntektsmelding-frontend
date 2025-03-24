import Heading3 from '../Heading3';
import TextLabel from '../TextLabel';
import { skeletonLoader } from './PersonVisning';
import lokalStyles from './Person.module.css';
import { Skeleton } from '@navikt/ds-react';

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
          {children}
          {/*<TextLabel>Telefon innsender</TextLabel>
          <div className={lokalStyles.virksomhetsnavn}>{avsender.tlf}</div>*/}
        </div>
      </div>
    </div>
  );
}
