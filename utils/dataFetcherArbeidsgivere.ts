import { Organisasjon } from '@navikt/bedriftsmeny/lib/organisasjon';
import NetworkError from './NetworkError';

const dataFetcherArbeidsgivere = async (url: string) => {
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
  const jsonData = await res.json();

  return jsonData.map(
    (data: any): Organisasjon => ({
      Name: data.name as string,
      Type: data.type as string,
      ParentOrganizationNumber: (data.parentOrganizationNumber || '') as string,
      OrganizationForm: data.organizationForm as string,
      OrganizationNumber: data.organizationNumber as string,
      Status: data.status as string
    })
  );
  return res.json();
};

export default dataFetcherArbeidsgivere;
