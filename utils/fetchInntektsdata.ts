import formatIsoDate from './formatIsoDate';
import NetworkError from './NetworkError';

const fetchInntektsdata = async (url: string, forespoerselId: string, skjaeringstidspunkt: Date | undefined) => {
  if (!skjaeringstidspunkt) {
    throw new Error('No skjaeringstidspunkt provided');
  }

  const tidspunkt = formatIsoDate(skjaeringstidspunkt);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      forespoerselId: forespoerselId,
      skjaeringstidspunkt: tidspunkt
    })
  });

  if (!res.ok) {
    const error = new NetworkError('An error occurred while fetching the data.');
    // Attach extra info to the error object.
    try {
      error.info = res;
    } catch (errorStatus) {
      error.info = { errorStatus };
    }
    error.status = res.status;
    throw error;
  }

  try {
    return await res.json();
  } catch (error) {
    const jsonError = new NetworkError('An error occurred while decoding the data.');
    // Attach extra info to the error object.
    jsonError.info = (error as Error).message;
    jsonError.status = res.status;
    throw jsonError;
  }
};

export default fetchInntektsdata;
