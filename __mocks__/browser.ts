import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

worker.start({
  serviceWorker: {
    // Specify the worker script URL relative to the _root_.
    url: '/im-dialog/mockServiceWorker.js',
    options: {
      // Override the scope to the root ("/").
      // By default, the worker is scoped to its location on your server,
      // which in this case would be "/prefix".
      scope: '/im-dialog'
    }
  }
});
