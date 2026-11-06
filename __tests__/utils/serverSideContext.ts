import type { GetServerSidePropsContext } from 'next';
import { createRequest, createResponse } from 'node-mocks-http';

export function serverSideContext(
  query: GetServerSidePropsContext['query']
): GetServerSidePropsContext<{ kvittid: string }> {
  return {
    query,
    req: createRequest(),
    res: createResponse(),
    resolvedUrl: ''
  };
}
