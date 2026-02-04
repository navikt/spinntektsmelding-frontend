import { BodyLong, Radio, RadioGroup } from '@navikt/ds-react';
import Heading3 from '../Heading3';

import useBoundStore from '../../state/useBoundStore';
import SelectBegrunnelse from './SelectBegrunnelse';
import RefusjonArbeidsgiverBelop from './RefusjonArbeidsgiverBelop';
import localStyles from './RefusjonArbeidsgiver.module.css';
import RefusjonUtbetalingEndring from './RefusjonUtbetalingEndring';
import AlertBetvilerArbeidsevne from '../AlertBetvilerArbeidsevne/AlertBetvilerArbeidsevne';
import { addDays } from 'date-fns';
import LenkeEksternt from '../LenkeEksternt/LenkeEksternt';
import sorterFomStigende from '../../utils/sorterFomStigende';
import ensureValidHtmlId from '../../utils/ensureValidHtmlId';
import { useEffect, useMemo } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';
import NumberField from '../NumberField/NumberField';

interface RefusjonArbeidsgiverProps {
  skalViseArbeidsgiverperiode?: boolean;
  inntekt: number;
  behandlingsdager?: boolean;
}

export default function RefusjonArbeidsgiver({
  skalViseArbeidsgiverperiode,
  inntekt,
  behandlingsdager
}: Readonly<RefusjonArbeidsgiverProps>) {
  const {
    watch,
    control,
    register,
    formState: { errors }
  } = useFormContext();

  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  const arbeidsgiverperiodeDisabled = useBoundStore((state) => state.arbeidsgiverperiodeDisabled);
  const arbeidsgiverperiodeKort = useBoundStore((state) => state.arbeidsgiverperiodeKort);
  const sykmeldingsperioder = useBoundStore((state) => state.sykmeldingsperioder);
  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const setEndringerAvRefusjon = useBoundStore((state) => state.setEndringerAvRefusjon);

  const agpFullLonn = watch('fullLonn');
  const agpBegrunnelse = watch('agp.redusertLoennIAgp.begrunnelse');
  const kreverRefusjon = watch('kreverRefusjon');

  const fravaer = sykmeldingsperioder ? sykmeldingsperioder.concat(egenmeldingsperioder ?? []) : [];
  const fravaerSortert = [...fravaer].sort(sorterFomStigende);
  const foersteFravaersdag = fravaerSortert[0]?.fom;

  const sisteArbeidsgiverperiode =
    Array.isArray(arbeidsgiverperioder) && arbeidsgiverperioder.length > 0
      ? [...arbeidsgiverperioder].sort(sorterFomStigende)
      : arbeidsgiverperioder;

  const betvilerArbeidsevne = agpBegrunnelse === 'BetvilerArbeidsufoerhet';
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

  // Synkroniser refusjon.isEditing med Zustand
  const isEditing = watch('refusjon.isEditing');
  useEffect(() => {
    if (isEditing) {
      setEndringerAvRefusjon('Ja');
    }
  }, [isEditing, setEndringerAvRefusjon]);

  return (
    <>
      <Heading3 unPadded>Utbetaling og refusjon</Heading3>
      <div>
        {skalViseArbeidsgiverperiode && (
          <>
            <Controller
              name='fullLonn'
              control={control}
              render={({ field }) => (
                <RadioGroup
                  legend={betalerArbeidsgiverFullLonnLegend}
                  className={localStyles.radiobuttonWrapper}
                  id={ensureValidHtmlId('fullLonn')}
                  error={findErrorInRHFErrors('fullLonn', errors)}
                  onChange={field.onChange}
                  value={field.value ?? ''}
                  disabled={arbeidsgiverperiodeDisabled || (arbeidsgiverperiodeKort && !behandlingsdager)}
                >
                  <Radio value='Ja'>Ja</Radio>
                  <Radio value='Nei'>Nei</Radio>
                </RadioGroup>
              )}
            />
            {!arbeidsgiverperiodeDisabled && !arbeidsgiverperiodeKort && (
              <>
                {agpFullLonn === 'Nei' && (
                  <>
                    <div className={localStyles.wrapperUtbetaling}>
                      <NumberField
                        className={localStyles.refusjonBeloep}
                        label='Utbetalt under arbeidsgiverperiode'
                        {...register('agp.redusertLoennIAgp.beloep', { valueAsNumber: true })}
                        id={ensureValidHtmlId('agp.redusertLoennIAgp.beloep')}
                        error={findErrorInRHFErrors('agp.redusertLoennIAgp.beloep', errors)}
                      />
                      <Controller
                        name='agp.redusertLoennIAgp.begrunnelse'
                        control={control}
                        render={({ field }) => (
                          <SelectBegrunnelse
                            onChangeBegrunnelse={field.onChange}
                            value={field.value}
                            error={findErrorInRHFErrors('agp.redusertLoennIAgp.begrunnelse', errors)}
                          />
                        )}
                      />
                    </div>
                    {betvilerArbeidsevne && <AlertBetvilerArbeidsevne />}
                  </>
                )}
              </>
            )}
          </>
        )}

        <Controller
          name='kreverRefusjon'
          control={control}
          render={({ field }) => (
            <RadioGroup
              legend={betalerArbeidsgiverEtterAgpLegend}
              className={localStyles.radiobuttonInnerWrapper}
              id={ensureValidHtmlId('kreverRefusjon')}
              error={findErrorInRHFErrors('kreverRefusjon', errors)}
              onChange={field.onChange}
              value={field.value ?? ''}
            >
              <BodyLong className={localStyles.radiobuttonDescriptionWrapper}>
                Arbeidsgiver kan velge mellom to alternativer. Betale lønn til den sykemeldte og få dette refundert fra
                Nav, eller at Nav betaler sykepengene direkte til den sykemeldte. Dette gjelder ikke under
                arbeidsgiverperiode.{' '}
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
          )}
        />
        {kreverRefusjon === 'Ja' && (
          <>
            <RefusjonArbeidsgiverBelop arbeidsgiverperiodeDisabled={arbeidsgiverperiodeDisabled} />

            <RefusjonUtbetalingEndring minDate={foersteMuligeRefusjonOpphoer} />
          </>
        )}
      </div>
    </>
  );
}
