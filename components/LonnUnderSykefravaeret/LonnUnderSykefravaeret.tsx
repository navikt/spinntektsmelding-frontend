import { BodyShort } from '@navikt/ds-react';
import { LonnISykefravaeret, RefusjonskravetOpphoerer, YesNo } from '../../state/state';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
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
    <div>
      <BodyShort>Ja</BodyShort>
      {refusjonEndringer?.length > 0 && (
        <>
          <div className={lokalStyle.uthevet}>Refusjonsbeløp per måned (NAV vil refundere opp til 6G av årslønn)</div>
          <BodyShort className={lokalStyle.svartekster}>{formatCurrency(lonn.belop)} kr/måned</BodyShort>
          {refusjonskravetOpphoerer && (
            <>
              {harRefusjonEndringer && (
                <>
                  <div className={lokalStyle.uthevet}>Er det endringer i refusjonsbeløpet i perioden?</div>
                  <BodyShort>{refusjonEndringer?.length > 0 ? 'Ja' : 'Nei'}</BodyShort>
                  {refusjonEndringer?.length > 0 && (
                    <table className={lokalStyle.lonnTabell}>
                      <thead>
                        <tr>
                          <td className={lokalStyle.uthevet}>Dato for endring</td>
                          <td className={lokalStyle.uthevet}>Endret refusjonsbeløp</td>
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
              <div className={lokalStyle.uthevet}>Opphører refusjonkravet i perioden</div>
              <BodyShort className={lokalStyle.svartekster}>{refusjonskravetOpphoerer.status}</BodyShort>
              {refusjonskravetOpphoerer.status === 'Ja' && (
                <>
                  <div className={lokalStyle.uthevet}>Opphørsdato</div>
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
