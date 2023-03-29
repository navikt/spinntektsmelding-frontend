import NetworkError from '../utils/NetworkError';

const fetchInntektskjemaForNotifikasjon = async (url: string, uuid: string) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      uuid
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
  } catch (_error) {
    const jsonError = new NetworkError('An error occurred while decoding the data.');
    // Attach extra info to the error object.
    jsonError.info = await res.json();
    jsonError.status = res.status;
    throw jsonError;
  }
};

export default fetchInntektskjemaForNotifikasjon;
