import type { ReactNode } from 'react';
import Head from 'next/head';
import BannerUtenVelger from '../BannerUtenVelger/BannerUtenVelger';
import Heading1 from '../Heading1/Heading1';
import PageContent from '../PageContent/PageContent';
import styles from '../../styles/Home.module.css';

type InitieringLayoutProps = Readonly<{
  children: ReactNode;
  bannertittel?: string;
  sidetittel?: string;
}>;

export default function InitieringLayout({
  children,
  bannertittel = 'Inntektsmelding',
  sidetittel = 'Inntektsmelding sykepenger'
}: InitieringLayoutProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Innsending av oppdatert informasjon om inntektsmelding</title>
        <meta name='description' content='Innsending av inntektsmelding' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <BannerUtenVelger tittelMedUnderTittel={bannertittel} />
      <PageContent title={sidetittel}>
        <div className={styles.padded}>
          <Heading1 id='mainTitle'>Opprett inntektsmelding for et sykefravær</Heading1>
          {children}
        </div>
      </PageContent>
    </div>
  );
}
