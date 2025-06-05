import { Button, CheckboxGroup, Checkbox, Alert, Link, Heading, Box } from '@navikt/ds-react';
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
import { useEffect, useMemo, useState } from 'react';
import SelectArbeidsgiver, { ArbeidsgiverSelect } from '../../components/SelectArbeidsgiver/SelectArbeidsgiver';
import FeilListe from '../../components/Feilsammendrag/FeilListe';
import useBoundStore from '../../state/useBoundStore';
import InitieringSchema from '../../schema/InitieringSchema';

import Loading from '../../components/Loading/Loading';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import formatRHFFeilmeldinger from '../../utils/formatRHFFeilmeldinger';
import { TDateISODate } from '../../schema/ForespurtDataSchema';
import { differenceInCalendarDays, differenceInDays, subYears } from 'date-fns';
import isMod11Number from '../../utils/isMod10Number';
import { useRouter } from 'next/router';
import useSykepengesoeknader from '../../utils/useSykepengesoeknader';
import formatIsoDate from '../../utils/formatIsoDate';
import { PersonnummerSchema } from '../../schema/PersonnummerSchema';
import {
  EndepunktSykepengesoeknaderSchema,
  EndepunktSykepengesoeknadSchema
} from '../../schema/EndepunktSykepengesoeknaderSchema';
// import formatDate from '../../utils/formatDate';
// import { logger } from '@navikt/next-logger';
// import environment from '../../config/environment';
// import { finnSammenhengendePeriodeManuellJustering } from '../../utils/finnArbeidsgiverperiode';
// import { finnSorterteUnikePerioder, overlappendePeriode } from '../../utils/finnBestemmendeFravaersdag';
// import parseIsoDate from '../../utils/parseIsoDate';
// import sorterFomStigende from '../../utils/sorterFomStigende';
import FeilVedHentingAvPersondata from './FeilVedHentingAvPersondata';
import { EndepunktArbeidsforholdSchema } from '../../schema/EndepunktArbeidsforholdSchema';
import useMineTilganger from '../../utils/useMineTilganger';

// type SykepengePeriode = {
//   id: string;
//   fom: Date;
//   tom: Date;
//   antallEgenmeldingsdager: number;
//   forespoerselId?: string;
//   forlengelseAv?: string;
// };

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
  const setVedtaksperiodeId = useBoundStore((state) => state.setVedtaksperiodeId);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  let arbeidsforhold: ArbeidsgiverSelect[] = [];

  let fulltNavn = '';
  let orgnrUnderenhet: string | undefined = undefined;
  // let antallDagerMellomSykmeldingsperioder = 0;
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
  type EndepunktSykepengesoeknad = z.infer<typeof EndepunktSykepengesoeknadSchema>;

  const methods = useForm<Skjema>({
    resolver: zodResolver(skjemaSchema)
  });

  const {
    register,
    watch,
    // setValue,
    // resetField,
    setError,
    handleSubmit,
    formState: { errors }
  } = methods;

  const orgnr = watch('organisasjonsnummer');
  // const sykepengePeriodeId: string[] | undefined = watch('sykepengePeriodeId');
  // const endreRefusjon: string | undefined = watch('endreRefusjon');

  const { data, error } = useMineTilganger(setError);
  let orgNavnMangler = false;

  if (data) {
    const collected = collectNestedOrgs(data);
    console.log('Mottatt data fra arbeidsforhold-endepunkt:', collected);
    // const mottatteData = EndepunktArbeidsforholdSchema.safeParse(data);

    if (collected.length > 0) {
      // fulltNavn = mottatteData.data.fulltNavn;

      // if (mottatteData.success) {
      //   arbeidsforhold =
      //     mottatteData?.data?.underenheter && mottatteData.data.underenheter.length > 0 && !error
      //       ? mottatteData.data.underenheter.map((arbeidsgiver: any) => {
      //           if (arbeidsgiver.orgnrUnderenhet === null) {
      //             orgNavnMangler = true;
      //           }
      //           return {
      //             orgnrUnderenhet: arbeidsgiver.orgnrUnderenhet,
      //             virksomhetsnavn: arbeidsgiver.virksomhetsnavn
      //           };
      //         })
      //       : [];

      //   if (mottatteData?.data?.underenheter && mottatteData.data.underenheter.length === 1) {
      //     orgnrUnderenhet = mottatteData?.data?.underenheter[0]?.orgnrUnderenhet;
      //   }
      // }
      arbeidsforhold = collected.map((org) => ({
        orgnrUnderenhet: org.orgnr,
        virksomhetsnavn: org.navn
      }));
    }
  }

  // const organisasjonsnummer = orgnr ?? orgnrUnderenhet;

  // const fomDato = formatIsoDate(subYears(new Date(), 1));
  // const {
  //   data: spData,
  //   error: spError,
  //   isLoading: spIsLoading
  // } = useSykepengesoeknader(sykmeldt.fnr, organisasjonsnummer, fomDato, setError);

  const feilmeldinger = formatRHFFeilmeldinger(errors);

  // const sykepengePerioder: SykepengePeriode[] = useMemo(() => {
  //   if (!spData) return [];

  //   const mottatteSykepengesoknader = EndepunktSykepengesoeknaderSchema.safeParse(spData);

  //   if (!mottatteSykepengesoknader.success) {
  //     logger.error('Feil ved validering av sykepengesøknader', mottatteSykepengesoknader.error.errors);
  //     return [];
  //   }

  //   let perioder =
  //     mottatteSykepengesoknader.data.length > 0
  //       ? mottatteSykepengesoknader.data.map((periode) => ({
  //           fom: new Date(periode.fom),
  //           tom: new Date(periode.tom),
  //           id: periode.sykepengesoknadUuid,
  //           antallEgenmeldingsdager: periode.egenmeldingsdagerFraSykmelding.length,
  //           forespoerselId: periode.forespoerselId
  //         }))
  //       : [];

  //   return perioder.reduce((acc, current) => {
  //     if (acc.length === 0) {
  //       acc.push(current);
  //       return acc;
  //     }
  //     if (
  //       (acc[acc.length - 1].forespoerselId || acc[acc.length - 1].forlengelseAv) &&
  //       differenceInCalendarDays(current.fom, acc[acc.length - 1].tom) >= 1
  //     ) {
  //       acc.push({
  //         ...current,
  //         forlengelseAv: acc[acc.length - 1].forespoerselId ?? acc[acc.length - 1].forlengelseAv
  //       });
  //       return acc;
  //     } else {
  //       acc.push({ ...current, forlengelseAv: undefined });
  //       return acc;
  //     }
  //   }, [] as SykepengePeriode[]);
  // }, [spData]);

  // const valgteSykepengePerioder = finnSammenhengendePeriodeManuellJustering(
  //   finnSorterteUnikePerioder(
  //     sykepengePeriodeId
  //       ? sykepengePerioder.filter((periode) => sykepengePeriodeId.includes(periode.id)).toSorted(sorterFomStigende)
  //       : []
  //   )
  // );

  // const mergedSykmeldingsperioder = valgteSykepengePerioder.length > 0 ? [valgteSykepengePerioder[0]] : [];

  // valgteSykepengePerioder.forEach((periode) => {
  //   const aktivPeriode = mergedSykmeldingsperioder[mergedSykmeldingsperioder.length - 1];
  //   const oppdatertPeriode = overlappendePeriode(aktivPeriode, periode);

  //   if (oppdatertPeriode && mergedSykmeldingsperioder.length > 0) {
  //     mergedSykmeldingsperioder[mergedSykmeldingsperioder.length - 1] = {
  //       ...oppdatertPeriode
  //     };
  //   } else {
  //     mergedSykmeldingsperioder.push(periode);
  //   }
  // });

  // const valgteUnikeSykepengePerioder = finnSammenhengendePeriodeManuellJustering(
  //   finnSorterteUnikePerioder(mergedSykmeldingsperioder)
  // ).filter((periode) => !!periode);

  // antallDagerMellomSykmeldingsperioder = valgteUnikeSykepengePerioder
  //   ? finnSorterteUnikePerioder(valgteUnikeSykepengePerioder).reduce((accumulator, currentValue, index, array) => {
  //       if (index === 0) {
  //         return 0;
  //       }
  //       if (!currentValue?.fom || !currentValue?.tom) {
  //         return accumulator;
  //       }
  //       const currentFom = currentValue.fom;
  //       const previousTom = array[index - 1].tom;

  //       const dagerMellom = differenceInDays(currentFom, previousTom);
  //       return accumulator > dagerMellom ? accumulator : dagerMellom;
  //     }, 0)
  //   : 0;

  // if (antallDagerMellomSykmeldingsperioder > 16) {
  //   blokkerInnsending = true;
  // }

  // const harValgtPeriodeMedForlengelse =
  //   !!valgteUnikeSykepengePerioder &&
  //   valgteUnikeSykepengePerioder.length > 0 &&
  //   valgteUnikeSykepengePerioder.some((periode) => !!periode.forlengelseAv);

  const visFeilmeldingliste = feilmeldinger && feilmeldinger.length > 0;

  const submitForm: SubmitHandler<Skjema> = (formData: Skjema) => {
    // if (harValgtPeriodeMedForlengelse && !endreRefusjon) {
    //   setError('endreRefusjon', {
    //     message: 'Angi om det skal endres refusjon for den ansatte.',
    //     type: 'manual'
    //   });
    //   return;
    // }

    // const mottatteSykepengesoeknader = spData ? EndepunktSykepengesoeknaderSchema.safeParse(spData) : undefined;
    const mottatteData = data ? EndepunktArbeidsforholdSchema.safeParse(data) : undefined;
    console.log('Validering av mottatteData:', mottatteData, data, formData);
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
    // const sykmeldingsperiode = getSykmeldingsperiode(formData, mottatteSykepengesoeknader);

    // if (sykmeldingsperiode.length === 0) {
    //   setError('sykepengePeriodeId', {
    //     message: 'Ingen sykmeldingsperioder valgt',
    //     type: 'manual'
    //   });
    //   return;
    // }
    console.log('Validering av skjemaData:', skjemaData);
    console.log('Validering av validationResult:', validationResult);
    if (validationResult.success) {
      setIsLoading(true);
      handleValidFormData(validationResult.data, []);
    }
  };

  // const getSykmeldingsperiode = (formData: Skjema, mottatteSykepengesoeknader: any) => {
  //   const sykmeldingsperiode: EndepunktSykepengesoeknad[] = [];
  //   formData.sykepengePeriodeId?.forEach((id) => {
  //     const periode: EndepunktSykepengesoeknad | undefined =
  //       mottatteSykepengesoeknader?.success &&
  //       mottatteSykepengesoeknader?.data?.find(
  //         (soeknad: EndepunktSykepengesoeknad) => soeknad.sykepengesoknadUuid === id
  //       );
  //     if (periode) {
  //       sykmeldingsperiode.push(periode);
  //     }
  //   });

  //   const forespoerselIdListe = sykmeldingsperiode
  //     .filter((periode) => !!periode.forespoerselId)
  //     .map((periode) => periode.forespoerselId!);

  //   if (forespoerselIdListe.length > 0) {
  //     router.push(`/${forespoerselIdListe[0]}`);
  //   }

  //   return sykmeldingsperiode;
  // };

  const handleValidFormData = (validerteData: any, sykmeldingsperiode: any) => {
    console.log('Validerte data:', validerteData);
    const orgNavn = arbeidsforhold.find(
      (arbeidsgiver) => arbeidsgiver.orgnrUnderenhet === validerteData.organisasjonsnummer
    )?.virksomhetsnavn!;
    initPerson(validerteData.fulltNavn, validerteData.personnummer, validerteData.organisasjonsnummer, orgNavn);
    setSkjemaStatus(SkjemaStatus.SELVBESTEMT);
    initFravaersperiode(getFravaersperioder(sykmeldingsperiode));
    initEgenmeldingsperiode(getEgenmeldingsperioder(sykmeldingsperiode));
    tilbakestillArbeidsgiverperiode();
    setVedtaksperiodeId(sykmeldingsperiode[0].vedtaksperiodeId);
    router.push('/arbeidsgiverInitiertInnsending');
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

  // useEffect(() => {
  //   const forlengelser = sykepengePerioder
  //     ?.filter((periode) => periode.forlengelseAv)
  //     .filter((periode) => sykepengePeriodeId?.includes(periode.id));

  //   if (!forlengelser || (forlengelser.length === 0 && !!endreRefusjon)) {
  //     resetField('endreRefusjon');
  //   }
  // }, [endreRefusjon, resetField, sykepengePeriodeId, sykepengePerioder]);

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
          {/* {antallDagerMellomSykmeldingsperioder > 16 && (
            <Alert variant='error' className={lokalStyles.alertPadding}>
              <Heading1>Det er mer enn 16 dager mellom sykmeldingsperiodene</Heading1>
              Hvis oppholdet mellom to sykmeldingsperioder er mer enn 16 dager, må det sendes inn en inntektsmelding for
              hver av periodene.
            </Alert>
          )}
          Inntektsmeldinger som allerede er forespurt, kan finnes i{' '}
          <Link href={environment.saksoversiktUrl}>saksoversikten</Link>. */}
          <FeilListe skalViseFeilmeldinger={visFeilmeldingliste} feilmeldinger={feilmeldinger} />
        </div>
      </PageContent>
    </div>
  );
};

// function formaterEgenmeldingsdager(antallEgenmeldingsdager: number) {
//   if (antallEgenmeldingsdager === 0) {
//     return null;
//   }

//   return antallEgenmeldingsdager === 1
//     ? '(pluss 1 egenmeldingsdag)'
//     : `(pluss ${antallEgenmeldingsdager} egenmeldingsdager)`;
// }

// function OrganisasjonInfo({
//   orgNr,
//   arbeidsforhold
// }: Readonly<{ orgNr: string; arbeidsforhold: ArbeidsgiverSelect[] }>) {
//   if (!arbeidsforhold || arbeidsforhold.length === 0 || !orgNr) {
//     return null;
//   }

//   const virksomhetsnavn = arbeidsforhold.find(
//     (arbeidsgiver) => arbeidsgiver.orgnrUnderenhet === orgNr
//   )?.virksomhetsnavn;
//   return (
//     <div>
//       <p>{virksomhetsnavn}</p>
//     </div>
//   );
// }

// function PersonInfo({ navn, fnr }: Readonly<{ navn?: string; fnr?: string }>) {
//   if (!navn || !fnr) {
//     return null;
//   }

//   const fDatoSiffer = fnr.substring(0, 6).split('');
//   const fDato = `${startFDato(fDatoSiffer[0])}${fDatoSiffer[1]}.${fDatoSiffer[2]}${
//     fDatoSiffer[3]
//   }.${fDatoSiffer[4]}${fDatoSiffer[5]}`;

//   return (
//     <>
//       Inntektsmelding {navn} f.{fDato}
//     </>
//   );
// }

// function startFDato(siffer: string): string {
//   if (Number(siffer) > 3) {
//     return (Number(siffer) - 4).toString();
//   }
//   return siffer;
// }

// function visFomDato(id: string, mottatteSykepengesoeknader: SykepengePeriode[]) {
//   const periode = mottatteSykepengesoeknader.find((soeknad: SykepengePeriode) => soeknad.forespoerselId === id);
//   if (!periode) {
//     return '';
//   }
//   return formatDate(parseIsoDate(periode.fom));
// }

// function visTomDato(id: string, mottatteSykepengesoeknader: SykepengePeriode[]) {
//   const periode = mottatteSykepengesoeknader.find((soeknad: SykepengePeriode) => soeknad.forespoerselId === id);
//   if (!periode) {
//     return '';
//   }
//   return formatDate(parseIsoDate(periode.tom));
// }

export default InitieringFritatt;
