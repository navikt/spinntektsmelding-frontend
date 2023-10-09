import { useState } from 'react';
import lokalStyles from './FlexJarResponse.module.css';
import { Alert, BodyLong, Button, Textarea } from '@navikt/ds-react';
import useSendInnFeedback from '../../utils/useSendInnFeedback';
import { FaceSmileIcon } from '@navikt/aksel-icons';

interface FlexJarResponseProps {
  sporsmaal: string;
  feedbackId: string;
}

export default function FlexJarResponse(props: FlexJarResponseProps) {
  const [respons, setRespons] = useState<string>('');
  const [sendt, setSendt] = useState<boolean>(false);

  const sendInnFeedback = useSendInnFeedback();

  const sendResponse = () => {
    sendInnFeedback({
      svar: respons,
      feedbackId: props.feedbackId,
      sporsmal: props.sporsmaal,
      feedback: respons,
      app: 'spinntektsmalding-frontend'
    });
    setSendt(true);
  };

  if (!sendt) {
    return (
      <div className={lokalStyles.outerjarwrapper + ' skjul-fra-print'}>
        <div className={lokalStyles.jarwrapper + ' skjul-fra-print'}>
          <Textarea label={props.sporsmaal} onChange={(event) => setRespons(event.target.value)} />
          <Alert variant='warning'>
            Ikke skriv inn navn eller andre personopplysninger. Dette er en anonym tilbakemelding og blir kun brukt til
            å forbedre tjenesten. Du vil ikke få et svar fra oss.
          </Alert>
          <Button variant='secondary-neutral' onClick={() => sendResponse()}>
            Send tilbakemelding
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={lokalStyles.outerjarwrapper + ' skjul-fra-print'}>
      <div className={lokalStyles.jarthankswrapper + ' skjul-fra-print'}>
        <FaceSmileIcon title='Takk' fontSize='2.5rem' />
        <BodyLong>Vi setter pris på din tilbakemelding!</BodyLong>
      </div>
    </div>
  );
}
