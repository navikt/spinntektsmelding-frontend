import environment from '../../config/environment';
import org from '../../mockdata/testOrganisasjoner';
import { createProxyHandler } from '../../server/http/proxyHandler';
import { MottattArbeidsgiver } from '../../schema/MottattArbeidsgiverSchema';

const target = 'http://' + global.process.env.IM_API_URI + environment.arbeidsgiverAPI;

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false
  }
};

export default createProxyHandler<MottattArbeidsgiver[]>({
  target,
  routePrefix: '/api/arbeidsgivere',
  devMock: () => org
});
