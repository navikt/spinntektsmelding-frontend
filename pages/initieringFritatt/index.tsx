import { Button } from '@navikt/ds-react';
import { NextPage } from 'next';
import { z } from 'zod';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Heading1 from '../../components/Heading1/Heading1';
import PageContent from '../../components/PageContent/PageContent';
import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import lokalStyles from './initiering.module.css';
import TextLabel from '../../components/TextLabel';

import BannerUtenVelger from '../../components/BannerUtenVelger/BannerUtenVelger';
import { useState } from 'react';
import SelectArbeidsgiver, { ArbeidsgiverSelect } from '../../components/SelectArbeidsgiver/SelectArbeidsgiver';
import FeilListe from '../../components/Feilsammendrag/FeilListe';
import useBoundStore from '../../state/useBoundStore';
import InitieringSchema from '../../schema/InitieringSchema';

import Loading from '../../components/Loading/Loading';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import formatRHFFeilmeldinger from '../../utils/formatRHFFeilmeldinger';
import { TDateISODate } from '../../schema/ForespurtDataSchema';
import { differenceInDays } from 'date-fns';
import isMod11Number from '../../utils/isMod10Number';
import { useRouter } from 'next/router';
import { PersonnummerSchema } from '../../schema/PersonnummerSchema';
import FeilVedHentingAvPersondata from './FeilVedHentingAvPersondata';
import useMineTilganger from '../../utils/useMineTilganger';
import { InitieringAnnetSchema } from '../../schema/InitieringAnnetSchema';

type OrgNode = {
  orgnr: string;
  navn: string;
  underenheter: OrgNode[];
};

function collectNestedOrgs(nodes: OrgNode[]): { orgnr: string; navn: string }[] {
  const result: { orgnr: string; navn: string }[] = [];
  function walk(node: OrgNode) {
    for (const child of node.underenheter) {
      result.push({ orgnr: child.orgnr, navn: child.navn });
      walk(child);
    }
  }
  for (const n of nodes) {
    walk(n);
  }
  return result;
}

const InitieringFritatt: NextPage = () => {
  const sykmeldt = useBoundStore((state) => state.sykmeldt);
  const initPerson = useBoundStore((state) => state.initPerson);
  const setSkjemaStatus = useBoundStore((state) => state.setSkjemaStatus);
  const initFravaersperiode = useBoundStore((state) => state.initFravaersperiode);
  const initEgenmeldingsperiode = useBoundStore((state) => state.initEgenmeldingsperiode);
  const tilbakestillArbeidsgiverperiode = useBoundStore((state) => state.tilbakestillArbeidsgiverperiode);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  let arbeidsforhold: ArbeidsgiverSelect[] = [];

  let fulltNavn = '';
  let blokkerInnsending = false;

  const skjemaSchema = z
    .object({
      organisasjonsnummer: z
        .string({
          required_error: 'Sjekk at du har tilgang til å opprette inntektsmelding for denne arbeidstakeren'
        })
        .transform((val) => val.replace(/\s/g, ''))
        .pipe(
          z
            .string({
              required_error: 'Organisasjon er ikke valgt'
            })

            .refine((val) => isMod11Number(val), { message: 'Organisasjon er ikke valgt' })
        ),
      navn: z.string().nullable().optional(),
      personnummer: PersonnummerSchema.optional(),
      sykepengePeriodeId: z.array(z.string().uuid()).optional(),
      endreRefusjon: z.string().optional()
    })
    .superRefine((value, ctx) => {
      if (value.endreRefusjon === 'Ja') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Endring av refusjon for den ansatte må gjøres i den opprinnelige inntektsmeldingen.',
          path: ['endreRefusjon']
        });
      }

      if (value.endreRefusjon === 'Nei') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Du kan ikke sende inn en inntektsmelding som forlengelse av en tidligere inntektsmelding.',
          path: ['endreRefusjon']
        });
      }
    });

  type Skjema = z.infer<typeof skjemaSchema>;

  const methods = useForm<Skjema>({
    resolver: zodResolver(skjemaSchema)
  });

  const {
    register,
    watch,
    setError,
    handleSubmit,
    formState: { errors }
  } = methods;

  const orgnr = watch('organisasjonsnummer');

  const { data, error } = useMineTilganger(setError);
  let orgNavnMangler = false;

  if (data) {
    const collected = collectNestedOrgs(data);

    if (collected.length > 0) {
      arbeidsforhold = collected.map((org) => ({
        orgnrUnderenhet: org.orgnr,
        virksomhetsnavn: org.navn
      }));
    }
  }

  const feilmeldinger = formatRHFFeilmeldinger(errors);

  const visFeilmeldingliste = feilmeldinger && feilmeldinger.length > 0;

  const submitForm: SubmitHandler<Skjema> = (formData: Skjema) => {
    const mottatteData = data ? InitieringAnnetSchema.safeParse(formData) : undefined;

    if (mottatteData?.success) {
      handleValidData(formData, mottatteData.data, []);
    }
  };

  const handleValidData = (formData: Skjema, mottatteData: any, mottatteSykepengesoeknader: any) => {
    const skjemaData = {
      organisasjonsnummer: formData.organisasjonsnummer,
      fulltNavn: mottatteData.fulltNavn ?? 'Ukjent navn',
      personnummer: sykmeldt.fnr
    };

    const validationResult = InitieringSchema.safeParse(skjemaData);

    if (validationResult.success) {
      setIsLoading(true);
      handleValidFormData(validationResult.data, []);
    }
  };

  const handleValidFormData = (validerteData: any, sykmeldingsperiode: any) => {
    const orgNavn = arbeidsforhold.find(
      (arbeidsgiver) => arbeidsgiver.orgnrUnderenhet === validerteData.organisasjonsnummer
    )?.virksomhetsnavn!;
    initPerson(validerteData.fulltNavn, validerteData.personnummer, validerteData.organisasjonsnummer, orgNavn);
    setSkjemaStatus(SkjemaStatus.SELVBESTEMT);
    initFravaersperiode(getFravaersperioder(sykmeldingsperiode));
    initEgenmeldingsperiode(getEgenmeldingsperioder(sykmeldingsperiode));
    tilbakestillArbeidsgiverperiode();
    router.push('/unntattAaRegisteret');
  };

  const getFravaersperioder = (sykmeldingsperiode: any) => {
    return sykmeldingsperiode.map((periode: any) => ({
      fom: periode.fom as TDateISODate,
      tom: periode.tom as TDateISODate
    }));
  };

  const getEgenmeldingsperioder = (sykmeldingsperiode: any) => {
    return sykmeldingsperiode
      .flatMap((periode: any) => {
        const sorterteEgenmeldingsdager = periode.egenmeldingsdagerFraSykmelding.toSorted();
        const egenmeldingsperiode = sorterteEgenmeldingsdager.reduce(
          (accumulator: any, currentValue: any) => {
            const tom = new Date(currentValue);
            const currentTom = new Date(accumulator[accumulator.length - 1].tom);

            if (differenceInDays(tom, currentTom) <= 1) {
              accumulator[accumulator.length - 1].tom = currentValue as TDateISODate;
            } else {
              accumulator.push({ fom: currentValue as TDateISODate, tom: currentValue as TDateISODate });
            }
            return accumulator;
          },
          [
            {
              fom: sorterteEgenmeldingsdager[0] as TDateISODate,
              tom: sorterteEgenmeldingsdager[0] as TDateISODate
            }
          ]
        );
        return egenmeldingsperiode;
      })
      .filter((element: any) => !!element.fom && !!element.tom);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Innsending av oppdatert informasjon om inntektsmelding</title>
        <meta name='description' content='Innsending av inntektsmelding' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <BannerUtenVelger tittelMedUnderTittel={'Inntektsmelding'} />
      <PageContent title='Inntektsmelding sykepenger'>
        <div className={styles.padded}>
          <Heading1 id='mainTitle'>Opprett inntektsmelding for et sykefravær</Heading1>
          <FormProvider {...methods}>
            <form className={lokalStyles.form} onSubmit={handleSubmit(submitForm)}>
              <FeilVedHentingAvPersondata fulltNavnMangler={fulltNavn === null} orgNavnMangler={orgNavnMangler} />
              <div className={lokalStyles.persondata}>
                <div className={lokalStyles.navn}>
                  <TextLabel>Navn</TextLabel>
                  <p>{fulltNavn}</p>
                </div>
                <div>
                  <TextLabel>Personnummer</TextLabel>
                  <p>{sykmeldt.fnr}</p>
                </div>
              </div>
              {!data && !error && <Loading />}
              {data && (
                <>
                  <div>
                    <div>
                      <SelectArbeidsgiver
                        arbeidsforhold={arbeidsforhold}
                        id='organisasjonsnummer'
                        register={register}
                        error={errors.organisasjonsnummer?.message as string}
                        description='Dette vil være  enheten du representerer når du sender inn inntektsmeldingen.'
                        descriptionLabel='Hvilken underenhet er personen sykmeldt fra'
                      />
                    </div>
                  </div>
                </>
              )}

              <div className={lokalStyles.knapperad}>
                <Button variant='tertiary' className={lokalStyles.primaryKnapp} onClick={() => history.back()}>
                  Tilbake
                </Button>
                <Button
                  variant='primary'
                  className={lokalStyles.primaryKnapp}
                  loading={isLoading}
                  disabled={blokkerInnsending}
                >
                  Neste
                </Button>
              </div>
            </form>
          </FormProvider>

          <FeilListe skalViseFeilmeldinger={visFeilmeldingliste} feilmeldinger={feilmeldinger} />
        </div>
      </PageContent>
    </div>
  );
};

export default InitieringFritatt;
