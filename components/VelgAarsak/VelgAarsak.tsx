import lokalStyles from '../Bruttoinntekt/Bruttoinntekt.module.css';
import formatDate from '../../utils/formatDate';
import { TextField } from '@navikt/ds-react';
import ButtonTilbakestill from '../ButtonTilbakestill/ButtonTilbakestill';
import React from 'react';
import PeriodeListevelger from '../PeriodeListeVelger/PeriodeListevelger';
import begrunnelseEndringBruttoinntekt from '../Bruttoinntekt/begrunnelseEndringBruttoinntekt';
import { useFormContext } from 'react-hook-form';
import DatoVelger from '../DatoVelger/DatoVelger';
import EndringBruttoinntektAarsak from '../EndringBruttoinntektAarsak/EndringBruttoinntektAarsak';
import stringishToNumber from '../../utils/stringishToNumber';
import TariffendringDato from '../TariffendringDato/TariffendringDato';
import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';
import { EndringAarsak } from '../../validators/validerAapenInnsending';
import parseIsoDate from '../../utils/parseIsoDate';

interface VelgAarsakProps {
  changeMaanedsintektHandler: (event: React.ChangeEvent<HTMLInputElement>) => void;
  changeBegrunnelseHandler: (verdi: string) => void;
  clickTilbakestillMaanedsinntekt: (event: React.MouseEvent<HTMLButtonElement>) => void;
  defaultEndringAarsak: EndringAarsak;
  bestemmendeFravaersdag?: Date;
  nyInnsending: boolean;
  kanIkkeTilbakestilles?: boolean;
  sammeSomSist?: boolean;
}

export default function VelgAarsak({
  clickTilbakestillMaanedsinntekt,
  defaultEndringAarsak,
  bestemmendeFravaersdag,
  nyInnsending,
  kanIkkeTilbakestilles,
  sammeSomSist
}: Readonly<VelgAarsakProps>) {
  const {
    formState: { errors },
    watch,
    register
  } = useFormContext();

  const endringAarsak = watch('inntekt.endringAarsak.aarsak');

  const beloepFeltnavn = 'inntekt.beloep';
  const beloepError = findErrorInRHFErrors(beloepFeltnavn, errors);

  // const blankPeriode: { fom: string; tom: string }[] = [{ fom: '', tom: '' }];
  const blankPeriode = undefined;

  return (
    <div className={lokalStyles.endremaaanedsinntektwrapper}>
      <div className={lokalStyles.endremaaanedsinntekt}>
        <TextField
          label={`Månedsinntekt ${formatDate(bestemmendeFravaersdag)}`}
          // defaultValue={bruttoinntekt?.bruttoInntekt ? formatCurrency(bruttoinntekt?.bruttoInntekt) : ''}
          error={beloepError}
          className={lokalStyles.bruttoinntektendringsbeloep}
          data-cy='inntekt-beloep-input'
          {...register('inntekt.beloep', {
            setValueAs: (value) => stringishToNumber(value)
          })}
        />
        <div>
          <EndringBruttoinntektAarsak
            name='inntekt.endringAarsak.aarsak'
            nyInnsending={nyInnsending}
            sammeSomSist={sammeSomSist}
            // value={endringAarsak as string}
          />
        </div>
        {!kanIkkeTilbakestilles && (
          <div>
            <ButtonTilbakestill className={lokalStyles.kontrollerknapp} onClick={clickTilbakestillMaanedsinntekt} />
          </div>
        )}
      </div>
      {endringAarsak === begrunnelseEndringBruttoinntekt.Tariffendring && (
        <div className={lokalStyles.endremaaanedsinntekt}>
          <TariffendringDato
            defaultEndringsdato={
              defaultEndringAarsak.aarsak === begrunnelseEndringBruttoinntekt.Tariffendring
                ? parseIsoDate(defaultEndringAarsak.gjelderFra)
                : undefined
            }
            defaultKjentDato={
              defaultEndringAarsak.aarsak === begrunnelseEndringBruttoinntekt.Tariffendring
                ? parseIsoDate(defaultEndringAarsak.bleKjent)
                : undefined
            }
            defaultMonth={bestemmendeFravaersdag}
          />
        </div>
      )}
      {endringAarsak === begrunnelseEndringBruttoinntekt.Ferie && (
        <div className={lokalStyles.endreperiodeliste}>
          <PeriodeListevelger
            defaultRange={
              defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.Ferie && defaultEndringAarsak?.perioder
                ? defaultEndringAarsak.perioder
                : blankPeriode
            }
            fomTekst='Fra'
            tomTekst='Til'
            defaultMonth={bestemmendeFravaersdag}
            toDate={bestemmendeFravaersdag}
            name='inntekt.endringAarsak.perioder'
          />
        </div>
      )}
      {endringAarsak === begrunnelseEndringBruttoinntekt.VarigLoennsendring && (
        <div className={lokalStyles.endremaaanedsinntekt}>
          <DatoVelger
            label='Lønnsendring gjelder fra'
            defaultSelected={parseIsoDate(defaultEndringAarsak?.gjelderFra)}
            toDate={bestemmendeFravaersdag}
            defaultMonth={bestemmendeFravaersdag}
            name='inntekt.endringAarsak.gjelderFra'
          />
        </div>
      )}
      {endringAarsak === begrunnelseEndringBruttoinntekt.Permisjon && (
        <div className={lokalStyles.endreperiodeliste}>
          <PeriodeListevelger
            name='inntekt.endringAarsak.perioder'
            defaultRange={
              defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.Permisjon &&
              defaultEndringAarsak?.perioder
                ? defaultEndringAarsak.perioder
                : blankPeriode
            }
            fomTekst='Fra'
            tomTekst='Til'
            defaultMonth={bestemmendeFravaersdag}
            toDate={bestemmendeFravaersdag}
          />
        </div>
      )}

      {endringAarsak === begrunnelseEndringBruttoinntekt.Permittering && (
        <div className={lokalStyles.endreperiodeliste}>
          <PeriodeListevelger
            defaultRange={
              defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.Permittering &&
              defaultEndringAarsak?.perioder
                ? defaultEndringAarsak.perioder
                : blankPeriode
            }
            fomTekst='Fra'
            tomTekst='Til'
            name='inntekt.endringAarsak.perioder'
            defaultMonth={bestemmendeFravaersdag}
            toDate={bestemmendeFravaersdag}
          />
        </div>
      )}
      {endringAarsak === begrunnelseEndringBruttoinntekt.NyStilling && (
        <div className={lokalStyles.endremaaanedsinntekt}>
          <DatoVelger
            label='Ny stilling fra'
            defaultSelected={defaultEndringAarsak?.gjelderFra}
            toDate={bestemmendeFravaersdag}
            defaultMonth={bestemmendeFravaersdag}
            name='inntekt.endringAarsak.gjelderFra'
          />
        </div>
      )}
      {endringAarsak === begrunnelseEndringBruttoinntekt.NyStillingsprosent && (
        <div className={lokalStyles.endremaaanedsinntekt}>
          <DatoVelger
            label='Ny stillingsprosent fra'
            defaultSelected={defaultEndringAarsak?.gjelderFra}
            toDate={bestemmendeFravaersdag}
            defaultMonth={bestemmendeFravaersdag}
            name='inntekt.endringAarsak.gjelderFra'
          />
        </div>
      )}

      {endringAarsak === begrunnelseEndringBruttoinntekt.Sykefravaer && (
        <div className={lokalStyles.endreperiodeliste}>
          <PeriodeListevelger
            defaultRange={
              defaultEndringAarsak?.aarsak === begrunnelseEndringBruttoinntekt.Sykefravaer &&
              defaultEndringAarsak?.perioder
                ? defaultEndringAarsak.perioder
                : blankPeriode
            }
            fomTekst='Fra'
            tomTekst='Til'
            defaultMonth={bestemmendeFravaersdag}
            toDate={bestemmendeFravaersdag}
            name='inntekt.endringAarsak.perioder'
          />
        </div>
      )}
    </div>
  );
}
