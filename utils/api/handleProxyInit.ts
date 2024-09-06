const handleProxyInit = (proxy: any) => {
  /**
   * Check the list of bindable events in the `http-proxy` specification.
   * @see https://www.npmjs.com/package/http-proxy#listening-for-proxy-events
   */
  proxy.on('error', function (err: any, _req: any, res: any) {
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });

    res.end('Something went wrong. ' + JSON.stringify(err));
  });

  // proxy.on('proxyRes', function (proxyRes: any, _req: any, _res: any) {
  //   console.log('RAW Response from the target', JSON.stringify(proxyRes.headers));
  // });

  proxy.on('proxyReq', function (proxyReq: any, _req: any, _res: any, _options: any) {
    proxyReq.setHeader('cookie', '');
  });
};

export default handleProxyInit;
