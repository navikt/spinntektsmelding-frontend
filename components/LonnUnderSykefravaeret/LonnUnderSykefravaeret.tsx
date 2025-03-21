import { Alert, BodyShort, Link } from '@navikt/ds-react';
import { LonnISykefravaeret, YesNo } from '../../state/state';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import { EndringsBeloep } from '../RefusjonArbeidsgiver/RefusjonUtbetalingEndring';
import lokalStyle from './LonnUnderSykefravaeret.module.css';
import lokalStyles from '../../pages/kvittering/Kvittering.module.css';
import { harGyldigeRefusjonEndringer } from '../../utils/harGyldigeRefusjonEndringer';

interface LonnUnderSykefravaeretProps {
  loenn: LonnISykefravaeret;
  harRefusjonEndringer?: YesNo;
  refusjonEndringer?: Array<EndringsBeloep>;
}

export default function LonnUnderSykefravaeret({
  loenn,
  harRefusjonEndringer,
  refusjonEndringer
}: Readonly<LonnUnderSykefravaeretProps>) {
  if (!loenn) return null;
  if (loenn.status === 'Nei')
    return (
      <>
        <div className={lokalStyles.uthevet}>Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?</div>
        <div className={lokalStyle.wrapper}>Nei</div>
      </>
    );
  return (
    <>
      <div className={lokalStyles.uthevet}>Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?</div>
      <div className={lokalStyle.oppsummering}>
        <BodyShort>Ja</BodyShort>
        {loenn && loenn.status === 'Ja' && (
          <>
            <div className={lokalStyle.uthevet}>Refusjonsbeløp per måned (Nav vil refundere opp til 6G av årslønn)</div>
            <BodyShort className={lokalStyle.svartekster}>{formatCurrency(loenn.beloep)} kr/måned</BodyShort>
          </>
        )}
        {harGyldigeRefusjonEndringer(refusjonEndringer) && (
          <>
            {harRefusjonEndringer === 'Nei' && (
              <>
                <div className={lokalStyle.uthevet}>
                  Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?
                </div>
                <BodyShort>{harRefusjonEndringer}</BodyShort>
              </>
            )}
            {harRefusjonEndringer === 'Ja' && refusjonEndringer!.length > 0 && (
              <table className={lokalStyle.loennTabell}>
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
      </div>
      <Alert variant='info'>
        Husk å kontroller at du har rapportert inn korrekt kontonummer til Altinn for å motta refusjon fra Nav. Dere
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
