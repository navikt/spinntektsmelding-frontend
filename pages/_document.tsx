import Document, { Html, Head, Main, NextScript, DocumentContext, type DocumentInitialProps } from 'next/document';
import getConfig from 'next/config';
import Script from 'next/script';
import React from 'react';

type DecoratorBundle = {
  Header: React.ComponentType<any>;
  Footer: React.ComponentType<any>;
  Scripts: React.ComponentType<any>;
  HeadAssets: React.ComponentType<any>;
};

const DisabledDecorator: DecoratorBundle = {
  Header: () => null,
  Footer: () => null,
  Scripts: () => null,
  HeadAssets: () => null
};

const DECORATOR_DISABLED =
  process.env.DISABLE_DECORATOR === 'true' || process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT === 'true';

let cachedDecorator: DecoratorBundle | null = null;

async function loadDecorator(): Promise<DecoratorBundle> {
  if (DECORATOR_DISABLED) return DisabledDecorator;
  if (cachedDecorator) return cachedDecorator;
  try {
    const mod = await import('@navikt/nav-dekoratoren-moduler/ssr');
    const env = process.env.NAIS_CLUSTER_NAME === 'prod-gcp' ? 'prod' : 'dev';
    // Uses specific env (avoids mod.serverRuntimeConfig for stability)
    const bundle = await mod.fetchDecoratorReact({
      env,
      params: {
        context: 'arbeidsgiver',
        chatbot: false,
        feedback: false
      }
    });
    cachedDecorator = {
      Header: bundle.Header,
      Footer: bundle.Footer,
      Scripts: bundle.Scripts,
      HeadAssets: bundle.HeadAssets
    };
    return cachedDecorator;
  } catch {
    return DisabledDecorator;
  }
}

interface CustomDocumentProps extends DocumentInitialProps {
  decorator: DecoratorBundle;
}

function CustomDocument(props: CustomDocumentProps) {
  const { publicRuntimeConfig } = getConfig();
  const { decorator } = props;
  const { Header, Footer, Scripts, HeadAssets } = decorator;

  return (
    <Html lang='no'>
      <Head>
        <Script
          defer
          strategy='afterInteractive'
          src='https://cdn.nav.no/team-researchops/sporing/sporing.js'
          data-host-url='https://umami.nav.no'
          data-website-id={publicRuntimeConfig.umamiWebsiteId}
          data-domains={publicRuntimeConfig.umamiDataDomains}
        />
        <HeadAssets />
      </Head>
      <body id='body'>
        <div suppressHydrationWarning>
          <Header />
        </div>
        <div>
          <Main />
        </div>
        <div suppressHydrationWarning>
          <Footer />
        </div>
        <div suppressHydrationWarning>
          <Scripts />
        </div>
        <NextScript />
      </body>
    </Html>
  );
}

// Henter initial props (Next krever fortsatt å bruke Document.getInitialProps)
CustomDocument.getInitialProps = async (ctx: DocumentContext): Promise<CustomDocumentProps> => {
  const initial = await Document.getInitialProps(ctx);
  const decorator = await loadDecorator();
  return {
    ...initial,
    decorator
  };
};

export default CustomDocument;
