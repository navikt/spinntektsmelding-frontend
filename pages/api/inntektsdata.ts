import environment from '../../config/environment';
import org from '../../mockdata/inntektData.json';
import { createProxyHandler } from '../../server/http/proxyHandler';

const target = 'http://' + global.process.env.IM_API_URI + environment.inntektsdataAPI;
// Inline config (Turbopack/Next static analysis requires literal object)
export const config = {
  api: {
    externalResolver: true,
    bodyParser: false
  }
};
export default createProxyHandler<typeof org>({
  target,
  routePrefix: '/api/inntektsdata',
  devMock: () => org
});
