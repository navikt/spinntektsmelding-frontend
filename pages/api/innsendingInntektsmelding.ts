import environment from '../../config/environment';
import feilRespons from '../../mockdata/respons-backendfeil.json';
import { createHandler } from '../../server/http/handlerFactory';
import { ApiError } from '../../server/auth/token';

const basePath = 'http://' + global.process.env.IM_API_URI + environment.innsendingInntektsmeldingAPI;

export const config = {
  api: {
    externalResolver: true,
    bodyParser: true
  }
};

export default createHandler<any, any>({
  devMock: () => feilRespons,
  devStatus: 201,
  successStatus: 201,
  allowedMethods: ['POST'],
  action: async ({ req, body }) => {
    // Stripp prefix fra path
    const subPath = (req.url || '').replace(/.*\/api\/innsendingInntektsmelding/, '') || '';
    const url = basePath + subPath;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    });
    if (!resp.ok) {
      // Forsøker å hente feildetaljer hvis JSON
      let details: any = undefined;
      const ct = resp.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        try {
          details = await resp.json();
        } catch (_) {}
      }
      throw new ApiError(resp.status, 'INNSENDING_FEIL', 'Innsending feilet', details);
    }
    const ct = resp.headers.get('content-type') || '';
    const location = resp.headers.get('location');
    let responseBody: any;
    if (ct.includes('application/json')) {
      responseBody = await resp.json();
    } else {
      responseBody = await resp.text();
    }
    const headers: Record<string, string> = {};
    if (location) headers['Location'] = location;
    if (ct && !ct.includes('application/json')) headers['Content-Type'] = ct;
    return { __status: resp.status, __headers: headers, __body: responseBody };
  }
});
