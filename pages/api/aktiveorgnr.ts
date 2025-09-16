import environment from '../../config/environment';
import org from '../../mockdata/blank-to-arbaidsforhold.json';
import { createProxyHandler, proxyRouteConfig } from '../../server/http/proxyHandler';

const target = 'http://' + global.process.env.IM_API_URI + environment.aktiveOrgnrApi;
export const config = proxyRouteConfig;

// Preserve artificial delay in dev
export default createProxyHandler<typeof org>({
  target,
  routePrefix: '/api/aktiveorgnr',
  devMock: () => org
});
