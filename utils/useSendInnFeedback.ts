import { logger } from '@navikt/next-logger';
import environment from '../config/environment';

interface Feedback {
  feedbackId: string;
  feedback: string;
  svar: string;
  app: string;
  sporsmal: string;
}

export default function useSendInnFeedback() {
  return (feedback: Feedback) => {
    return fetch(`${environment.flexjarUrl}`, {
      // return await fetchJsonMedRequestId(`/syk/sykepengesoknad/api/flexjar-backend/api/v1/feedback`, {
      body: JSON.stringify(feedback),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).then((response) => {
      if (response.ok) {
        logger.info('Feedback sendt');
      }
      return response;
    });
  };
}
