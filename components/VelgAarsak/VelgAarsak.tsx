import { Radio, RadioGroup, ReadMore } from '@navikt/ds-react';
import { RadioCard, RadioCardGroup } from '@navikt/ds-react/PREVIEW';
import type { ComponentProps, ComponentType, ReactNode } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';
import ensureValidHtmlId from '../../utils/ensureValidHtmlId';
import { SelvbestemtTypeConst } from '../../schema/konstanter/selvbestemtType';

import lokalStyling from './VelgAarsak.module.css';

// Wrapper for Radio component to allow ReactNode as description, instead of just string. Greit å huske på om formateringen skulle slutte å fungere som forventet.
const RadioMedFormatertBeskrivelse = RadioCard as ComponentType<
  Omit<ComponentProps<typeof RadioCard>, 'description'> & { description?: ReactNode }
>;

interface VelgAarsakProps {
  legend: string;
  name: string;
  visNyeAlternativer?: boolean;
}

export default function VelgAarsak({ legend, name, visNyeAlternativer = false }: Readonly<VelgAarsakProps>) {
  const nyeAlternativer: ReactNode[] = [];
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
        <RadioCardGroup {...field} legend={legend} error={error} id={ensureValidHtmlId(name)}>
          {!visNyeAlternativer ? (
            <>
              <RadioMedFormatertBeskrivelse
                value={SelvbestemtTypeConst.Behandlingsdager}
                id={ensureValidHtmlId(field.name + '_Behandlingsdager')}
                description={
                  <>
                    <span className={lokalStyling.toppsetning}>
                      Ansatt som har godkjent sykmelding og sendt søknad for enkeltstående behandlingsdager.
                    </span>{' '}
                    <span>
                      Inneholder arbeidsgiverperioden en kombinasjon av behandlingsdager og annet sykefravær slik at den
                      varer i 16 dager, må du velge <em>Annen årsak</em> og knytte inntektsmeldingen til søknaden for
                      det ordinære sykefraværet og legge til behandlingsdagene og eventuelle egenmeldingsdager i
                      arbeidsgiverperioden.
                    </span>
                  </>
                }
              >
                Enkeltstående behandlingsdager
              </RadioMedFormatertBeskrivelse>
              <RadioCard
                value={SelvbestemtTypeConst.UtenArbeidsforhold}
                id={ensureValidHtmlId(field.name + '_UtenArbeidsforhold')}
                description='Ansatte i tiltaket varig tilrettelagt arbeid, ambassadepersonell, utenlandsk sykmelding er ikke digitalisert eller ansatt ikke har tilgang til å sende digital sykmelding/søknad.'
              >
                Ansatte som ikke er registrert i Aa-registeret, eller ikke kan sende digital søknad om sykepenger
              </RadioCard>
              <RadioCard
                value={SelvbestemtTypeConst.Fisker}
                id={ensureValidHtmlId(field.name + '_Fisker')}
                description='Personer bosatt i Norge og som har fiske eller fangst i havet som hovednæring (blad B) eller binæring (blad A).'
              >
                Fisker med hyre
              </RadioCard>
              <RadioCard
                value={SelvbestemtTypeConst.MedArbeidsforhold}
                id={ensureValidHtmlId(field.name + '_MedArbeidsforhold')}
                description='Søknadsperioden er ikke en del av arbeidsgiverperioden, eller det er andre grunner til at Nav ikke har etterspurt en inntektsmelding. Det må være sendt inn en digital søknad om sykepenger fra den ansatte for å kunne sende denne inntektsmeldingen.'
              >
                Annen årsak
              </RadioCard>
            </>
          ) : null}
          {visNyeAlternativer ? (
            <>
              <RadioCard
                value={SelvbestemtTypeConst.Under16DagerUtenOpptjeningstid}
                id={ensureValidHtmlId(field.name + '_Under16DagerUtenOpptjeningstid')}
              >
                Fraværet er under 16 dager og det er ikke fire ukers opptjeningstid
              </RadioCard>
              <RadioCard
                value={SelvbestemtTypeConst.Over16DagerMedEgenmeldingsdager}
                id={ensureValidHtmlId(field.name + '_Over16DagerMedEgenmeldingsdager')}
              >
                Fraværet er over 16 dager når alle egenmeldingsdagene regnes med
              </RadioCard>
              <RadioCard value={SelvbestemtTypeConst.PapirSoeknad} id={ensureValidHtmlId(field.name + '_PapirSoeknad')}>
                Den ansatte har sendt norsk eller utenlandsk søknad om sykepenger på papir
              </RadioCard>
              <RadioCard
                value={SelvbestemtTypeConst.Behandlingsdager}
                id={ensureValidHtmlId(field.name + '_Behandlingsdager')}
              >
                Arbeidsgiverperioden består kun av behandlingsdager
              </RadioCard>
              <RadioCard
                value={SelvbestemtTypeConst.BehandlingsdagerMedAnnetSykefravaer}
                id={ensureValidHtmlId(field.name + '_BehandlingsdagerMedAnnetSykefravaer')}
              >
                Arbeidsgiverperioden består av en kombinasjon av behandlingsdager og annet sykefravær
              </RadioCard>
              <RadioCard
                value={SelvbestemtTypeConst.Reisetilskudd}
                id={ensureValidHtmlId(field.name + '_Reisetilskudd')}
              >
                Sykmelding med reisetilskudd
              </RadioCard>
              <RadioCard
                value={SelvbestemtTypeConst.UtmeldtAaRegisteret}
                id={ensureValidHtmlId(field.name + '_UtmeldtAaRegisteret')}
              >
                Arbeidsforholdet er meldt ut gjennom A-meldingen før inntektsmeldingen skal sendes
              </RadioCard>
              <ReadMore header='Vis flere situasjoner (6)'>
                <RadioCard
                  value={SelvbestemtTypeConst.MedArbeidsforhold}
                  id={ensureValidHtmlId(field.name + '_MedArbeidsforhold')}
                >
                  Vi skal endre innsendt inntektsmelding, men den ligger ikke tilgjengelig i saksoversikten
                </RadioCard>
                <RadioCard
                  value={SelvbestemtTypeConst.MedArbeidsforhold}
                  id={ensureValidHtmlId(field.name + '_MedArbeidsforhold')}
                  description='Dette gjelder når arbeidsforholdet ikke rapporteres i a-meldingen'
                >
                  F.eks. Ambassadepersonell, Deltaker i VTA-tiltak, Fisker med hyre
                </RadioCard>
                <RadioCard
                  value={SelvbestemtTypeConst.MedArbeidsforhold}
                  id={ensureValidHtmlId(field.name + '_MedArbeidsforhold')}
                >
                  Lønnsendring etter arbeid i helg mellom sykmeldinger
                </RadioCard>
                <RadioCard
                  value={SelvbestemtTypeConst.MedArbeidsforhold}
                  id={ensureValidHtmlId(field.name + '_MedArbeidsforhold')}
                >
                  Kontrollundersøkelse som varer mer enn 24 timer
                </RadioCard>
                <RadioCard
                  value={SelvbestemtTypeConst.MedArbeidsforhold}
                  id={ensureValidHtmlId(field.name + '_MedArbeidsforhold')}
                  description='Arbeidstaker skulle vært tilbake etter permittering '
                >
                  Permitteringen er avsluttet under sykefraværet
                </RadioCard>
                <RadioCard
                  value={SelvbestemtTypeConst.MedArbeidsforhold}
                  id={ensureValidHtmlId(field.name + '_MedArbeidsforhold')}
                >
                  Ingen av situasjonene passer
                </RadioCard>
              </ReadMore>
            </>
          ) : null}
        </RadioCardGroup>
      )}
    />
  );
}
