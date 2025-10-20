import { version } from '../package.json';

class Environment {
  get loginServiceUrl() {
    return process.env.NEXT_PUBLIC_LOGIN_SERVICE_URL + '?redirect=XXX';
  }

  get loginServiceUrlUtenRedirect() {
    return process.env.NEXT_PUBLIC_LOGIN_SERVICE_URL;
  }

  get logoutServiceUrl() {
    return process.env.NEXT_PUBLIC_LOGOUT_SERVICE_URL;
  }

  get arbeidsgiverAPI() {
    return process.env.NEXT_PUBLIC_ARBEIDSGIVERLISTE_API;
  }

  get innsendingInntektsmeldingAPI() {
    return process.env.NEXT_PUBLIC_INNSENDING_INNTEKTSMELDING_API;
  }

  get inntektsmeldingUuidAPI() {
    return process.env.NEXT_PUBLIC_PREUTFYLT_INNTEKTSMELDING_API;
  }

  get inntektsdataAPI() {
    return process.env.NEXT_PUBLIC_INNTEKTSDATA_API;
  }

  get inntektsdataSelvbestemtAPI() {
    return process.env.NEXT_PUBLIC_INNTEKTSDATA_SELVBESTEMT_API;
  }

  get hentKvitteringAPI() {
    return process.env.NEXT_PUBLIC_KVITTERINGDATA_API;
  }

  get minSideArbeidsgiver() {
    return process.env.NEXT_PUBLIC_MIN_SIDE_ARBEIDSGIVER;
  }

  get saksoversiktUrl() {
    return process.env.NEXT_PUBLIC_SAKSOVERSIKT_URL;
  }

  get aktiveOrgnrApi() {
    return process.env.NEXT_PUBLIC_AKTIVE_ORGNR_API;
  }

  get innsendingSelvbestemtInntektsmeldingApi() {
    return process.env.NEXT_PUBLIC_INNSENDING_SELVBESTEMT_INNTEKTSMELDING_API;
  }

  get arbeidsgiverListe() {
    return process.env.NEXT_PUBLIC_ARBEIDSGIVERLISTE_API;
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
  public hentBehandlingsdagerUrl = '/im-dialog/api/sp-behandlingsdager';

  public mineTilgangerUrl = '/im-dialog/api/mine-tilganger';

  get environment() {
    return process.env.NEXT_PUBLIC_ENVIRONMENT;
  }

  get telemetryUrl() {
    return process.env.NEXT_PUBLIC_TELEMETRY_URL;
  }

  get version() {
    return version;
  }
}

const env = new Environment();

export default env;
