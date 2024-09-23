import { defineConfig } from 'cypress';
import SSRLocalhostMocker from 'cypress-ssr-localhost-mocker'; // import library

export default defineConfig({
  defaultCommandTimeout: 10000,
  e2e: {
    setupNodeEvents(on, config) {
      on('before:spec', () => {
        return SSRLocalhostMocker.init(3001); // it'll initialize your servers. You can pass any ports you want on params, like: (3000, 3001, 3002, ...)
      });
      on('after:spec', () => {
        return SSRLocalhostMocker.close(); // it'll close server when necessary
      });
      // implement node event listeners here
      on('task', {
        mockBackendRequest: SSRLocalhostMocker.getMockBackendRequest(), // it'll create a helper to mock requests
        clearAllbackendMockRequests: SSRLocalhostMocker.getClearAllMocks(), // it'll create a helper to clear mock requests
        log(message) {
          console.log(message);

          return null;
        }
      });
    }
  }
});
