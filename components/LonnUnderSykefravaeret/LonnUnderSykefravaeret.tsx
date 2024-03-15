import { Alert, BodyShort, Link } from '@navikt/ds-react';
import { LonnISykefravaeret, RefusjonskravetOpphoerer, YesNo } from '../../state/state';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import { EndringsBeloep } from '../RefusjonArbeidsgiver/RefusjonUtbetalingEndring';
import lokalStyle from './LonnUnderSykefravaeret.module.css';
import lokalStyles from '../../pages/kvittering/Kvittering.module.css';
import { harGyldigeRefusjonEndringer } from '../../utils/harGyldigeRefusjonEndringer';

interface LonnUnderSykefravaeretProps {
  lonn: LonnISykefravaeret;
  refusjonskravetOpphoerer?: RefusjonskravetOpphoerer;
  harRefusjonEndringer?: YesNo;
  refusjonEndringer?: Array<EndringsBeloep>;
}

export default function LonnUnderSykefravaeret({
  lonn,
  refusjonskravetOpphoerer,
  harRefusjonEndringer,
  refusjonEndringer
}: Readonly<LonnUnderSykefravaeretProps>) {
  if (!lonn) return null;
  if (lonn.status === 'Nei')
    return (
      <>
        <div className={lokalStyles.uthevet}>
          Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?
        </div>
        <div className={lokalStyle.wrapper}>Nei</div>
      </>
    );
  return (
    <>
      <div className={lokalStyles.uthevet}>
        Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?
      </div>
      <div>
        <BodyShort>Ja</BodyShort>
        {lonn && lonn.status === 'Ja' && (
          <>
            <div className={lokalStyle.uthevet}>Refusjonsbeløp per måned (NAV vil refundere opp til 6G av årslønn)</div>
            <BodyShort className={lokalStyle.svartekster}>{formatCurrency(lonn.beloep)} kr/måned</BodyShort>
          </>
        )}
        {harGyldigeRefusjonEndringer(refusjonEndringer) && (
          <>
            {harRefusjonEndringer === 'Nei' && (
              <>
                <div className={lokalStyle.uthevet}>Er det endringer i refusjonsbeløpet i perioden?</div>
                <BodyShort>{harRefusjonEndringer}</BodyShort>
              </>
            )}
            {harRefusjonEndringer === 'Ja' && refusjonEndringer!.length > 0 && (
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
                      <td>{formatCurrency(endring.beloep)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
        <div className={lokalStyle.uthevet}>Opphører refusjonkravet i perioden</div>
        <BodyShort className={lokalStyle.svartekster}>{refusjonskravetOpphoerer.status}</BodyShort>

        {refusjonskravetOpphoerer && refusjonskravetOpphoerer.status === 'Ja' && (
          <>
            <div className={lokalStyle.uthevet}>Opphørsdato</div>
            <BodyShort className={lokalStyle.svartekster}>
              {formatDate(refusjonskravetOpphoerer.opphoersdato)}
            </BodyShort>
          </>
        )}
      </div>
      <Alert variant='info'>
        Husk å kontroller at dere har rapportert inn korrekt kontonummer til Altinn for å motta refusjon fra NAV. Dere
        finner{' '}
        <Link
          href='https://info.altinn.no/skjemaoversikt/arbeids--og-velferdsetaten-nav/bankkontonummer-for-refusjoner-fra-nav-til-arbeidsgiver/'
          target='_blank'
        >
          skjema for rapportering av kontonummer i Altinn.
        </Link>
      </Alert>
    </>
  );
}
