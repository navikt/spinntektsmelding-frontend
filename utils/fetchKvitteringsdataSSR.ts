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
        const error = new NetworkError('An error occurred while fetching the data.');
        // Attach extra info to the error object.
        try {
          error.info = res;
        } catch (errorStatus) {
          error.info = { errorStatus };
        }
        error.status = res.status;
        return Promise.reject(error);
      }

      return res
        .json()
        .then((data) => {
          return { status: res.status, data };
        })
        .catch((res) => {
          const jsonError = new NetworkError('An error occurred while decoding the data.');
          // Attach extra info to the error object.

          jsonError.status = res.status;
          return Promise.reject(jsonError);
        });
    })
    .catch((errorRes) => {
      const error = new NetworkError(errorRes.message ?? 'An error occurred while fetching the data...');
      error.status = errorRes.status;
      error.info = errorRes;
      return Promise.reject(error);
    });
};

export default fetchKvitteringsdataSSR;
