const env = {
  loginServiceUrl: process.env.NEXT_PUBLIC_LOGIN_SERVICE_URL + '?redirect=XXX',
  loginServiceUrlUtenRedirect: process.env.NEXT_PUBLIC_LOGIN_SERVICE_URL,
  logoutServiceUrl: process.env.NEXT_PUBLIC_LOGOUT_SERVICE_URL,
  minSideArbeidsgiver: process.env.NEXT_PUBLIC_MIN_SIDE_ARBEIDSGIVER,
  saksoversiktUrl: process.env.NEXT_PUBLIC_SAKSOVERSIKT_URL,
  telemetryUrl: process.env.NEXT_PUBLIC_TELEMETRY_URL,
  version: process.env.NEXT_PUBLIC_APP_VERSION,

  baseUrl: '/im-dialog',
  skjemadataUrl: '/im-dialog/api/hent-forespoersel',
  inntektsdataUrl: '/im-dialog/api/inntektsdata',
  inntektsdataSelvbestemtUrl: '/im-dialog/api/inntekt-selvbestemt',
  innsendingUrl: '/im-dialog/api/innsendingInntektsmelding',
  flexjarUrl: '/im-dialog/api/flexjar-backend',
  hentKvitteringUrl: '/im-dialog/api/hentKvittering',
  hentArbeidsgivereUrl: '/im-dialog/api/arbeidsgivere',
  initierBlankSkjemaUrl: '/im-dialog/api/aktiveorgnr',
  innsendingAGInitiertUrl: '/im-dialog/api/selvbestemt-inntektsmelding',
  hentSykepengesoknaderUrl: '/im-dialog/api/sp-soeknader',
  hentBehandlingsdagerUrl: '/im-dialog/api/sp-behandlingsdager',
  mineTilgangerUrl: '/im-dialog/api/mine-tilganger',

  analyticsEnabled: true
} as const;

export default env;
