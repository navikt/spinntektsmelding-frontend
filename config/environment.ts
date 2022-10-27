export enum EnvironmentType {
  PROD,
  PREPROD_DEV, // Angir at man aksesserer preprod via naisdevice på *.dev.nav.no, kun tilgjengelig via naisdevice
  LOCAL,
  TESTCAFE
}

class Environment {
  get loginServiceUrl() {
    switch (this.environmentMode) {
      case EnvironmentType.PROD:
        return 'https://arbeidsgiver.nav.no/im-dialog/oauth2/login?redirect=XXX';
      case EnvironmentType.PREPROD_DEV:
        return 'https://arbeidsgiver.dev.nav.no/im-dialog/oauth2/login?redirect=XXX';
      case EnvironmentType.TESTCAFE:
        return 'http://localhost:3000/local/cookie-please?subject=10107400090&redirect=XXX?loggedIn=true';
      default:
        return 'http://localhost:3000/local/cookie-please?subject=10107400090&redirect=XXX';
    }
  }

  get logoutServiceUrl() {
    switch (this.environmentMode) {
      case EnvironmentType.PROD:
        return 'https://arbeidsgiver.nav.no/im-dialog/oauth2/logout';
      case EnvironmentType.PREPROD_DEV:
        return 'https://arbeidsgiver.dev.nav.no/im-dialog/oauth2/logout';
      case EnvironmentType.TESTCAFE:
        return 'http://localhost:3000/not-in-use';
      default:
        return 'http://localhost:3000/not-in-use';
    }
  }

  get arbeidsgiverAPI() {
    switch (this.environmentMode) {
      case EnvironmentType.PROD:
        return 'https://helsearbeidsgiver-im-api.dev.nav.no/api/v1/arbeidsgivere';
      case EnvironmentType.PREPROD_DEV:
        return 'https://helsearbeidsgiver-im-api.dev.nav.no/api/v1/arbeidsgivere';
      case EnvironmentType.TESTCAFE:
        return 'http://localhost:3000/not-in-use';
      default:
        return 'http://localhost:3000/not-in-use';
    }
  }

  get innsendingInntektsmeldingAPI() {
    switch (this.environmentMode) {
      case EnvironmentType.PROD:
        return 'https://helsearbeidsgiver-im-api.dev.nav.no/api/v1/inntektsmelding';
      case EnvironmentType.PREPROD_DEV:
        return 'https://helsearbeidsgiver-im-api.dev.nav.no/api/v1/inntektsmelding';
      case EnvironmentType.TESTCAFE:
        return 'http://localhost:3000/not-in-use';
      default:
        return 'https://helsearbeidsgiver-im-api.dev.nav.no/api/v1/inntektsmelding';
    }
  }

  get inntektsmeldingAPI() {
    switch (this.environmentMode) {
      case EnvironmentType.PROD:
        return 'https://helsearbeidsgiver-im-api.dev.nav.no/api/v1/preutfyll';
      case EnvironmentType.PREPROD_DEV:
        return 'https://helsearbeidsgiver-im-api.dev.nav.no/api/v1/preutfyll';
      case EnvironmentType.TESTCAFE:
        return 'http://localhost:3000/not-in-use';
      default:
        return 'http://localhost:3000/not-in-use';
    }
  }
  get baseUrl() {
    return '/im-dialog';
  }

  get environmentMode() {
    if (this.isTestCafeRunning()) {
      return EnvironmentType.TESTCAFE;
    }
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return EnvironmentType.LOCAL;
    }
    if (typeof window !== 'undefined' && window.location.hostname.indexOf('.dev.nav.no') > -1) {
      return EnvironmentType.PREPROD_DEV;
    }
    return EnvironmentType.PROD;
  }

  get grunnbeloepUrl() {
    if (this.environmentMode === EnvironmentType.TESTCAFE) {
      return 'http://localhost:3000/api/v1/grunnbeloep';
    }

    return 'https://g.nav.no/api/v1/grunnbeloep';
    // https://g.nav.no/api/v1/grunnbeloep?dato=2020-02-12 hvis man trenger å spørre på dato
  }

  private isTestCafeRunning() {
    if (typeof window === 'undefined') {
      return false;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const testCafe = urlParams.get('TestCafe');

    return testCafe === 'running';
  }
}

const env = new Environment();

export default env;
