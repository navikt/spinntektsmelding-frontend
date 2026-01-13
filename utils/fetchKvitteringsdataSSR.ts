import NetworkError from './NetworkError';
import isValidUUID from './isValidUUID';

const fetchKvitteringsdataSSR = (url: string, forespoerselId: string, token?: string) => {
  if (isValidUUID(forespoerselId) === false) {
    return Promise.resolve({ status: 404, data: {} });
  }

  return fetch(`${url}/${forespoerselId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
    .then((res) => {
      if (!res.ok) {
        const fetchError = new NetworkError('An error occurred while fetching the data.');
        // Attach extra info to the error object.
        try {
          fetchError.info = res;
        } catch (error) {
          fetchError.info = { error };
        }
        fetchError.status = res.status;
        throw fetchError;
      }

      return res
        .json()
        .then((data) => {
          return { status: res.status, data };
        })
        .catch((error) => {
          const jsonError = new NetworkError('An error occurred while decoding the data.');
          // Attach extra info to the error object.

          jsonError.status = error.status;
          throw jsonError;
        });
    })
    .catch((error) => {
      const networkError = new NetworkError(error.message ?? 'An error occurred while fetching the data...');
      networkError.status = error.status;
      networkError.info = error;
      throw networkError;
    });
};

export default fetchKvitteringsdataSSR;
