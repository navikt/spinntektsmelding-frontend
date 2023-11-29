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

  get hentKvitteringAPI() {
    return this.publicRuntimeConfig.kvitteringDataApi;
  }

  get minSideArbeidsgiver() {
    return this.publicRuntimeConfig.minSideArbeidsgiver;
  }

  get flexJarApi() {
    return this.publicRuntimeConfig.flexJarUrl;
  }

  public baseUrl = '/im-dialog';

  public skjemadataUrl = '/im-dialog/api/trenger';

  public inntektsdataUrl = '/im-dialog/api/inntektsdata';

  public innsendingUrl = '/im-dialog/api/innsendingInntektsmelding';

  public flexjarUrl = '/im-dialog/api/flexjar-backend/api/v1/feedback';

  public hentKvitteringUrl = '/im-dialog/api/hentKvittering';

  public hentArbeidsgivereUrl = '/im-dialog/api/arbeidsgivere';

  public amplitudeEnabled = true;

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
