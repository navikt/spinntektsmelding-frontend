import '../styles/globals.css';
import '@navikt/ds-css';
import '../styles/bedriftsmeny.css';
import 'core-js-pure/actual/structured-clone';
import { getFaro, initInstrumentation, pinoLevelToFaroLevel } from '../utils/faro';
import type { AppProps } from 'next/app';

import '../components/PageContent/PageContent.css';

import { configureLogger } from '@navikt/next-logger';
import env from '../config/environment';

if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
  require('../__mocks__');
}

initInstrumentation();
configureLogger({
  basePath: env.baseUrl,
  onLog: (log) => {
    const faro = getFaro();
    if (faro) {
      return faro.api.pushLog(log.messages, {
        level: pinoLevelToFaroLevel(log.level.label)
      });
    }
  }
});

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default App;
