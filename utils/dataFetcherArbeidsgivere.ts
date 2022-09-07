import { Organisasjon } from '@navikt/bedriftsmeny/lib/organisasjon';
import { MottatArbeidsgiver } from '../state/MottattData';
import NetworkError from './NetworkError';

const dataFetcherArbeidsgivere = async (url: string) => {
  const res = await fetch(url, {
    credentials: 'include'
  });

  if (!res.ok) {
    const error = new NetworkError('An error occurred while fetching the data.');
    // Attach extra info to the error object.
    try {
      error.info = await res.json();
    } catch (errorStatus) {
      error.info = { errorStatus };
    }
    error.status = res.status;
    throw error;
  }
  try {
    const jsonData = await res.json();

    return jsonData.map(
      (data: MottatArbeidsgiver): Organisasjon => ({
        Name: data.name as string,
        Type: data.type as string,
        ParentOrganizationNumber: (data.parentOrganizationNumber || '') as string,
        OrganizationForm: data.organizationForm as string,
        OrganizationNumber: data.organizationNumber as string,
        Status: data.status as string
      })
    );
  } catch (_error) {
    const jsonError = new NetworkError('An error occurred while decoding the data.');
    // Attach extra info to the error object.
    jsonError.info = await res.json();
    jsonError.status = res.status;
    throw jsonError;
  }
};

export default dataFetcherArbeidsgivere;
