import { Alert, Heading } from '@navikt/ds-react';
import lokalStyling from './AlertEndreRefusjon.module.css';

export function AlertEndreRefusjon() {
  return (
    <Alert variant='info' className={lokalStyling.alertPadding}>
      <Heading spacing size='small' level='3'>
        Du trenger ikke sende inn en ny inntektsmelding for denne perioden.
      </Heading>
      Så lenge sykepengesøknaden er en forlengelse med en tidligere innsendt inntektsmelding trenger du ikke sende inn
      ny inntektsmelding.
    </Alert>
  );
}
