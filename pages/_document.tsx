import NextDocument, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
import { DecoratorComponentsReact, fetchDecoratorReact } from '@navikt/nav-dekoratoren-moduler/ssr';
import getConfig from 'next/config';
import Script from 'next/script';

const { serverRuntimeConfig } = getConfig();

interface DocumentProps {
  Decorator: DecoratorComponentsReact;
}

const Document = ({ Decorator }: DocumentProps) => {
  const viseDekoratoren = !serverRuntimeConfig.decoratorDisabled;

  return (
    <Html lang='no'>
      <Head>
        {viseDekoratoren ? <Decorator.HeadAssets /> : null}
        <Script
          defer
          strategy='afterInteractive'
          src='https://cdn.nav.no/team-researchops/sporing/sporing.js'
          data-host-url='https://umami.nav.no'
          data-website-id={serverRuntimeConfig.umamiWebsiteId}
          data-domains={serverRuntimeConfig.umamiDataDomains}
        ></Script>
      </Head>
      <body id='body'>
        {viseDekoratoren ? <Decorator.Header /> : null}
        <Main />
        {viseDekoratoren ? <Decorator.Footer /> : null}
        {viseDekoratoren ? <Decorator.Scripts /> : null}
        <NextScript />
      </body>
    </Html>
  );
};

Document.getInitialProps = async (ctx: DocumentContext): Promise<DocumentProps> => {
  const initialProps = await NextDocument.getInitialProps(ctx);
  const Decorator = await fetchDecoratorReact({
    env: serverRuntimeConfig.decoratorEnv,
    params: {
      context: 'arbeidsgiver',
      chatbot: false,
      feedback: false
    }
  });

  return {
    ...initialProps,
    Decorator
  };
};

export default Document;
