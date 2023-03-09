import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
  return (
    <Html>
      <Head>
        <link href='https://www.nav.no/dekoratoren/css/client.css' rel='stylesheet' />
      </Head>
      <body>
        <div id='decorator-header'></div>
        <Main />
        <NextScript />
        <div id='decorator-footer'></div>
        <div id='decorator-env' data-src='https://www.nav.no/dekoratoren/env?context=arbeidsgiver'></div>
        <Script type='text/javascript' async src='https://www.nav.no/dekoratoren/client.js'></Script>
      </body>
    </Html>
  );
}
