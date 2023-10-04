// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

// import getConfig from 'next/config';
import { beskyttetApi } from '../../../auth/beskyttetApi';
import { proxyKallTilBackend } from '../../../proxy/backendproxy';

const tillatteApier = ['POST /api/v1/feedback'];
// const { serverRuntimeConfig } = getConfig();

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  await proxyKallTilBackend({
    req,
    res,
    tillatteApier,
    backend: 'flexjar-backend',
    hostname: global.process.env.FLEXJAR_URL!,
    backendClientId: global.process.env.FLEXJAR_BACKEND_CLIENT_ID,
    https: false
  });
});

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true
  }
};

export default handler;
