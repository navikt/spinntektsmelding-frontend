import NextDocument, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
import { Components, fetchDecoratorReact } from '@navikt/nav-dekoratoren-moduler/ssr';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

interface DocumentProps {
  Decorator: Components;
}

const Document = ({ Decorator }: DocumentProps) => {
  const viseDekoratoren = serverRuntimeConfig.decoratorEnabled;

  return (
    <Html>
      <Head>{viseDekoratoren ? <Decorator.Styles /> : null}</Head>
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
    simple: true,
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
