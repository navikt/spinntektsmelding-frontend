import formatIsoDate from './formatIsoDate';
import NetworkError from './NetworkError';

const fetchInntektsdata = async (url: string, forespoerselId: string, inntektsdato: Date | undefined) => {
  if (!inntektsdato) {
    throw new Error('No inntektsdato provided');
  }

  const formatertInntektsdatoIso = formatIsoDate(inntektsdato);
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      forespoerselId: forespoerselId,
      inntektsdato: formatertInntektsdatoIso
    })
  })
    .then((res) => {
      if (!res.ok) {
        const error = new NetworkError('An error occurred while fetching the data.');

        try {
          error.info = res;
        } catch (errorStatus) {
          error.info = { errorStatus };
        }
        error.status = res.status;
        throw error;
      }

      return res.json().then((data) => {
        return { status: res.status, data };
      });
    })
    .catch((error) => {
      const networkError = new NetworkError('An error occurred while fetching the data.');

      networkError.info = (error as Error).message;
      networkError.status = error.status;
      throw networkError;
    });
};

export default fetchInntektsdata;
