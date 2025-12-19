export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV === 'development') {
    const { server } = await import('./__mocks__/server.js');
    server.listen({ onUnhandledRequest: 'bypass' });
    console.log('MSW server started for development');
  }
}
