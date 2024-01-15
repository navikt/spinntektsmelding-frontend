import { useState } from 'react';
import lokalStyles from './FlexJarResponse.module.css';
import { Alert, BodyLong, Button, Textarea } from '@navikt/ds-react';
import useSendInnFeedback from '../../utils/useSendInnFeedback';
import { FaceSmileIcon } from '@navikt/aksel-icons';

interface FlexJarResponseProps {
  feedbackId: string;
  visFeedback?: boolean;
}

export default function FlexJarResponseEnkel(props: FlexJarResponseProps) {
  const [respons, setRespons] = useState<string>('');
  const [sendt, setSendt] = useState<boolean>(false);

  const lesbarIdentifikator = 'Mangelfull eller uriktig rapportering til A-ordningen';
  const labelFeedback =
    'For at vi skal kunne forbedre inntektsmeldingen og lage nye bedre alternativer lurer vi på om du kan fortelle kort om grunnen til at du valgte alternativet “Mangelfull eller uriktig rapportering til A-ordningen”.';

  const sendInnFeedback = useSendInnFeedback();

  const sendResponse = () => {
    sendInnFeedback({
      svar: lesbarIdentifikator,
      feedbackId: props.feedbackId,
      sporsmal: labelFeedback,
      feedback: respons,
      app: 'spinntektsmalding-frontend'
    });
    setSendt(true);
  };

  if (!sendt) {
    return (
      <>
        {props.visFeedback && (
          <div className={lokalStyles.outerjarwrapper + ' skjul-fra-print'}>
            <div className={lokalStyles.jarwrapper + ' skjul-fra-print'}>
              <Textarea label={labelFeedback} onChange={(event) => setRespons(event.target.value)} />
              <Alert variant='warning'>
                Ikke skriv inn navn eller andre personopplysninger. Dette er en anonym tilbakemelding og blir kun brukt
                til å forbedre tjenesten. Du vil ikke få et svar fra oss.
              </Alert>
              <Button variant='secondary-neutral' onClick={() => sendResponse()}>
                Send tilbakemelding
              </Button>
            </div>
          </div>
        )}
      </>
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
