import NextDocument, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
import { DecoratorComponents, fetchDecoratorReact } from '@navikt/nav-dekoratoren-moduler/ssr';
import getConfig from 'next/config';
import env from '../config/environment';

const { serverRuntimeConfig } = getConfig();

interface DocumentProps {
  Decorator: DecoratorComponents;
}

const Document = ({ Decorator }: DocumentProps) => {
  const viseDekoratoren = !serverRuntimeConfig.decoratorDisabled;

  return (
    <Html lang='no'>
      <Head>{viseDekoratoren ? <Decorator.HeadAssets /> : null}</Head>
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
