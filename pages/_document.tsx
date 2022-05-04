// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

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
        <div id='decorator-env' data-src='{MILJO_URL}/env?{DINE_PARAMETERE}'></div>
        <script async={true} src='https://www.nav.no/dekoratoren/client.js'></script>
      </body>
    </Html>
  );
}
