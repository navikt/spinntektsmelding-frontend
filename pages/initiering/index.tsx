import { InfoCard } from '@navikt/ds-react';
import { GetServerSideProps, NextPage } from 'next';
import dynamic from 'next/dynamic';
import { InformationSquareIcon } from '@navikt/aksel-icons';

import InitieringLayout from '../../components/Initiering/InitieringLayout';
import type { InitieringSkjemaProps } from '../../components/Initiering/InitieringSkjema';
import { hentNyeSelvbestemteAlternativer } from '../../utils/unleash.server';

const InitieringSkjema = dynamic<InitieringSkjemaProps>(() => import('../../components/Initiering/InitieringSkjema'), {
  ssr: false,
  loading: () => <output>Forbereder skjemaet...</output>
});

export const getServerSideProps: GetServerSideProps<InitieringSkjemaProps> = async ({ res, query }) => {
  res.setHeader('Cache-Control', 'private, no-store');
  return {
    props: {
      nyeSelvbestemteAlternativer: await hentNyeSelvbestemteAlternativer(),
      startNyInntektsmelding: query.ny === 'true'
    }
  };
};

const Initiering: NextPage<InitieringSkjemaProps> = (props) => (
  <InitieringLayout bannertittel='Inntektsmelding sykepenger' sidetittel='Inntektsmelding'>
    <InfoCard data-color='info'>
      <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
        <InfoCard.Title>Du vil normalt få et varsel når Nav trenger inntektsmelding.</InfoCard.Title>
      </InfoCard.Header>
      <InfoCard.Content>
        Vi sender ut varsel når arbeidsgiverperioden er ferdig og den sykmeldte har sendt inn søknad om sykepenger. Hvis
        du ikke fått denne oppgaven og du mener at du skal levere inntektsmelding så er det mulig å opprette den
        manuelt.
      </InfoCard.Content>
    </InfoCard>
    <InitieringSkjema {...props} />
  </InitieringLayout>
);

export default Initiering;
