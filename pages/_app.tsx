import '../styles/globals.css';
import '@navikt/ds-css';
import 'core-js-pure/actual/structured-clone';
import { getFaro, initInstrumentation, pinoLevelToFaroLevel } from '../utils/faro';
import type { AppProps } from 'next/app';

import '../components/PageContent/PageContent.css';

import { configureLogger } from '@navikt/next-logger';
import env from '../config/environment';

initInstrumentation();
configureLogger({
  basePath: env.baseUrl,
  onLog: (log) =>
    getFaro().api.pushLog(log.messages, {
      level: pinoLevelToFaroLevel(log.level.label)
    })
});

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default App;
