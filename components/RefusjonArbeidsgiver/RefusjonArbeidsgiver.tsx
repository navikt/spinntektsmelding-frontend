import { BodyLong, Radio, RadioGroup, TextField } from '@navikt/ds-react';
import Heading3 from '../Heading3';

import useBoundStore from '../../state/useBoundStore';
import SelectBegrunnelse from './SelectBegrunnelse';
import RefusjonArbeidsgiverBelop from './RefusjonArbeidsgiverBelop';
import localStyles from './RefusjonArbeidsgiver.module.css';
import formatCurrency from '../../utils/formatCurrency';
import RefusjonUtbetalingEndring from './RefusjonUtbetalingEndring';
import AlertBetvilerArbeidsevne from '../AlertBetvilerArbeidsevne/AlertBetvilerArbeidsevne';
import { addDays } from 'date-fns';
import LenkeEksternt from '../LenkeEksternt/LenkeEksternt';
import sorterFomStigende from '../../utils/sorterFomStigende';
import ensureValidHtmlId from '../../utils/ensureValidHtmlId';
import { useCallback, useMemo } from 'react';
import { YesNo } from '../../state/state';

interface RefusjonArbeidsgiverProps {
  setIsDirtyForm: (dirty: boolean) => void;
  skalViseArbeidsgiverperiode?: boolean;
  inntekt: number;
  behandlingsdager?: boolean;
}

export default function RefusjonArbeidsgiver({
  setIsDirtyForm,
  skalViseArbeidsgiverperiode,
  inntekt,
  behandlingsdager
}: Readonly<RefusjonArbeidsgiverProps>) {
  const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);
  const fullLonnIArbeidsgiverPerioden = useBoundStore((state) => state.fullLonnIArbeidsgiverPerioden);
  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);

  const visFeilmeldingTekst = useBoundStore((state) => state.visFeilmeldingTekst);

  const arbeidsgiverBetalerFullLonnIArbeidsgiverperioden = useBoundStore(
    (state) => state.arbeidsgiverBetalerFullLonnIArbeidsgiverperioden
  );
  const arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret = useBoundStore(
    (state) => state.arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret
  );
  const begrunnelseRedusertUtbetaling = useBoundStore((state) => state.begrunnelseRedusertUtbetaling);
  const setEndringerAvRefusjon = useBoundStore((state) => state.setEndringerAvRefusjon);

  const beloepArbeidsgiverBetalerISykefravaeret = useBoundStore(
    (state) => state.beloepArbeidsgiverBetalerISykefravaeret
  );

  const setBeloepUtbetaltUnderArbeidsgiverperioden = useBoundStore(
    (state) => state.setBeloepUtbetaltUnderArbeidsgiverperioden
  );
  const arbeidsgiverperiodeDisabled = useBoundStore((state) => state.arbeidsgiverperiodeDisabled);
  const arbeidsgiverperiodeKort = useBoundStore((state) => state.arbeidsgiverperiodeKort);
  const setHarRefusjonEndringer = useBoundStore((state) => state.setHarRefusjonEndringer);
  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);
  const oppdaterRefusjonEndringer = useBoundStore((state) => state.oppdaterRefusjonEndringer);
  const harRefusjonEndringer = useBoundStore((state) => state.harRefusjonEndringer);
  const sykmeldingsperioder = useBoundStore((state) => state.sykmeldingsperioder);
  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);

  const fravaer = sykmeldingsperioder ? sykmeldingsperioder.concat(egenmeldingsperioder ?? []) : [];

  const fravaerSortert = [...fravaer].sort(sorterFomStigende);

  const foersteFravaersdag = fravaerSortert[0]?.fom;

  const sisteArbeidsgiverperiode =
    Array.isArray(arbeidsgiverperioder) && arbeidsgiverperioder.length > 0
      ? [...arbeidsgiverperioder].sort(sorterFomStigende)
      : arbeidsgiverperioder;

  const betvilerArbeidsevne = fullLonnIArbeidsgiverPerioden?.begrunnelse === 'BetvilerArbeidsufoerhet';
  const sisteDagIArbeidsgiverperioden = sisteArbeidsgiverperiode ? sisteArbeidsgiverperiode?.[0]?.tom : new Date();

  const foersteMuligeRefusjonOpphoer = sisteDagIArbeidsgiverperioden
    ? addDays(sisteDagIArbeidsgiverperioden, 1)
    : foersteFravaersdag;

  const betalerArbeidsgiverEtterAgpLegend = 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?';

  const betalerArbeidsgiverFullLonnLegend = useMemo(
    () =>
      arbeidsgiverperiodeKort && !behandlingsdager
        ? 'Betaler arbeidsgiver ut full lønn de første 16 dagene?'
        : 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?',
    [arbeidsgiverperiodeKort, behandlingsdager]
  );

  // Stable callbacks - lages kun én gang eller når dependencies endres
  const handleArbeidsgiverBetalerFullLonn = useCallback(
    (status: YesNo) => {
      setIsDirtyForm(true);
      arbeidsgiverBetalerFullLonnIArbeidsgiverperioden(status);
    },
    [setIsDirtyForm, arbeidsgiverBetalerFullLonnIArbeidsgiverperioden]
  );

  const handleBeloepUtbetaltChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setIsDirtyForm(true);
      setBeloepUtbetaltUnderArbeidsgiverperioden(event.target.value);
    },
    [setIsDirtyForm, setBeloepUtbetaltUnderArbeidsgiverperioden]
  );

  const handleBegrunnelseChange = useCallback(
    (begrunnelse: string) => {
      setIsDirtyForm(true);
      begrunnelseRedusertUtbetaling(begrunnelse);
    },
    [setIsDirtyForm, begrunnelseRedusertUtbetaling]
  );

  const handleRefusjonStatusChange = useCallback(
    (status: YesNo) => {
      setIsDirtyForm(true);
      arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret(status, inntekt);
    },
    [setIsDirtyForm, arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret, inntekt]
  );

  const handleBelopUpdate = useCallback(
    (belop: string) => {
      setIsDirtyForm(true);
      beloepArbeidsgiverBetalerISykefravaeret(belop);
    },
    [setIsDirtyForm, beloepArbeidsgiverBetalerISykefravaeret]
  );

  const handleHarRefusjonEndringer = useCallback(
    (harEndringer: YesNo) => {
      setIsDirtyForm(true);
      setHarRefusjonEndringer(harEndringer);
    },
    [setIsDirtyForm, setHarRefusjonEndringer]
  );

  const handleOppdaterRefusjonEndringer = useCallback(
    (endringer: any) => {
      setIsDirtyForm(true);
      oppdaterRefusjonEndringer(endringer);
    },
    [setIsDirtyForm, oppdaterRefusjonEndringer]
  );

  const handleEditerbarChange = useCallback(() => {
    setEndringerAvRefusjon('Ja');
  }, [setEndringerAvRefusjon]);

  return (
    <>
      <Heading3 unPadded>Utbetaling og refusjon</Heading3>
      <div>
        {skalViseArbeidsgiverperiode && (
          <>
            <RadioGroup
              legend={betalerArbeidsgiverFullLonnLegend}
              className={localStyles.radiobuttonWrapper}
              id={'lia-radio'}
              error={visFeilmeldingTekst('lia-radio')}
              onChange={handleArbeidsgiverBetalerFullLonn}
              value={fullLonnIArbeidsgiverPerioden?.status ?? null}
              disabled={arbeidsgiverperiodeDisabled || (arbeidsgiverperiodeKort && !behandlingsdager)}
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
                        onChange={handleBeloepUtbetaltChange}
                        id={ensureValidHtmlId('agp.redusertLoennIAgp.beloep')}
                        error={visFeilmeldingTekst('agp.redusertLoennIAgp.beloep')}
                        defaultValue={
                          Number.isNaN(fullLonnIArbeidsgiverPerioden.utbetalt)
                            ? ''
                            : formatCurrency(fullLonnIArbeidsgiverPerioden.utbetalt)
                        }
                      />
                      <SelectBegrunnelse
                        onChangeBegrunnelse={handleBegrunnelseChange}
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
          className={localStyles.radiobuttonInnerWrapper}
          id={'lus-radio'}
          error={visFeilmeldingTekst('lus-radio')}
          onChange={handleRefusjonStatusChange}
          defaultValue={lonnISykefravaeret?.status}
        >
          <BodyLong className={localStyles.radiobuttonDescriptionWrapper}>
            Arbeidsgiver kan velge mellom to alternativer. Betale lønn til den sykemeldte og få dette refundert fra Nav,
            eller at Nav betaler sykepengene direkte til den sykemeldte. Dette gjelder ikke under arbeidsgiverperiode.{' '}
            <LenkeEksternt href='https://www.nav.no/arbeidsgiver/forskuttere-sykepenger'>
              Les mer om refusjon
            </LenkeEksternt>
            .
          </BodyLong>
          <div className={localStyles.radiobuttonButtonWrapper}>
            <Radio value='Ja'>Ja</Radio>
            <Radio value='Nei'>Nei</Radio>
          </div>
        </RadioGroup>
        {lonnISykefravaeret?.status === 'Ja' && (
          <>
            <RefusjonArbeidsgiverBelop
              bruttoinntekt={lonnISykefravaeret.beloep || 0}
              onOppdaterBelop={handleBelopUpdate}
              visFeilmeldingTekst={visFeilmeldingTekst}
              arbeidsgiverperiodeDisabled={arbeidsgiverperiodeDisabled}
              onEditerbarChange={handleEditerbarChange}
            />

            <RefusjonUtbetalingEndring
              endringer={refusjonEndringer || []}
              // maxDate={refusjonskravetOpphoerer?.opphoersdato}
              minDate={foersteMuligeRefusjonOpphoer}
              onHarEndringer={handleHarRefusjonEndringer}
              onOppdaterEndringer={handleOppdaterRefusjonEndringer}
              harRefusjonEndringer={harRefusjonEndringer}
              harRefusjonEndringerDefault={harRefusjonEndringer}
            />
          </>
        )}
      </div>
    </>
  );
}
