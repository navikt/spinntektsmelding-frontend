import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/login', (request) => {
    // Persist user's authentication in the session

    return HttpResponse.json({ id: 'abc-123' });
  }),

  http.get('/user', (request) => {
    // Check if the user is authenticated in this session

    return HttpResponse.json({ id: 'abc-123' });
  })
];
