import NextDocument, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
import { Components, fetchDecoratorReact } from '@navikt/nav-dekoratoren-moduler/ssr';
import getConfig from 'next/config';
import env from '../config/environment';

const { serverRuntimeConfig } = getConfig();

interface DocumentProps {
  Decorator: Components;
}

const Document = ({ Decorator }: DocumentProps) => {
  const viseDekoratoren = !serverRuntimeConfig.decoratorDisabled;
  const serverVar = serverRuntimeConfig.serverVar;

  return (
    <Html>
      <Head>
        {viseDekoratoren ? <Decorator.Styles /> : null}
        <meta
          property='og:test'
          content={
            process.env.NEXT_PUBLIC_TEST_STUFF + '-' + env.otherTestStuff + '-' + env.environment + '-' + serverVar
          }
          key='test'
        />
      </Head>
      <body>
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
    context: 'arbeidsgiver',
    chatbot: false,
    feedback: false,
    urlLookupTable: false
  });

  return {
    ...initialProps,
    Decorator
  };
};

export default Document;
