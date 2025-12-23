import environment from '../config/environment';

export function redirectTilLogin(context: any) {
  const ingress = context.req.headers.host + environment.baseUrl;
  const currentPath = `https://${ingress}${context.resolvedUrl}`;

  const destination = `https://${ingress}/oauth2/login?redirect=${currentPath}`;
  return {
    redirect: {
      destination: destination,
      permanent: false
    }
  };
}
