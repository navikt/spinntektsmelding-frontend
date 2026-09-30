import { Alert, Heading } from '@navikt/ds-react';

export default function AlertKorrigereRefusjon() {
  return (
    <Alert variant='info'>
      <Heading spacing size='small' level='3'>
        Du må korrigere den tidligere innsendte inntektsmeldingen.
      </Heading>
      Åpne den tidligere innsendte inntektsmeldingen nedenfor for å gjøre eventuelle endringer i refusjonstidspunkter og
      refusjonsbeløp.
    </Alert>
  );
}
