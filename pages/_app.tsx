import '../styles/globals.css';
import '@navikt/ds-css';
import { getFaro, initInstrumentation, pinoLevelToFaroLevel } from '../utils/faro';
import type { AppProps } from 'next/app';

import '../components/PageContent/PageContent.css';
import 'react-loading-skeleton/dist/skeleton.css';

import { configureLogger } from '@navikt/next-logger';

initInstrumentation();
configureLogger({
  basePath: '/im-dialog',
  onLog: (log) =>
    getFaro().api.pushLog(log.messages, {
      level: pinoLevelToFaroLevel(log.level.label)
    })
});

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default App;
