import TextLabel from '../TextLabel';
import styles from '../../styles/Home.module.css';
import lokalStyles from './EgenmeldingLoader.module.css';
import { Skeleton } from '@navikt/ds-react';

export default function EgenmeldingLoader() {
  return (
    <div data-cy='egenmelding'>
      <div className={styles.datepickerescape}>
        <TextLabel>Fra</TextLabel>
        <div id={`egenmeldingsperioder.loader.fom`} data-cy='egenmelding-fra' className={lokalStyles.skeleton}>
          <Skeleton variant='text' height={28} />
        </div>
      </div>
      <div className={styles.datepickerescape}>
        <TextLabel>Til</TextLabel>
        <div id={`egenmeldingsperioder.loader.tom`} data-cy='egenmelding-til' className={lokalStyles.skeleton}>
          <Skeleton variant='text' height={28} />
        </div>
      </div>
    </div>
  );
}
