import '../styles/globals.css';
import '@navikt/ds-css';

import type { AppProps } from 'next/app';

import '../components/PageContent/PageContent.css';
import { configureLogger } from '@navikt/next-logger';

configureLogger({
  basePath: '/im-dialog'
});

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default App;
