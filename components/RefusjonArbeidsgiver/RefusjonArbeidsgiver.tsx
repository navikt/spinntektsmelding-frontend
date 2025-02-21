import { Radio, RadioGroup, TextField } from '@navikt/ds-react';
import Heading3 from '../Heading3';
import styles from '../../styles/Home.module.css';

import useBoundStore from '../../state/useBoundStore';
import SelectBegrunnelse from './SelectBegrunnelse';
import RefusjonArbeidsgiverBelop from './RefusjonArbeidsgiverBelop';
import localStyles from './RefusjonArbeidsgiver.module.css';
import formatCurrency from '../../utils/formatCurrency';
import RefusjonUtbetalingEndring from './RefusjonUtbetalingEndring';
import Datovelger from '../Datovelger';
import AlertBetvilerArbeidsevne from '../AlertBetvilerArbeidsevne/AlertBetvilerArbeidsevne';
import { addDays } from 'date-fns';

interface RefusjonArbeidsgiverProps {
  setIsDirtyForm: (dirty: boolean) => void;
  skalViseArbeidsgiverperiode?: boolean;
}

export default function RefusjonArbeidsgiver({
  setIsDirtyForm,
  skalViseArbeidsgiverperiode
}: Readonly<RefusjonArbeidsgiverProps>) {
  const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);
  const fullLonnIArbeidsgiverPerioden = useBoundStore((state) => state.fullLonnIArbeidsgiverPerioden);
  const refusjonskravetOpphoerer = useBoundStore((state) => state.refusjonskravetOpphoerer);
  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);

  const visFeilmeldingTekst = useBoundStore((state) => state.visFeilmeldingTekst);

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

  const setBeloepUtbetaltUnderArbeidsgiverperioden = useBoundStore(
    (state) => state.setBeloepUtbetaltUnderArbeidsgiverperioden
  );
  const arbeidsgiverperiodeDisabled = useBoundStore((state) => state.arbeidsgiverperiodeDisabled);
  const arbeidsgiverperiodeKort = useBoundStore((state) => state.arbeidsgiverperiodeKort);
  const refusjonskravetOpphoererDato = useBoundStore((state) => state.refusjonskravetOpphoererDato);
  const setHarRefusjonEndringer = useBoundStore((state) => state.setHarRefusjonEndringer);
  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);
  const oppdaterRefusjonEndringer = useBoundStore((state) => state.oppdaterRefusjonEndringer);
  const harRefusjonEndringer = useBoundStore((state) => state.harRefusjonEndringer);

  const sisteArbeidsgiverperiode =
    arbeidsgiverperioder && arbeidsgiverperioder.length > 0
      ? arbeidsgiverperioder?.toSorted((a, b) => {
          if (!a.fom || !b.fom) {
            return 0;
          }
          if (a.fom > b.fom) {
            return -1;
          } else if (a.fom < b.fom) {
            return 1;
          }
          return 0;
        })
      : arbeidsgiverperioder;

  const addIsDirtyForm = (fn: (param: any) => void) => {
    return (param: any) => {
      setIsDirtyForm(true);
      fn(param);
    };
  };
  const betvilerArbeidsevne = fullLonnIArbeidsgiverPerioden?.begrunnelse === 'BetvilerArbeidsufoerhet';
  const sisteDagIArbeidsgiverperioden = sisteArbeidsgiverperiode ? sisteArbeidsgiverperiode?.[0]?.tom : new Date();
  const foersteMuligeRefusjonOpphoer = sisteDagIArbeidsgiverperioden
    ? addDays(sisteDagIArbeidsgiverperioden, 1)
    : new Date();

  const betalerArbeidsgiverEtterAgpLegend = arbeidsgiverperiodeDisabled
    ? 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?'
    : 'Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?';

  const betalerArbeidsgiverFullLonnLegend = arbeidsgiverperiodeKort
    ? 'Betaler arbeidsgiver ut full lønn de første 16 dagene?'
    : 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?';
  return (
    <>
      <Heading3 unPadded>Utbetaling og refusjon</Heading3>
      <div>
        {skalViseArbeidsgiverperiode && (
          <>
            <RadioGroup
              legend={betalerArbeidsgiverFullLonnLegend}
              className={styles.radiobuttonWrapper}
              id={'lia-radio'}
              error={visFeilmeldingTekst('lia-radio')}
              onChange={addIsDirtyForm(arbeidsgiverBetalerFullLonnIArbeidsgiverperioden)}
              value={fullLonnIArbeidsgiverPerioden?.status ?? null}
              disabled={arbeidsgiverperiodeDisabled || arbeidsgiverperiodeKort}
            >
              <Radio value='Ja' name='fullLonnIArbeidsgiverPerioden'>
                Ja
              </Radio>
              <Radio value='Nei' name='fullLonnIArbeidsgiverPerioden'>
                Nei
              </Radio>
            </RadioGroup>
            {!arbeidsgiverperiodeDisabled && !arbeidsgiverperiodeKort && (
              <>
                {fullLonnIArbeidsgiverPerioden?.status === 'Nei' && (
                  <>
                    <div className={localStyles.wrapperUtbetaling}>
                      <TextField
                        className={localStyles.refusjonBeloep}
                        label='Utbetalt under arbeidsgiverperiode'
                        onChange={addIsDirtyForm((event) =>
                          setBeloepUtbetaltUnderArbeidsgiverperioden(event.target.value)
                        )}
                        id={'agp.redusertLoennIAgp.beloep'}
                        error={visFeilmeldingTekst('agp.redusertLoennIAgp.beloep')}
                        defaultValue={
                          Number.isNaN(fullLonnIArbeidsgiverPerioden.utbetalt)
                            ? ''
                            : formatCurrency(fullLonnIArbeidsgiverPerioden.utbetalt)
                        }
                      />
                      <SelectBegrunnelse
                        onChangeBegrunnelse={addIsDirtyForm(begrunnelseRedusertUtbetaling)}
                        defaultValue={fullLonnIArbeidsgiverPerioden.begrunnelse}
                        error={visFeilmeldingTekst('agp.redusertLoennIAgp.begrunnelse')}
                      />
                    </div>
                    {betvilerArbeidsevne && <AlertBetvilerArbeidsevne />}
                  </>
                )}
              </>
            )}
          </>
        )}

        <RadioGroup
          legend={betalerArbeidsgiverEtterAgpLegend}
          className={styles.radiobuttonWrapper}
          id={'lus-radio'}
          error={visFeilmeldingTekst('lus-radio')}
          onChange={addIsDirtyForm(arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret)}
          defaultValue={lonnISykefravaeret?.status}
        >
          <Radio value='Ja'>Ja</Radio>
          <Radio value='Nei'>Nei</Radio>
        </RadioGroup>
        {lonnISykefravaeret?.status === 'Ja' && (
          <>
            <RefusjonArbeidsgiverBelop
              bruttoinntekt={lonnISykefravaeret.beloep! || 0}
              onOppdaterBelop={addIsDirtyForm(beloepArbeidsgiverBetalerISykefravaeret)}
              visFeilmeldingTekst={visFeilmeldingTekst}
              arbeidsgiverperiodeDisabled={arbeidsgiverperiodeDisabled}
            />

            <RefusjonUtbetalingEndring
              endringer={refusjonEndringer || []}
              maxDate={refusjonskravetOpphoerer?.opphoersdato}
              minDate={foersteMuligeRefusjonOpphoer}
              onHarEndringer={addIsDirtyForm(setHarRefusjonEndringer)}
              onOppdaterEndringer={addIsDirtyForm(oppdaterRefusjonEndringer)}
              harRefusjonEndringer={harRefusjonEndringer}
              harRefusjonEndringerDefault={harRefusjonEndringer}
            />

            <RadioGroup
              legend='Opphører refusjonkravet i perioden?'
              className={styles.radiobuttonWrapper}
              id={'lus-sluttdato-velg'}
              error={visFeilmeldingTekst('lus-sluttdato-velg')}
              onChange={addIsDirtyForm(refusjonskravetOpphoererStatus)}
              defaultValue={refusjonskravetOpphoerer?.status}
            >
              <Radio value='Ja'>Ja</Radio>
              <Radio value='Nei'>Nei</Radio>
            </RadioGroup>
            {refusjonskravetOpphoerer?.status && refusjonskravetOpphoerer?.status === 'Ja' && (
              <div className={styles.datepickerEscape}>
                <Datovelger
                  fromDate={foersteMuligeRefusjonOpphoer}
                  onDateChange={addIsDirtyForm(refusjonskravetOpphoererDato)}
                  id={'lus-sluttdato'}
                  label='Angi siste dag dere krever refusjon for'
                  error={visFeilmeldingTekst('lus-sluttdato')}
                  defaultSelected={refusjonskravetOpphoerer?.opphoersdato}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
