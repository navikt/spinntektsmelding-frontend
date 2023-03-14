import NextDocument, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
import { Components, fetchDecoratorReact } from '@navikt/nav-dekoratoren-moduler/ssr';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

interface DocumentProps {
  Decorator: Components;
}

const Document = ({ Decorator }: DocumentProps) => {
  return (
    <Html>
      <Head>
        <Decorator.Styles />
      </Head>
      <body>
        <Decorator.Header />
        <Main />
        <Decorator.Footer />
        <Decorator.Scripts />
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
