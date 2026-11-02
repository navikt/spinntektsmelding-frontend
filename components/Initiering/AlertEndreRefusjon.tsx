import { InfoCard } from '@navikt/ds-react';
import lokalStyling from './AlertEndreRefusjon.module.css';

export function AlertEndreRefusjon() {
  return (
    <InfoCard data-color='info' className={lokalStyling.alertPadding}>
      <InfoCard.Header>
        <InfoCard.Title as='h3'>Du trenger ikke sende inn en ny inntektsmelding for denne perioden.</InfoCard.Title>
      </InfoCard.Header>
      <InfoCard.Content>
        Så lenge sykepengesøknaden er en forlengelse med en tidligere innsendt inntektsmelding trenger du ikke sende inn
        ny inntektsmelding.
      </InfoCard.Content>
    </InfoCard>
  );
}
