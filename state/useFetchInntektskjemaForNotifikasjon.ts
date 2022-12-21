import NetworkError from '../utils/NetworkError';
import useFetch from 'use-http';

const useFetchInntektskjemaForNotifikasjon = (url: string) => {
  const { post, response } = useFetch(url);

  return async (url: string, uuid: string) => {
    const res = await post(url, {
      uuid
    });

    // if (!response.ok) {
    //   const error = new NetworkError('An error occurred while fetching the data.');
    //   // Attach extra info to the error object.
    //   try {
    //     error.info = res;
    //   } catch (errorStatus) {
    //     error.info = { errorStatus };
    //   }
    //   error.status = response.status;
    //   throw error;
    // }
    // try {
    //   return res;
    // } catch (_error) {
    //   const jsonError = new NetworkError('An error occurred while decoding the data.');
    //   // Attach extra info to the error object.
    //   jsonError.info = await res.json();
    //   jsonError.status = res.status;
    //   throw jsonError;
    // }

    return res;
  };
};

export default useFetchInntektskjemaForNotifikasjon;
