import { getToken, validateToken } from '@navikt/oasis';
import { redirectTilLogin } from './redirectTilLogin';

type KvitteringFetcher<T> = (kvittid: string, token: string | null) => Promise<{ data: T | null }>;

type DataFraBackendChecker<T> = (data: T | null, fromSubmit: boolean) => boolean;

interface GetKvitteringServerSidePropsOptions<T> {
  context: any;
  fetchKvittering: KvitteringFetcher<T>;
  checkDataFraBackend: DataFraBackendChecker<T>;
  errorLogMessage?: string;
}

export async function getKvitteringServerSideProps<T>({
  context,
  fetchKvittering,
  checkDataFraBackend,
  errorLogMessage = 'Error fetching kvittering:'
}: GetKvitteringServerSidePropsOptions<T>) {
  const { kvittid, fromSubmit } = context.query;
  let kvittering: { data: T | null };
  let kvitteringStatus: number | undefined;
  const isDevelopment = process.env.NODE_ENV === 'development';

  const token = getToken(context.req);
  if (!token && !isDevelopment) {
    console.error('Mangler token i header');
    return redirectTilLogin(context);
  }

  const validation = await validateToken(token);
  if (!validation.ok && !isDevelopment) {
    console.error('Validering av token feilet');
    return redirectTilLogin(context);
  }

  try {
    if (fromSubmit) {
      kvittering = { data: null };
      kvitteringStatus = 200;
    } else {
      kvittering = await fetchKvittering(kvittid, token);
      kvitteringStatus = 200;
    }
  } catch (error: any) {
    console.error(errorLogMessage, error);
    kvittering = { data: null };
    kvitteringStatus = error.status;

    if (error.status === 404) {
      return {
        notFound: true
      };
    }
  }

  return {
    props: {
      kvittid,
      kvittering: fromSubmit ? null : kvittering?.data,
      kvitteringStatus: kvitteringStatus,
      dataFraBackend: checkDataFraBackend(kvittering?.data, !!fromSubmit)
    }
  };
}
