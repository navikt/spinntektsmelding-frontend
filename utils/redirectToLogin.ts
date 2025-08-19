import environment from '../config/environment';

export function redirectToLogin(redirectPath = '/initiering') {
  if (typeof window === 'undefined') return;
  const ingress = window.location.hostname + environment.baseUrl;
  window.location.replace(`https://${ingress}/oauth2/login?redirect=${ingress}${redirectPath}`);
}
