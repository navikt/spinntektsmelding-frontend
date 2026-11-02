import { InfoCard } from '@navikt/ds-react';

export default function AlertKorrigereRefusjon() {
  return (
    <InfoCard data-color='info'>
      <InfoCard.Header>
        <InfoCard.Title as='h3'>Du må korrigere den tidligere innsendte inntektsmeldingen.</InfoCard.Title>
      </InfoCard.Header>
      <InfoCard.Content>
        Åpne den tidligere innsendte inntektsmeldingen nedenfor for å gjøre eventuelle endringer i refusjonstidspunkter
        og refusjonsbeløp.
      </InfoCard.Content>
    </InfoCard>
  );
}
