import { logger } from '@navikt/next-logger';

const handleProxyInit = (proxy: any) => {
  proxy.on('error', function (err: any, _req: any, res: any) {
    logger.error({ err }, 'Proxy error');
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });

    res.end('Something went wrong.');
  });

  proxy.on('proxyReq', function (proxyReq: any, _req: any, _res: any, _options: any) {
    proxyReq.setHeader('cookie', '');
  });
};

export default handleProxyInit;
