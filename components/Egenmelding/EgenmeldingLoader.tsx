import TextLabel from '../TextLabel';
import styles from '../../styles/Home.module.css';
import lokalStyling from './EgenmeldingLoader.module.css';
import { Skeleton } from '@navikt/ds-react';

export default function EgenmeldingLoader() {
  return (
    <div data-cy='egenmelding'>
      <div className={styles.datepickerEscape}>
        <TextLabel>Fra</TextLabel>
        <div data-cy='egenmelding-fra' className={lokalStyling.skeleton}>
          <Skeleton variant='text' height={28} />
        </div>
      </div>
      <div className={styles.datepickerEscape}>
        <TextLabel>Til</TextLabel>
        <div data-cy='egenmelding-til' className={lokalStyling.skeleton}>
          <Skeleton variant='text' height={28} />
        </div>
      </div>
    </div>
  );
}
