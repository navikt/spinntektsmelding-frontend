import React, { useState } from 'react';
import lokalStyles from './FlexJarResponse.module.css';
import { Alert, BodyLong, Button, Textarea } from '@navikt/ds-react';
import useSendInnFeedback from '../../utils/useSendInnFeedback';
import { FaceSmileIcon } from '@navikt/aksel-icons';
import TextLabel from '../TextLabel';

interface FlexJarResponseProps {
  sporsmaal?: string;
  feedbackId: string;
  kunFeedback?: boolean;
  sporsmaalFeedback: React.ReactNode;
  sporsmaalFeedbackNei?: React.ReactNode;
}

export default function FlexJarResponse(props: Readonly<FlexJarResponseProps>) {
  const [respons, setRespons] = useState<string>('');
  const [sendt, setSendt] = useState<boolean>(false);
  const [visFeedback, setVisFeedback] = useState<boolean>(props.kunFeedback || false);
  const [svarSporsmaal, setSvarSporsmaal] = useState<string>('');

  let sporsmaalFeedbackNei = props.sporsmaalFeedbackNei;

  if (!props.sporsmaalFeedbackNei) {
    sporsmaalFeedbackNei = props.sporsmaalFeedback;
  }

  const sendInnFeedback = useSendInnFeedback();

  const sendResponse = () => {
    sendInnFeedback({
      svar: svarSporsmaal,
      feedbackId: props.feedbackId,
      sporsmal: props.sporsmaal ?? '',
      sporsmalFeedback:
        svarSporsmaal === 'Ja' ? reactToString(props.sporsmaalFeedback) : reactToString(sporsmaalFeedbackNei),
      feedback: respons,
      app: 'spinntektsmelding-frontend'
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
          {!props.kunFeedback && (
            <>
              <TextLabel>{props.sporsmaal}</TextLabel>
              <div className={lokalStyles.buttonWrapper}>
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
            </>
          )}
          {visFeedback && (
            <>
              {svarSporsmaal === 'Nei' && (
                <Textarea label={sporsmaalFeedbackNei} onChange={(event) => setRespons(event.target.value)} />
              )}
              {svarSporsmaal === 'Ja' && (
                <Textarea label={props.sporsmaalFeedback} onChange={(event) => setRespons(event.target.value)} />
              )}

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

function reactToString(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return node.toString();
  }
  if (React.isValidElement(node)) {
    return reactToString(node.props.children);
  }
  if (Array.isArray(node)) {
    return node.map(reactToString).join('');
  }
  return '';
}
