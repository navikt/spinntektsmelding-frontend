import environment from '../../config/environment';
import org from '../../mockdata/inntektData.json';
import { createProxyHandler, proxyRouteConfig } from '../../server/http/proxyHandler';

const target = 'http://' + global.process.env.IM_API_URI + environment.inntektsdataAPI;
export const config = proxyRouteConfig;
export default createProxyHandler<typeof org>({
  target,
  routePrefix: '/api/inntektsdata',
  devMock: () => org
});
