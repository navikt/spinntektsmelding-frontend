import environment from '../../config/environment';
import org from '../../mockdata/testOrganisasjoner';
import { createProxyHandler, proxyRouteConfig } from '../../server/http/proxyHandler';
import { MottattArbeidsgiver } from '../../schema/MottattArbeidsgiverSchema';

const target = 'http://' + global.process.env.IM_API_URI + environment.arbeidsgiverAPI;

export const config = proxyRouteConfig;

export default createProxyHandler<MottattArbeidsgiver[]>({
  target,
  routePrefix: '/api/arbeidsgivere',
  devMock: () => org
});
