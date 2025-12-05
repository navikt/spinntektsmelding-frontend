import '../styles/globals.css';
import '@navikt/ds-css';
import '../styles/bedriftsmeny.css';
import type { AppProps } from 'next/app';
import { enableMapSet } from 'immer';
import { useEffect, useRef } from 'react';
enableMapSet();

import '../components/PageContent/PageContent.css';

import { configureLogger } from '@navikt/next-logger';
import env from '../config/environment';

// Faro lastes lazy for å redusere initial bundle størrelse
let faroModule: typeof import('../utils/faro') | null = null;

configureLogger({
  basePath: env.baseUrl,
  onLog: (log) => {
    if (faroModule) {
      const faro = faroModule.getFaro();
      if (faro) {
        return faro.api.pushLog(log.messages, {
          level: faroModule.pinoLevelToFaroLevel(log.level.label)
        });
      }
    }
  }
});

function App({ Component, pageProps }: AppProps) {
  const faroInitialized = useRef(false);

  useEffect(() => {
    if (faroInitialized.current) return;
    faroInitialized.current = true;

    import('../utils/faro').then((module) => {
      faroModule = module;
      module.initInstrumentation();
    });
  }, []);

  return <Component {...pageProps} />;
}

export default App;
