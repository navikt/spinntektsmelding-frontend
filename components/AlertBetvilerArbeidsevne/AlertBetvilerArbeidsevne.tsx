import { Alert, Link } from '@navikt/ds-react';
import localStyles from './AlertBetvilerArbeidsevne.module.css';

export default function AlertBetvilerArbeidsevne() {
  return (
    <Alert variant='info' className={localStyles.outerwrapper}>
      Innen 14 dager må dere sende et brev til NAV hvor dere forklarer hvorfor dere betviler sykmeldingen. Gå inn på{' '}
      <Link href='https://www.nav.no/arbeidsgiver/betvile-sykmelding'>
        https://www.nav.no/arbeidsgiver/betvile-sykmelding
      </Link>{' '}
      for å finne ut hva brevet må inneholde og hvordan det skal sendes inn.
    </Alert>
  );
}
