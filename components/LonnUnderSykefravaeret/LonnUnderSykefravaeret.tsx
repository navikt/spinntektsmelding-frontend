import { BodyShort } from '@navikt/ds-react';
import { LonnISykefravaeret, RefusjonskravetOpphoerer } from '../../state/state';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import Heading4 from '../Heading4';
import lokalStyle from './LonnUnderSykefravaeret.module.css';

interface LonnUnderSykefravaeretProps {
  lonn: LonnISykefravaeret;
  refusjonskravetOpphoerer?: RefusjonskravetOpphoerer;
}

export default function LonnUnderSykefravaeret({ lonn, refusjonskravetOpphoerer }: LonnUnderSykefravaeretProps) {
  if (!lonn) return null;
  if (lonn.status === 'Nei') return <div className={lokalStyle.wrapper}>Nei</div>;

  return (
    <div className={lokalStyle.wrapper}>
      <BodyShort className={lokalStyle.svartekster}>Ja</BodyShort>
      {lonn.belop && (
        <>
          <Heading4>Refusjonsbeløp per måned</Heading4>
          <BodyShort className={lokalStyle.svartekster}>{formatCurrency(lonn.belop!)} kr/måned</BodyShort>
          {refusjonskravetOpphoerer && (
            <>
              <Heading4>Opphører refusjonkravet i perioden</Heading4>
              <BodyShort className={lokalStyle.svartekster}>{refusjonskravetOpphoerer.status}</BodyShort>
              {refusjonskravetOpphoerer.status === 'Ja' && (
                <>
                  <Heading4>Opphørsdato</Heading4>
                  <BodyShort className={lokalStyle.svartekster}>
                    {formatDate(refusjonskravetOpphoerer.opphorsdato)}
                  </BodyShort>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
