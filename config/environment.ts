import getConfig from 'next/config';

class Environment {
  publicRuntimeConfig: any;

  constructor() {
    const { publicRuntimeConfig } = getConfig();

    this.publicRuntimeConfig = publicRuntimeConfig;
  }

  get loginServiceUrl() {
    return this.publicRuntimeConfig.loginServiceUrl + '?redirect=XXX';
  }

  get loginServiceUrlUtenRedirect() {
    return this.publicRuntimeConfig.loginServiceUrl;
  }

  get logoutServiceUrl() {
    return this.publicRuntimeConfig.logoutServiceUrl;
  }

  get arbeidsgiverAPI() {
    return this.publicRuntimeConfig.arbeidsgiverListe;
  }

  get innsendingInntektsmeldingAPI() {
    return this.publicRuntimeConfig.innsendingInntektsmeldingApi;
  }

  get inntektsmeldingUuidAPI() {
    return this.publicRuntimeConfig.inntektsmeldingKjenteDataApi;
  }

  get inntektsdataAPI() {
    return this.publicRuntimeConfig.tidligereInntekterApi;
  }

  get inntektsdataSelvbestemtAPI() {
    return this.publicRuntimeConfig.tidligereInntekterSelvbestemtApi;
  }

  get hentKvitteringAPI() {
    return this.publicRuntimeConfig.kvitteringDataApi;
  }

  get minSideArbeidsgiver() {
    return this.publicRuntimeConfig.minSideArbeidsgiver;
  }

  get saksoversiktUrl() {
    return this.publicRuntimeConfig.saksoversiktUrl;
  }

  get aktiveOrgnrApi() {
    return this.publicRuntimeConfig.aktiveOrgnrApi;
  }

  get innsendingSelvbestemtInntektsmeldingApi() {
    return this.publicRuntimeConfig.innsendingSelvbestemtInntektsmeldingApi;
  }

  get arbeidsgiverListe() {
    return this.publicRuntimeConfig.arbeidsgiverListe;
  }

  public baseUrl = '/im-dialog';

  public skjemadataUrl = '/im-dialog/api/hent-forespoersel';

  public inntektsdataUrl = '/im-dialog/api/inntektsdata';
  public inntektsdataSelvbestemtUrl = '/im-dialog/api/inntekt-selvbestemt';

  public innsendingUrl = '/im-dialog/api/innsendingInntektsmelding';

  public flexjarUrl = '/im-dialog/api/flexjar-backend';

  public hentKvitteringUrl = '/im-dialog/api/hentKvittering';

  public hentArbeidsgivereUrl = '/im-dialog/api/arbeidsgivere';

  public initierBlankSkjemaUrl = '/im-dialog/api/aktiveorgnr';

  public amplitudeEnabled = true;

  public innsendingAGInitiertUrl = '/im-dialog/api/selvbestemt-inntektsmelding';

  public hentSykepengesoknaderUrl = '/im-dialog/api/sp-soeknader';

  get environment() {
    return this.publicRuntimeConfig.environment;
  }

  get telemetryUrl() {
    return this.publicRuntimeConfig.telemetryUrl;
  }

  get version() {
    return this.publicRuntimeConfig.version;
  }
}

const env = new Environment();

export default env;
