import { BodyLong, Radio, RadioGroup, TextField } from '@navikt/ds-react';
import Heading3 from '../Heading3';
import styles from '../../styles/Home.module.css';

import useBoundStore from '../../state/useBoundStore';
import RefsjonArbeidsgiverSluttdato from './RefsjonArbeidsgiverSluttdato';
import SelectBegrunnelse from './SelectBegrunnelse';
import RefusjonArbeidsgiverBelop from './RefusjonArbeidsgiverBelop';
import localStyles from './RefusjonArbeidsgiver.module.css';
import formatCurrency from '../../utils/formatCurrency';
import RefusjonUtbetalingEndring from './RefusjonUtbetalingEndring';

export default function RefusjonArbeidsgiver() {
  const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);
  const fullLonnIArbeidsgiverPerioden = useBoundStore((state) => state.fullLonnIArbeidsgiverPerioden);
  const refusjonskravetOpphoerer = useBoundStore((state) => state.refusjonskravetOpphoerer);
  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt);

  const visFeilmeldingsTekst = useBoundStore((state) => state.visFeilmeldingsTekst);

  const arbeidsgiverBetalerFullLonnIArbeidsgiverperioden = useBoundStore(
    (state) => state.arbeidsgiverBetalerFullLonnIArbeidsgiverperioden
  );
  const arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret = useBoundStore(
    (state) => state.arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret
  );
  const begrunnelseRedusertUtbetaling = useBoundStore((state) => state.begrunnelseRedusertUtbetaling);
  const beloepArbeidsgiverBetalerISykefravaeret = useBoundStore(
    (state) => state.beloepArbeidsgiverBetalerISykefravaeret
  );
  const refusjonskravetOpphoererStatus = useBoundStore((state) => state.refusjonskravetOpphoererStatus);

  const beloepUtbetaltUnderArbeidsgiverperioden = useBoundStore(
    (state) => state.beloepUtbetaltUnderArbeidsgiverperioden
  );

  const refusjonskravetOpphoererDato = useBoundStore((state) => state.refusjonskravetOpphoererDato);
  const setHarRefusjonEndringer = useBoundStore((state) => state.setHarRefusjonEndringer);
  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);
  const oppdaterRefusjonEndringer = useBoundStore((state) => state.oppdaterRefusjonEndringer);

  return (
    <>
      <Heading3>Refusjon til arbeidsgiver</Heading3>
      <BodyLong>
        Vi må vite om arbeidsgiver betaler ut lønn under sykemeldingsperioden til arbeidstakeren, eller om NAV skal
        betale ut sykepenger til den sykemeldte etter arbeidsgiverperioden.
      </BodyLong>

      <div>
        <RadioGroup
          legend='Betaler arbeidsgiver ut full lønn til arbeidstaker i arbeidsgiverperioden?'
          className={styles.radiobuttonwrapper}
          id={'lia-radio'}
          error={visFeilmeldingsTekst('lia-radio')}
          onChange={arbeidsgiverBetalerFullLonnIArbeidsgiverperioden}
          defaultValue={fullLonnIArbeidsgiverPerioden?.status}
        >
          <Radio value='Ja' name='fullLonnIArbeidsgiverPerioden'>
            Ja
          </Radio>
          <Radio value='Nei' name='fullLonnIArbeidsgiverPerioden'>
            Nei
          </Radio>
        </RadioGroup>
        {fullLonnIArbeidsgiverPerioden?.status === 'Nei' && (
          <div className={localStyles.wraputbetaling}>
            <TextField
              className={localStyles.refusjonsbelop}
              label='Utbetalt under arbeidsgiverperiode'
              onChange={(event) => beloepUtbetaltUnderArbeidsgiverperioden(event.target.value)}
              id={'lus-uua-input'}
              error={visFeilmeldingsTekst('lus-uua-input')}
              defaultValue={
                fullLonnIArbeidsgiverPerioden.utbetalt ? formatCurrency(fullLonnIArbeidsgiverPerioden.utbetalt) : ''
              }
            />
            <SelectBegrunnelse
              onChangeBegrunnelse={begrunnelseRedusertUtbetaling}
              defaultValue={fullLonnIArbeidsgiverPerioden.begrunnelse}
            />
          </div>
        )}

        <RadioGroup
          legend='Betaler arbeidsgiver lønn etter arbeidsgiverperioden?'
          className={styles.radiobuttonwrapper}
          id={'lus-radio'}
          error={visFeilmeldingsTekst('lus-radio')}
          onChange={arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret}
          defaultValue={lonnISykefravaeret?.status}
        >
          <Radio value='Ja'>Ja</Radio>
          <Radio value='Nei'>Nei</Radio>
        </RadioGroup>
        {lonnISykefravaeret?.status === 'Ja' && (
          <>
            <RefusjonArbeidsgiverBelop
              bruttoinntekt={bruttoinntekt.bruttoInntekt}
              onOppdaterBelop={beloepArbeidsgiverBetalerISykefravaeret}
              visFeilmeldingsTekst={visFeilmeldingsTekst}
            />

            <RefusjonUtbetalingEndring
              endringer={refusjonEndringer || []}
              maxDate={refusjonskravetOpphoerer?.opphorsdato}
              onHarEndringer={setHarRefusjonEndringer}
              onOppdaterEndringer={oppdaterRefusjonEndringer}
            />

            <RadioGroup
              legend='Opphører refusjonkravet i perioden?'
              className={styles.radiobuttonwrapper}
              id={'lus-sluttdato-velg'}
              error={visFeilmeldingsTekst('lus-sluttdato-velg')}
              onChange={refusjonskravetOpphoererStatus}
              defaultValue={refusjonskravetOpphoerer?.status}
            >
              <Radio value='Ja'>Ja</Radio>
              <Radio value='Nei'>Nei</Radio>
            </RadioGroup>
            {refusjonskravetOpphoerer?.status && refusjonskravetOpphoerer?.status === 'Ja' && (
              <div className={styles.datepickerescape}>
                <RefsjonArbeidsgiverSluttdato
                  defaultValue={refusjonskravetOpphoerer.opphorsdato}
                  onDateChange={refusjonskravetOpphoererDato}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
