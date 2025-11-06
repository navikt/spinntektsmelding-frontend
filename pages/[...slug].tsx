import React, { useEffect, useEffectEvent, useMemo, useState } from 'react';
import type { InferGetServerSidePropsType, NextPage } from 'next';
import Head from 'next/head';

import { z } from 'zod';
import { useForm, SubmitHandler, FormProvider, useWatch, FieldPath, FieldPathValue } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { BodyLong, Button, Checkbox, Link } from '@navikt/ds-react';

import PageContent from '../components/PageContent/PageContent';

import Skillelinje from '../components/Skillelinje/Skillelinje';

import styles from '../styles/Home.module.css';

import Fravaersperiode from '../components/Fravaersperiode/Fravaersperiode';
import Egenmelding from '../components/Egenmelding';
import Bruttoinntekt from '../components/Bruttoinntekt/Bruttoinntekt';
import RefusjonArbeidsgiver from '../components/RefusjonArbeidsgiver';
import useBoundStore from '../state/useBoundStore';
import Naturalytelser from '../components/Naturalytelser';
import Person from '../components/Person/Person';
import Feilsammendrag from '../components/Feilsammendrag';

import BannerUtenVelger from '../components/BannerUtenVelger/BannerUtenVelger';
import environment from '../config/environment';

import Arbeidsgiverperiode from '../components/Arbeidsgiverperiode/Arbeidsgiverperiode';
import IngenTilgang from '../components/IngenTilgang/IngenTilgang';
import HentingAvDataFeilet from '../components/HentingAvDataFeilet';
import useSendInnSkjema from '../utils/useSendInnSkjema';

import { SkjemaStatus } from '../state/useSkjemadataStore';
import useSendInnArbeidsgiverInitiertSkjema from '../utils/useSendInnArbeidsgiverInitiertSkjema';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import parseIsoDate from '../utils/parseIsoDate';

import { finnFravaersperioder } from '../state/useEgenmeldingStore';
import isValidUUID from '../utils/isValidUUID';
import useHentSkjemadata from '../utils/useHentSkjemadata';
import Heading3 from '../components/Heading3';
import forespoerselType from '../config/forespoerselType';
import { HovedskjemaSchema } from '../schema/HovedskjemaSchema';
import { countTrue } from '../utils/countTrue';
import { harEndringAarsak } from '../utils/harEndringAarsak';
import { Behandlingsdager } from '../components/Behandlingsdager/Behandlingsdager';
import Feilmelding from '../components/Feilmelding';
import { SelvbestemtTypeConst } from '../schema/konstanter/selvbestemtType';
import transformErrors from '../utils/transformErrors';
import { useShallow } from 'zustand/react/shallow';
import { startOfMonth } from 'date-fns';

type Skjema = z.infer<typeof HovedskjemaSchema>;

const Home: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  slug,
  erEndring
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [senderInn, setSenderInn] = useState<boolean>(false);
  const [lasterData, setLasterData] = useState<boolean>(false);
  const [ingenTilgangOpen, setIngenTilgangOpen] = useState<boolean>(false);

  const [isDirtyForm, setIsDirtyForm] = useState<boolean>(false);

  const {
    foreslaattBestemmendeFravaersdag,
    sykmeldingsperioder,
    egenmeldingsperioder,
    skjemaFeilet,
    skjemastatus,
    inngangFraKvittering,
    arbeidsgiverperioder,
    setTidligereInntekter,
    setPaakrevdeOpplysninger,
    begrensetForespoersel,
    hentPaakrevdOpplysningstyper,
    arbeidsgiverKanFlytteSkjæringstidspunkt,
    initBruttoinntekt,
    bruttoinntekt,
    beloepArbeidsgiverBetalerISykefravaeret,
    avsender,
    sykmeldt,
    naturalytelser,
    forespurtData,
    behandlingsdager,
    endringerAvRefusjon,
    selvbestemtType
  } = useBoundStore(
    useShallow((state) => ({
      foreslaattBestemmendeFravaersdag: state.foreslaattBestemmendeFravaersdag,
      sykmeldingsperioder: state.sykmeldingsperioder,
      egenmeldingsperioder: state.egenmeldingsperioder,
      skjemaFeilet: state.skjemaFeilet,
      skjemastatus: state.skjemastatus,
      inngangFraKvittering: state.inngangFraKvittering,
      arbeidsgiverperioder: state.arbeidsgiverperioder,
      setTidligereInntekter: state.setTidligereInntekter,
      setPaakrevdeOpplysninger: state.setPaakrevdeOpplysninger,
      begrensetForespoersel: state.begrensetForespoersel,
      hentPaakrevdOpplysningstyper: state.hentPaakrevdOpplysningstyper,
      arbeidsgiverKanFlytteSkjæringstidspunkt: state.arbeidsgiverKanFlytteSkjæringstidspunkt,
      initBruttoinntekt: state.initBruttoinntekt,
      bruttoinntekt: state.bruttoinntekt,
      beloepArbeidsgiverBetalerISykefravaeret: state.beloepArbeidsgiverBetalerISykefravaeret,
      avsender: state.avsender,
      sykmeldt: state.sykmeldt,
      naturalytelser: state.naturalytelser,
      forespurtData: state.forespurtData,
      behandlingsdager: state.behandlingsdager,
      endringerAvRefusjon: state.endringerAvRefusjon,
      selvbestemtType: state.selvbestemtType
    }))
  );

  const [sisteInntektsdato, setSisteInntektsdato] = useState<Date | undefined>(undefined);
  const [hentInntektEnGang, setHentInntektEnGang] = useState<boolean>(inngangFraKvittering);

  const hentSkjemadata = useHentSkjemadata();

  const sendInnSkjema = useSendInnSkjema(setIngenTilgangOpen, 'Hovedskjema');
  const sendInnArbeidsgiverInitiertSkjema = useSendInnArbeidsgiverInitiertSkjema(
    setIngenTilgangOpen,
    'HovedskjemaArbeidsgiverInitiert',
    skjemastatus
  );

  const opplysningstyper = hentPaakrevdOpplysningstyper();
  const skalViseEgenmelding = opplysningstyper.includes(forespoerselType.arbeidsgiverperiode);
  const harForespurtArbeidsgiverperiode = opplysningstyper.includes(forespoerselType.arbeidsgiverperiode);
  const harForespurtInntekt = opplysningstyper.includes(forespoerselType.inntekt);

  const lukkHentingFeiletModal = () => {
    window.location.href = environment.saksoversiktUrl!;
  };

  const selvbestemtInnsending = slug === 'arbeidsgiverInitiertInnsending' || skjemastatus === SkjemaStatus.SELVBESTEMT;

  const behandlingsdagerInnsending =
    slug === 'behandlingsdager' || selvbestemtType === SelvbestemtTypeConst.Behandlingsdager;

  const [overstyrSkalViseAgp, setOverstyrSkalViseAgp] = useState<boolean>(false);
  const skalViseArbeidsgiverperiode = harForespurtArbeidsgiverperiode || overstyrSkalViseAgp;

  const methods = useForm<Skjema>({
    resolver: zodResolver(HovedskjemaSchema),
    defaultValues: {
      inntekt: {
        beloep: bruttoinntekt.bruttoInntekt,
        endringAarsaker: [],
        naturalytelser: naturalytelser ?? [],
        harBortfallAvNaturalytelser: false
      },
      avsenderTlf: avsender.tlf
    }
  });

  const {
    register,
    setValue,
    control,
    handleSubmit,
    formState: { errors, isDirty, dirtyFields }
  } = methods;

  const memoErrors = useMemo(() => transformErrors(errors), [errors]);

  const onSetValue = useEffectEvent(<T extends FieldPath<Skjema>>(key: T, value: FieldPathValue<Skjema, T>) => {
    setValue(key, value);
  });

  useEffect(() => {
    if (naturalytelser !== undefined) {
      onSetValue('inntekt.harBortfallAvNaturalytelser', naturalytelser.length !== 0);
      onSetValue('inntekt.naturalytelser', naturalytelser);
    }
  }, [naturalytelser]);

  useEffect(() => {
    if (bruttoinntekt.bruttoInntekt !== undefined) {
      onSetValue('inntekt.beloep', bruttoinntekt.bruttoInntekt);
    }
  }, [bruttoinntekt.bruttoInntekt]);

  useEffect(() => {
    if (harEndringAarsak(bruttoinntekt.endringAarsaker)) {
      onSetValue('inntekt.endringAarsaker', bruttoinntekt.endringAarsaker ?? null);
    }
  }, [bruttoinntekt.endringAarsaker]);

  useEffect(() => {
    if (avsender.tlf !== undefined) {
      onSetValue('avsenderTlf', avsender.tlf);
    }
  }, [avsender.tlf]);

  const inntektBeloep = useWatch({
    control: control,
    name: 'inntekt.beloep'
  });

  const onBeloepArbeidsgiverBetalerISykefravaeret = useEffectEvent((beloep: number) => {
    beloepArbeidsgiverBetalerISykefravaeret(beloep);
  });

  useEffect(() => {
    if (inntektBeloep !== undefined && endringerAvRefusjon !== 'Ja') {
      onBeloepArbeidsgiverBetalerISykefravaeret(inntektBeloep);
    }
  }, [inntektBeloep, endringerAvRefusjon]);

  const submitForm: SubmitHandler<Skjema> = (formData: Skjema) => {
    setSenderInn(true);

    if (selvbestemtInnsending) {
      sendInnArbeidsgiverInitiertSkjema(true, slug, isDirtyForm || isDirty, formData, begrensetForespoersel).finally(
        () => setSenderInn(false)
      );

      return;
    }

    let oppdaterteOpplysningstyper = [...opplysningstyper];

    if (skalViseArbeidsgiverperiode) {
      if (!oppdaterteOpplysningstyper.includes(forespoerselType.arbeidsgiverperiode)) {
        oppdaterteOpplysningstyper.push(forespoerselType.arbeidsgiverperiode);
      }
    } else {
      oppdaterteOpplysningstyper = oppdaterteOpplysningstyper.filter(
        (type) => type !== forespoerselType.arbeidsgiverperiode
      );
    }

    setPaakrevdeOpplysninger(oppdaterteOpplysningstyper);

    sendInnSkjema(
      true,
      oppdaterteOpplysningstyper,
      slug,
      isDirtyForm || (isDirty && countTrue(dirtyFields) > 1),
      formData,
      begrensetForespoersel
    ).finally(() => {
      setSenderInn(false);
    });
  };

  const mellomregningBeregnetBestemmendeFraværsdag = useMemo(() => {
    if (!harForespurtArbeidsgiverperiode) {
      return parseIsoDate(
        forespurtData?.inntekt?.forslag?.forrigeInntekt?.skjæringstidspunkt ?? foreslaattBestemmendeFravaersdag
      );
    }
    const altFravaer = finnFravaersperioder(sykmeldingsperioder, egenmeldingsperioder);
    const beregnetBestemmendeFraværsdagISO = finnBestemmendeFravaersdag(
      altFravaer,
      arbeidsgiverperioder,
      foreslaattBestemmendeFravaersdag,
      arbeidsgiverKanFlytteSkjæringstidspunkt(),
      begrensetForespoersel
    );
    return parseIsoDate(beregnetBestemmendeFraværsdagISO);
  }, [
    arbeidsgiverperioder,
    egenmeldingsperioder,
    foreslaattBestemmendeFravaersdag,
    sykmeldingsperioder,
    arbeidsgiverKanFlytteSkjæringstidspunkt,
    harForespurtArbeidsgiverperiode,
    forespurtData?.inntekt?.forslag?.forrigeInntekt?.skjæringstidspunkt,
    begrensetForespoersel
  ]);

  const beregnetBestemmendeFraværsdag = behandlingsdagerInnsending
    ? foreslaattBestemmendeFravaersdag
    : mellomregningBeregnetBestemmendeFraværsdag;

  const inntektsdato = useMemo(() => {
    return beregnetBestemmendeFraværsdag ? startOfMonth(beregnetBestemmendeFraværsdag) : undefined;
  }, [beregnetBestemmendeFraværsdag]);

  useEffect(() => {
    if (skjemastatus === SkjemaStatus.SELVBESTEMT) {
      return;
    }
    if (!isValidUUID(slug)) {
      return;
    }
    if (!sykmeldingsperioder) {
      setLasterData(true);
      hentSkjemadata(slug, erEndring).finally(() => {
        setLasterData(false);
      });
    } else {
      setSisteInntektsdato(inntektsdato);
      setLasterData(false);
    }

    setPaakrevdeOpplysninger(hentPaakrevdOpplysningstyper());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, skjemastatus, sykmeldingsperioder]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Innsending av inntektsmelding - nav.no</title>
        <meta name='description' content='Innsending av inntektsmelding' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <BannerUtenVelger tittelMedUnderTittel='Inntektsmelding sykepenger' />
      <PageContent title='Inntektsmelding'>
        <FormProvider {...methods}>
          <form className={styles.padded} onSubmit={handleSubmit(submitForm)}>
            <Person />

            <Skillelinje />

            <Fravaersperiode lasterData={lasterData} setIsDirtyForm={setIsDirtyForm} skjemastatus={skjemastatus} />

            <Skillelinje />
            {skalViseEgenmelding && !behandlingsdagerInnsending && (
              <>
                <Egenmelding
                  lasterData={lasterData}
                  setIsDirtyForm={setIsDirtyForm}
                  selvbestemtInnsending={selvbestemtInnsending}
                />
                <Skillelinje />
              </>
            )}
            {behandlingsdagerInnsending && (
              <Behandlingsdager behandlingsdager={behandlingsdager} arbeidsgiverperioder={arbeidsgiverperioder} />
            )}
            {skalViseArbeidsgiverperiode && !behandlingsdagerInnsending && (
              <Arbeidsgiverperiode
                arbeidsgiverperioder={arbeidsgiverperioder}
                setIsDirtyForm={setIsDirtyForm}
                skjemastatus={skjemastatus}
                skalViseArbeidsgiverperiode={overstyrSkalViseAgp}
                onTilbakestillArbeidsgiverperiode={() => setOverstyrSkalViseAgp(false)}
              />
            )}
            {!skalViseArbeidsgiverperiode && (
              <>
                <Heading3 unPadded>Arbeidsgiverperiode</Heading3>
                <BodyLong>
                  Vi trenger ikke informasjon om arbeidsgiverperioden for denne sykmeldingen. Sykemeldingen er en
                  forlengelse av en tidligere sykefraværsperiode. Hvis du mener at det skal være arbeidsgiverperiode kan
                  du endre dette.
                </BodyLong>
                <Button variant='tertiary' onClick={() => setOverstyrSkalViseAgp(true)}>
                  Endre
                </Button>
              </>
            )}

            <Skillelinje />

            {harForespurtInntekt ? (
              <Bruttoinntekt
                bestemmendeFravaersdag={beregnetBestemmendeFraværsdag}
                erSelvbestemt={skjemastatus === SkjemaStatus.SELVBESTEMT}
                inntektsdato={beregnetBestemmendeFraværsdag}
                forespoerselId={slug}
              />
            ) : (
              <>
                <Heading3 unPadded>Beregnet månedslønn</Heading3>
                <BodyLong>Vi trenger ikke informasjon om inntekt for dette sykefraværet.</BodyLong>
              </>
            )}

            <Skillelinje />

            <RefusjonArbeidsgiver
              setIsDirtyForm={setIsDirtyForm}
              skalViseArbeidsgiverperiode={skalViseArbeidsgiverperiode}
              inntekt={inntektBeloep}
              behandlingsdager={behandlingsdagerInnsending}
            />
            {harForespurtInntekt && (
              <>
                <Skillelinje />
                <Naturalytelser />
              </>
            )}
            <Skillelinje />
            <Checkbox id='bekreft-opplysninger' {...register('bekreft_opplysninger')}>
              Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.
            </Checkbox>
            {errors.bekreft_opplysninger && (
              <Feilmelding id='errors.bekreft_opplysninger'>{errors.bekreft_opplysninger.message}</Feilmelding>
            )}
            <Feilsammendrag skjemafeil={memoErrors} />
            <div className={styles.outerButtonWrapper}>
              <div className={styles.buttonWrapper}>
                <Button className={styles.sendButton} loading={senderInn} id='knapp-innsending'>
                  Send
                </Button>

                <Link className={styles.lukkelenke} href={environment.saksoversiktUrl}>
                  Lukk
                </Link>
              </div>
            </div>
          </form>
        </FormProvider>
        <IngenTilgang open={ingenTilgangOpen} handleCloseModal={() => setIngenTilgangOpen(false)} />
        <HentingAvDataFeilet open={skjemaFeilet} handleCloseModal={lukkHentingFeiletModal} />
      </PageContent>
    </div>
  );
};

export default Home;

export async function getServerSideProps(context: any) {
  const slug = context.query.slug;

  return {
    props: {
      slug: slug[0],
      erEndring: Boolean(slug[1] && slug[1] === 'overskriv')
    }
  };
}
