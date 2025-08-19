import Heading3 from '../Heading3';
import { SkeletonLoader } from '../SkeletonLoader/SkeletonLoader';
import TextLabel from '../TextLabel';
import lokalStyles from './Person.module.css';

interface Sykmeldt {
  fnr?: string;
  navn?: string;
}

interface AnsattDataVisningProps<T extends Sykmeldt> {
  sykmeldt: T;
}

export default function AnsattDataVisning({ sykmeldt }: Readonly<AnsattDataVisningProps<Sykmeldt>>) {
  const skjemadataErLastet = !!sykmeldt.fnr;
  const hentingAvPersondataFeilet = sykmeldt.navn === null;
  return (
    <div className={lokalStyles.denAnsatte}>
      <Heading3>Den ansatte</Heading3>
      <div className={lokalStyles.ytreAnsattWrapper}>
        {!hentingAvPersondataFeilet && (
          <div className={lokalStyles.ansattWrapper}>
            <TextLabel>Navn</TextLabel>
            <div data-cy='navn'>
              <SkeletonLoader ferdigLastet={skjemadataErLastet} tekst={sykmeldt.navn} />
            </div>
          </div>
        )}
        <div className={lokalStyles.ansattWrapper}>
          <TextLabel>Fødselsnummer</TextLabel>
          <div data-cy='identitetsnummer'>
            <SkeletonLoader ferdigLastet={skjemadataErLastet} tekst={sykmeldt.fnr} />
          </div>
        </div>
      </div>
    </div>
  );
}
