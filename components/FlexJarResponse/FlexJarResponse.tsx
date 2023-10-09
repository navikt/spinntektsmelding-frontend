import { useState } from 'react';
import lokalStyles from './FlexJarResponse.module.css';
import { Alert, BodyLong, Button, Textarea } from '@navikt/ds-react';
import useSendInnFeedback from '../../utils/useSendInnFeedback';
import { FaceSmileIcon } from '@navikt/aksel-icons';
import TextLabel from '../TextLabel';

interface FlexJarResponseProps {
  sporsmaal?: string;
  feedbackId: string;
  kunFeedback?: boolean;
  sporsmaalFeedback: string;
}

export default function FlexJarResponse(props: FlexJarResponseProps) {
  const [respons, setRespons] = useState<string>('');
  const [sendt, setSendt] = useState<boolean>(false);
  const [visFeedback, setVisFeedback] = useState<boolean>(props.kunFeedback);
  const [svarSporsmaal, setSvarSporsmaal] = useState<string>('');

  const sendInnFeedback = useSendInnFeedback();

  const sendResponse = () => {
    sendInnFeedback({
      svar: svarSporsmaal,
      feedbackId: props.feedbackId,
      sporsmal: props.sporsmaal || '',
      feedback: respons,
      app: 'spinntektsmalding-frontend'
    });
    setSendt(true);
  };

  const svarPaaSporsmaal = (svar: string) => {
    setSvarSporsmaal(svar);
    setVisFeedback(true);
  };

  if (!sendt) {
    return (
      <div className={lokalStyles.outerjarwrapper + ' skjul-fra-print'}>
        <div className={lokalStyles.jarwrapper + ' skjul-fra-print'}>
          <TextLabel>{props.sporsmaal}</TextLabel>
          <div className={lokalStyles.buttonwrapper}>
            <Button
              variant={svarSporsmaal === 'Ja' ? 'primary-neutral' : 'secondary-neutral'}
              onClick={() => svarPaaSporsmaal('Ja')}
            >
              Ja
            </Button>
            <Button
              variant={svarSporsmaal === 'Nei' ? 'primary-neutral' : 'secondary-neutral'}
              onClick={() => svarPaaSporsmaal('Nei')}
            >
              Nei
            </Button>
          </div>
          {visFeedback && (
            <>
              <Textarea label={props.sporsmaalFeedback} onChange={(event) => setRespons(event.target.value)} />
              <Alert variant='warning'>
                Ikke skriv inn navn eller andre personopplysninger. Dette er en anonym tilbakemelding og blir kun brukt
                til å forbedre tjenesten. Du vil ikke få et svar fra oss.
              </Alert>
              <Button variant='secondary-neutral' onClick={() => sendResponse()}>
                Send tilbakemelding
              </Button>
            </>
          )}
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
