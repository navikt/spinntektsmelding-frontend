import { http, HttpResponse } from 'msw';

import trenger from '../mockdata/trenger-originalen-16dager.json';

export const handlers = [
  http.post('/im-dialog/api/trenger', (request) => {
    // Persist user's authentication in the session

    return HttpResponse.json(trenger);
  }),

  http.get('/im-dialog/api/logger', (request) => {
    // Check if the user is authenticated in this session

    return HttpResponse.json({ ok: 'ok' });
  }),

  http.get('/im-dialog/api/hentKvittering/8d50ef20-37b5-4829-ad83-56219e70b375', (request) => {
    // Check if the user is authenticated in this session

    return new HttpResponse(null, {
      status: 404
    });
  })
];
