// Refaktorert til createHandler for konsistent auth / OBO-håndtering og testbarhet
import { createHandler } from '../../server/http/handlerFactory';
import { ApiError } from '../../server/auth/token';

const basePath = 'http://' + global.process.env.FLEXJAR_URL + '/api/v1/feedback';

export const config = {
  api: {
    externalResolver: true,
    bodyParser: true // vi sender JSON videre; opprinnelig var false for streaming, men ikke påkrevd her
  }
};

// Ingen body-validering; route fungerer som en transparent POST/GET videresender
export default createHandler<any, any>({
  devMock: () => ({}),
  devStatus: 201,
  requireAuth: true,
  oboClientId: process.env.FLEXJAR_BACKEND_CLIENT_ID!,
  allowedMethods: ['POST', 'GET'],
  action: async ({ req, body, oboToken }) => {
    // Konstruer under-path etter /api/flexjar-backend
    const originalPath = req.url || '';
    const subPath = originalPath.replace(/.*\/api\/flexjar-backend/, '') || '';
    const url = basePath + subPath;

    const method = req.method || 'POST';
    const outgoingHeaders: Record<string, string> = {
      Authorization: `Bearer ${oboToken}`,
      'Content-Type': 'application/json'
    };

    const fetchInit: RequestInit = { method, headers: outgoingHeaders };
    if (method !== 'GET' && method !== 'HEAD') {
      fetchInit.body = JSON.stringify(body ?? {});
    }

    const resp = await fetch(url, fetchInit);
    if (!resp.ok) {
      throw new ApiError(resp.status, 'FLEXJAR_PROXY_FEIL', 'Kall mot flexjar feilet');
    }

    const contentType = resp.headers.get('content-type') || '';
    const location = resp.headers.get('location');
    let responseBody: any;
    if (contentType.includes('application/json')) {
      responseBody = await resp.json();
    } else {
      responseBody = await resp.text();
    }
    const passHeaders: Record<string, string> = {};
    if (location) passHeaders['Location'] = location;
    // Bare sett content-type videre dersom den ikke er JSON (Next vil sette application/json for json())
    if (contentType && !contentType.includes('application/json')) {
      passHeaders['Content-Type'] = contentType;
    }
    return { __status: resp.status, __headers: passHeaders, __body: responseBody };
  }
});
