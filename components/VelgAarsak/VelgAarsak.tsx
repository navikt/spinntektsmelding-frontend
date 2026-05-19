import { Radio, RadioGroup } from '@navikt/ds-react';
import { Controller, useFormContext } from 'react-hook-form';

import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';
import ensureValidHtmlId from '../../utils/ensureValidHtmlId';
import { SelvbestemtTypeConst } from '../../schema/konstanter/selvbestemtType';

import lokalStyling from './VelgAarsak.module.css';

interface VelgAarsakProps {
  legend: string;
  name: string;
}

export default function VelgAarsak({ legend, name }: Readonly<VelgAarsakProps>) {
  const {
    formState: { errors }
  } = useFormContext();

  const error = findErrorInRHFErrors(name, errors);

  return (
    <Controller
      name={name}
      defaultValue={''}
      rules={{ required: 'Du må velge årsaken til at du vil sende inn her.' }}
      render={({ field }) => (
        <RadioGroup {...field} legend={legend} error={error} id={ensureValidHtmlId(name)}>
          <Radio
            value={SelvbestemtTypeConst.Behandlingsdager}
            id={ensureValidHtmlId(field.name + '_Behandlingsdager')}
            description={
              <>
                <span className={lokalStyling.toppsetning}>
                  Ansatt som har godkjent sykmelding og sendt søknad for enkeltstående behandlingsdager.
                </span>{' '}
                <span>
                  Inneholder arbeidsgiverperioden en kombinasjon av behandlingsdager og annet sykefravær slik at den
                  varer i 16 dager, må du velge <em>Annen årsak</em> og knytte inntektsmeldingen til søknaden for det
                  ordinære sykefraværet og legge til behandlingsdagene og eventuelle egenmeldingsdager i
                  arbeidsgiverperioden.
                </span>
              </>
            }
          >
            Enkeltstående behandlingsdager
          </Radio>
          <Radio
            value={SelvbestemtTypeConst.UtenArbeidsforhold}
            id={ensureValidHtmlId(field.name + '_UtenArbeidsforhold')}
            description='Ansatte i tiltaket varig tilrettelagt arbeid, ambassadepersonell, utenlandsk sykmelding er ikke digitalisert eller ansatt ikke har tilgang til å sende digital sykmelding/søknad.'
          >
            Ansatte som ikke er registrert i Aa-registeret, eller ikke kan sende digital søknad om sykepenger
          </Radio>
          <Radio
            value={SelvbestemtTypeConst.Fisker}
            id={ensureValidHtmlId(field.name + '_Fisker')}
            description='Personer bosatt i Norge og som har fiske eller fangst i havet som hovednæring (blad B) eller binæring (blad A).'
          >
            Fisker med hyre
          </Radio>
          <Radio
            value={SelvbestemtTypeConst.MedArbeidsforhold}
            id={ensureValidHtmlId(field.name + '_MedArbeidsforhold')}
            description='Søknadsperioden er ikke en del av arbeidsgiverperioden, eller det er andre grunner til at Nav ikke har etterspurt en inntektsmelding. Det må være sendt inn en digital søknad om sykepenger fra den ansatte for å kunne sende denne inntektsmeldingen.'
          >
            Annen årsak
          </Radio>
        </RadioGroup>
      )}
    />
  );
}
