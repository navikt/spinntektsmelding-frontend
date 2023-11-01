import environment from '../config/environment';
import NetworkError from '../utils/NetworkError';

const getTrenger = (uuid: string) => {
  return fetch(environment.skjemadataUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      uuid
    })
  }).then((res) => {
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
    return res.json();
  });
};

export default getTrenger;
