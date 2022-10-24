import '../styles/globals.css';
import '@navikt/ds-css';

import type { AppProps } from 'next/app';

import '../components/PageContent/PageContent.css';

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default App;
