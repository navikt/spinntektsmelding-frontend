import { Alert, BodyShort, Link } from '@navikt/ds-react';
import { LonnISykefravaeret, YesNo } from '../../state/state';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import lokalStyle from './LonnUnderSykefravaeret.module.css';
import lokalStyles from '../../pages/kvittering/Kvittering.module.css';
import { harGyldigeRefusjonEndringer } from '../../utils/harGyldigeRefusjonEndringer';
import parseIsoDate from '../../utils/parseIsoDate';
import z from 'zod';
import { RefusjonEndringSchema } from '../../schema/RefusjonEndringSchema';

type EndringsBeloep = z.infer<typeof RefusjonEndringSchema>;

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
        {loenn?.status === 'Ja' && (
          <>
            <div className={lokalStyle.uthevet}>Refusjonsbeløp per måned (Nav vil refundere opp til 6G av årslønn)</div>
            <BodyShort className={lokalStyle.svartekster}>{formatCurrency(loenn.beloep)} kr/måned</BodyShort>
          </>
        )}
        {harGyldigeRefusjonEndringer(refusjonEndringer) && (
          <>
            {harRefusjonEndringer === 'Nei' && (
              <div className={lokalStyle.uthevet}>
                Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?
              </div>
            )}
            {harRefusjonEndringer === 'Ja' && refusjonEndringer!.length > 0 && (
              <table className={lokalStyle.loennTabell}>
                <thead>
                  <tr>
                    <th scope='col' className={lokalStyle.uthevet}>
                      Dato for endring
                    </th>
                    <th scope='col' className={lokalStyle.uthevet}>
                      Endret refusjonsbeløp
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {refusjonEndringer?.map((endring) => (
                    <tr key={endring.startdato?.toString() + endring.beloep.toString()}>
                      <td>{formatDate(parseIsoDate(endring.startdato))}</td>
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
        Husk å kontroller at du har rapportert inn korrekt kontonummer for å motta refusjon fra Nav. Dere finner{' '}
        <Link href='https://www.nav.no/arbeidsgiver/endre-kontonummer' target='_blank'>
          skjema for rapportering av kontonummer her.
        </Link>
      </Alert>
    </>
  );
}
