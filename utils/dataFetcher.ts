import NetworkError from './NetworkError';

const dataFetcher = async (url: string) => {
  const res = await fetch(url, {
    credentials: 'include'
  });

  if (!res.ok) {
    const error = new NetworkError('An error occurred while fetching the data.');
    // Attach extra info to the error object.
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }
  return res.json();
};

export default dataFetcher;
