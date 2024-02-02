import { BodyLong, Radio, RadioGroup, TextField } from '@navikt/ds-react';
import Heading3 from '../Heading3';
import styles from '../../styles/Home.module.css';

import useBoundStore from '../../state/useBoundStore';
import SelectBegrunnelse from './SelectBegrunnelse';
import RefusjonArbeidsgiverBelop from './RefusjonArbeidsgiverBelop';
import localStyles from './RefusjonArbeidsgiver.module.css';
import formatCurrency from '../../utils/formatCurrency';
import RefusjonUtbetalingEndring from './RefusjonUtbetalingEndring';
import Datovelger from '../Datovelger';
import LenkeEksternt from '../LenkeEksternt/LenkeEksternt';
import { useState } from 'react';
import LesMer from '../LesMer';

interface RefusjonArbeidsgiverProps {
  setIsDirtyForm: (dirty: boolean) => void;
}

export default function RefusjonArbeidsgiver({ setIsDirtyForm }: RefusjonArbeidsgiverProps) {
  const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);
  const fullLonnIArbeidsgiverPerioden = useBoundStore((state) => state.fullLonnIArbeidsgiverPerioden);
  const refusjonskravetOpphoerer = useBoundStore((state) => state.refusjonskravetOpphoerer);
  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);

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
  const mutableArbeidsgiverperioder = structuredClone(arbeidsgiverperioder);
  const sisteArbeidsgiverperiode = mutableArbeidsgiverperioder?.sort((a, b) => {
    if (!a.fom || !b.fom) {
      return 0;
    }
    if (a.fom > b.fom) {
      return -1;
    } else if (a.fom < b.fom) {
      return 1;
    }
    return 0;
  });

  const addIsDirtyForm = (fn: (param: any) => void) => {
    return (param: any) => {
      setIsDirtyForm(true);
      fn(param);
    };
  };

  const sisteDagIArbeidsgiverperioden = sisteArbeidsgiverperiode ? sisteArbeidsgiverperiode?.[0]?.tom : new Date();
  const [readMoreOpen, setReadMoreOpen] = useState<boolean>(false);

  const betalerArbeidsgiverEtterAgpLegend = arbeidsgiverperiodeDisabled
    ? 'Betaler arbeidsgiver lønn og krever refusjon i sykefraværet?'
    : 'Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?';

  const betalerArbeidsgiverFullLonnLegend = arbeidsgiverperiodeKort
    ? 'Betaler arbeidsgiver ut full lønn de første 16 dagene?'
    : 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?';
  return (
    <>
      <Heading3 unPadded>Utbetaling og refusjon</Heading3>
      <LesMer
        header='Informasjon om refusjon'
        open={readMoreOpen}
        onClick={() => {
          setReadMoreOpen(!readMoreOpen);
        }}
      >
        Arbeidsgiveren kan forskottere sykepenger til den sykmeldte eller velge at NAV skal betale sykepenger direkte
        til den sykmeldte etter arbeidsgiverperioden.{' '}
        <LenkeEksternt
          href='https://www.nav.no/no/bedrift/oppfolging/sykmeldt-arbeidstaker/sykepenger/na%CC%8Ar-du-forskutterer-sykepenger-etter-arbeidsgiverperioden_kap1'
          isHidden={!readMoreOpen}
        >
          Les om de ulike refusjonsreglene.
        </LenkeEksternt>
      </LesMer>
      <BodyLong>
        Vi må vite om arbeidsgiver betaler lønn til den ansatte under sykmeldingsperioden og om NAV skal betale ut
        sykepenger til den ansatte eller bedriften etter arbeidsgiverperioden.{' '}
      </BodyLong>
      <div>
        <RadioGroup
          legend={betalerArbeidsgiverFullLonnLegend}
          className={styles.radiobuttonwrapper}
          id={'lia-radio'}
          error={visFeilmeldingsTekst('lia-radio')}
          onChange={addIsDirtyForm(arbeidsgiverBetalerFullLonnIArbeidsgiverperioden)}
          defaultValue={fullLonnIArbeidsgiverPerioden?.status || null}
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
              <div className={localStyles.wraputbetaling}>
                <TextField
                  className={localStyles.refusjonsbelop}
                  label='Utbetalt under arbeidsgiverperiode'
                  onChange={addIsDirtyForm((event) => setBeloepUtbetaltUnderArbeidsgiverperioden(event.target.value))}
                  id={'lus-uua-input'}
                  error={visFeilmeldingsTekst('lus-uua-input')}
                  defaultValue={
                    Number.isNaN(fullLonnIArbeidsgiverPerioden.utbetalt)
                      ? ''
                      : formatCurrency(fullLonnIArbeidsgiverPerioden.utbetalt)
                  }
                />
                <SelectBegrunnelse
                  onChangeBegrunnelse={addIsDirtyForm(begrunnelseRedusertUtbetaling)}
                  defaultValue={fullLonnIArbeidsgiverPerioden.begrunnelse}
                  error={visFeilmeldingsTekst('lia-select')}
                />
              </div>
            )}
          </>
        )}

        <RadioGroup
          legend={betalerArbeidsgiverEtterAgpLegend}
          className={styles.radiobuttonwrapper}
          id={'lus-radio'}
          error={visFeilmeldingsTekst('lus-radio')}
          onChange={addIsDirtyForm(arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret)}
          // defaultValue={lonnISykefravaeret?.status}
        >
          <Radio value='Ja'>Ja</Radio>
          <Radio value='Nei'>Nei</Radio>
        </RadioGroup>
        {lonnISykefravaeret?.status === 'Ja' && (
          <>
            <RefusjonArbeidsgiverBelop
              bruttoinntekt={lonnISykefravaeret.belop! || 0}
              onOppdaterBelop={addIsDirtyForm(beloepArbeidsgiverBetalerISykefravaeret)}
              visFeilmeldingsTekst={visFeilmeldingsTekst}
              arbeidsgiverperiodeDisabled={arbeidsgiverperiodeDisabled}
            />

            <RefusjonUtbetalingEndring
              endringer={refusjonEndringer || []}
              maxDate={refusjonskravetOpphoerer?.opphoersdato}
              minDate={
                arbeidsgiverperioder?.length && arbeidsgiverperioder?.length > 0
                  ? arbeidsgiverperioder?.[arbeidsgiverperioder.length - 1].tom
                  : undefined
              }
              onHarEndringer={addIsDirtyForm(setHarRefusjonEndringer)}
              onOppdaterEndringer={addIsDirtyForm(oppdaterRefusjonEndringer)}
              harRefusjonEndringer={harRefusjonEndringer}
              harRefusjonEndringerDefault={harRefusjonEndringer}
            />

            <RadioGroup
              legend='Opphører refusjonkravet i perioden?'
              className={styles.radiobuttonwrapper}
              id={'lus-sluttdato-velg'}
              error={visFeilmeldingsTekst('lus-sluttdato-velg')}
              onChange={addIsDirtyForm(refusjonskravetOpphoererStatus)}
              defaultValue={refusjonskravetOpphoerer?.status}
            >
              <Radio value='Ja'>Ja</Radio>
              <Radio value='Nei'>Nei</Radio>
            </RadioGroup>
            {refusjonskravetOpphoerer?.status && refusjonskravetOpphoerer?.status === 'Ja' && (
              <div className={styles.datepickerescape}>
                <Datovelger
                  fromDate={sisteDagIArbeidsgiverperioden}
                  onDateChange={addIsDirtyForm(refusjonskravetOpphoererDato)}
                  id={'lus-sluttdato'}
                  label='Angi siste dag dere krever refusjon for'
                  error={visFeilmeldingsTekst('lus-sluttdato')}
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
