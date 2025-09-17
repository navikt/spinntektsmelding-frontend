import environment from '../../config/environment';
import org from '../../mockdata/inntektData.json';
import { createProxyHandler } from '../../server/http/proxyHandler';

const target = 'http://' + global.process.env.IM_API_URI + environment.inntektsdataSelvbestemtAPI;
export const config = {
  api: {
    externalResolver: true,
    bodyParser: false
  }
};
export default createProxyHandler<typeof org>({
  target,
  routePrefix: '/api/inntekt-selvbestemt',
  devMock: () => org
});
