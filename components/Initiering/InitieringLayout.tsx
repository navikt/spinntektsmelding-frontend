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
  nyeSelvbestemteAlternativer: boolean;
}>;

export default function InitieringLayout({
  children,
  bannertittel = 'Inntektsmelding',
  sidetittel = 'Inntektsmelding sykepenger',
  nyeSelvbestemteAlternativer = false
}: InitieringLayoutProps) {
  const tittelTekst = nyeSelvbestemteAlternativer
    ? 'Hvorfor sender du inntektsmelding uten at Nav har bedt om det?'
    : 'Opprett inntektsmelding for et sykefravær';

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
          <Heading1 id='mainTitle'>{tittelTekst}</Heading1>
          {children}
        </div>
      </PageContent>
    </div>
  );
}
