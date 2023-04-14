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

  public hentKvitteringAPI = 'https://helsearbeidsgiver-im-api.intern.dev.nav.no/api/v1/hentKvittering';

  get inntektsdataAPI() {
    return this.publicRuntimeConfig.tidligereInntekterApi;
  }

  public baseUrl = '/im-dialog';

  public skjemadataUrl = '/im-dialog/api/trenger';

  public inntektsdataUrl = '/im-dialog/api/inntektsdata';

  public innsendingUrl = '/im-dialog/api/innsendingInntektsmelding';

  public hentKvitteringUrl = '/im-dialog/api/hentKvittering';

  public amplitudeEnabled = true;


  get testStuff() {
    return process.env.NEXT_PUBLIC_TEST_STUFF;
  }

  get otherTestStuff() {
    return this.publicRuntimeConfig.otherTestStuff;
  }

  get environment() {
    return this.publicRuntimeConfig.environment;
  }
}

const env = new Environment();

export default env;
