import Document, { Html, Head, Main, NextScript, DocumentContext, type DocumentInitialProps } from 'next/document';
import { DecoratorComponentsReact } from '@navikt/nav-dekoratoren-moduler/ssr';

const DisabledDecorator: DecoratorComponentsReact = {
  Header: () => null,
  Footer: () => null,
  Scripts: () => null,
  HeadAssets: () => null
};

const DECORATOR_DISABLED =
  process.env.NEXT_PUBLIC_DISABLE_DECORATOR === 'true' ||
  process.env.PLAYWRIGHT === 'true' ||
  process.env.NODE_ENV === 'test';

let cachedDecorator: DecoratorComponentsReact | null = null;

let decoratormode = 'ukjent';

export async function loadDecorator(): Promise<DecoratorComponentsReact> {
  if (DECORATOR_DISABLED) {
    decoratormode = 'disabled';
    return DisabledDecorator;
  }
  if (cachedDecorator) {
    decoratormode = 'cached';
    return cachedDecorator;
  }

  try {
    const { fetchDecoratorReact } = await import('@navikt/nav-dekoratoren-moduler/ssr');

    const env =
      process.env.NEXT_PUBLIC_DECORATOR_ENV ?? (process.env.NAIS_CLUSTER_NAME === 'prod-gcp' ? 'prod' : 'dev');

    const { Header, Footer, Scripts, HeadAssets } = await fetchDecoratorReact({
      env,
      params: {
        context: 'arbeidsgiver',
        chatbot: false,
        feedback: false
      }
    });

    cachedDecorator = { Header, Footer, Scripts, HeadAssets };

    return cachedDecorator;
  } catch {
    return DisabledDecorator;
  }
}

interface CustomDocumentProps extends DocumentInitialProps {
  decorator: DecoratorComponentsReact;
}

function CustomDocument(props: Readonly<CustomDocumentProps>) {
  const { decorator } = props;
  const { Header, Footer, Scripts, HeadAssets } = decorator;

  return (
    <Html lang='no'>
      <Head>
        <HeadAssets />
        <meta name='decorator-env' content={process.env.NEXT_PUBLIC_DECORATOR_ENV || ''} />
        <meta name='decorator-disable' content={process.env.NEXT_PUBLIC_DISABLE_DECORATOR || ''} />
        <meta name='decorator-disabled' content={process.env.DECORATOR_DISABLED || ''} />
        <meta name='decorator-disabled-PW' content={process.env.PLAYWRIGHT || ''} />
        <meta name='decorator-disabled-ENV' content={process.env.NODE_ENV || ''} />
        <meta name='decorator-mode' content={decoratormode} />
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
        <script
          defer
          src='https://cdn.nav.no/team-researchops/sporing/sporing.js'
          data-host-url='https://umami.nav.no'
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          data-domains={process.env.NEXT_PUBLIC_UMAMI_DATA_DOMAINS}
        />
      </body>
    </Html>
  );
}

// Fetch initial props (Next still requires using Document.getInitialProps)
CustomDocument.getInitialProps = async (ctx: DocumentContext): Promise<CustomDocumentProps> => {
  const initial = await Document.getInitialProps(ctx);
  const decorator = await loadDecorator();
  return {
    ...initial,
    decorator
  };
};

export default CustomDocument;
