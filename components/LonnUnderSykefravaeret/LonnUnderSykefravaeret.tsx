import { BodyShort } from '@navikt/ds-react';
import { LonnISykefravaeret, RefusjonskravetOpphoerer, YesNo } from '../../state/state';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import Heading4 from '../Heading4';
import { EndringsBelop } from '../RefusjonArbeidsgiver/RefusjonUtbetalingEndring';
import lokalStyle from './LonnUnderSykefravaeret.module.css';

interface LonnUnderSykefravaeretProps {
  lonn: LonnISykefravaeret;
  refusjonskravetOpphoerer?: RefusjonskravetOpphoerer;
  harRefusjonEndringer?: YesNo;
  refusjonEndringer?: Array<EndringsBelop>;
}

export default function LonnUnderSykefravaeret({
  lonn,
  refusjonskravetOpphoerer,
  harRefusjonEndringer,
  refusjonEndringer
}: LonnUnderSykefravaeretProps) {
  if (!lonn) return null;
  if (lonn.status === 'Nei') return <div className={lokalStyle.wrapper}>Nei</div>;

  return (
    <div className={lokalStyle.wrapper}>
      <BodyShort className={lokalStyle.svartekster}>Ja</BodyShort>
      {lonn.belop && (
        <>
          <Heading4>Refusjonsbeløp per måned</Heading4>
          <BodyShort className={lokalStyle.svartekster}>{formatCurrency(lonn.belop)} kr/måned</BodyShort>
          {refusjonskravetOpphoerer && (
            <>
              {harRefusjonEndringer && (
                <>
                  <Heading4>Er det endringer i månedslønn i perioden?</Heading4>
                  <BodyShort>{harRefusjonEndringer}</BodyShort>
                  {harRefusjonEndringer === 'Ja' && (
                    <table>
                      <thead>
                        <tr>
                          <td>Dato</td>
                          <td>Beløp</td>
                        </tr>
                      </thead>
                      <tbody>
                        {refusjonEndringer?.map((endring) => (
                          <tr key={endring.dato?.toString()}>
                            <td>{formatDate(endring.dato)}</td>
                            <td>{formatCurrency(endring.belop)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}
              <Heading4>Opphører refusjonkravet i perioden</Heading4>
              <BodyShort className={lokalStyle.svartekster}>{refusjonskravetOpphoerer.status}</BodyShort>
              {refusjonskravetOpphoerer.status === 'Ja' && (
                <>
                  <BodyShort className={lokalStyle.svartekster}>
                    Opphørsdato: {formatDate(refusjonskravetOpphoerer.opphorsdato)}
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
