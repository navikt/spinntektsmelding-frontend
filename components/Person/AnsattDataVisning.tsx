import Heading3 from '../Heading3';
import TextLabel from '../TextLabel';
import lokalStyles from './Person.module.css';
import { Skeleton } from '@navikt/ds-react';
import { skeletonLoader } from './PersonVisning';

interface Sykmeldt {
  fnr?: string;
  navn?: string;
}

interface AnsattDataVisningProps<T extends Sykmeldt> {
  sykmeldt: T;
  hentingAvPersondataFeilet?: boolean;
}

export default function AnsattDataVisning({
  sykmeldt,
  hentingAvPersondataFeilet
}: Readonly<AnsattDataVisningProps<Sykmeldt>>) {
  const skjemadataErLastet = !!sykmeldt.fnr;

  return (
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
          <div data-cy='identitetsnummer'>{sykmeldt.fnr ?? <Skeleton variant='text' width='90%' height={28} />}</div>
        </div>
      </div>
    </div>
  );
}
