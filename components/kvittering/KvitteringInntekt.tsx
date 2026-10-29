import { BodyShort } from '@navikt/ds-react';
import { Fragment } from 'react';
import lokalStyling from '../../pages/kvittering/Kvittering.module.css';
import formatBegrunnelseEndringBruttoinntekt from '../../utils/formatBegrunnelseEndringBruttoinntekt';
import formatCurrency from '../../utils/formatCurrency';
import { KvitteringVisning } from '../../utils/lagKvitteringVisning';
import EndringAarsakVisning from '../EndringAarsakVisning/EndringAarsakVisning';
import Heading2 from '../Heading2/Heading2';
import Skillelinje from '../Skillelinje/Skillelinje';

interface KvitteringInntektProps {
  inntekt: KvitteringVisning['inntekt'];
}

export default function KvitteringInntekt({ inntekt }: Readonly<KvitteringInntektProps>) {
  return (
    <>
      <Skillelinje />
      <Heading2>Beregnet månedslønn</Heading2>
      <BodyShort className={lokalStyling.uthevet}>Registrert inntekt</BodyShort>
      <BodyShort>{formatCurrency(inntekt.beloep)} kr/måned</BodyShort>
      {inntekt.endringAarsaker.map((endring, endringIndex) => (
        <Fragment key={endring.aarsak + endringIndex}>
          <div className={lokalStyling.uthevet}>Endret med årsak</div>
          {formatBegrunnelseEndringBruttoinntekt(endring.aarsak)}
          <EndringAarsakVisning endringAarsak={endring} />
        </Fragment>
      ))}
    </>
  );
}
