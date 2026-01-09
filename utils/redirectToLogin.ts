import environment from '../config/environment';

export function redirectToLogin(redirectPath = '/initiering') {
  if (globalThis.window?.location === undefined) return;

  const ingress = globalThis.window.location.hostname + environment.baseUrl;
  globalThis.window.location.replace(`https://${ingress}/oauth2/login?redirect=${ingress}${redirectPath}`);
}
