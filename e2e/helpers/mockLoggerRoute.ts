export default async function mockLoggerRoute(page: any) {
  return page.route('*/**/api/logger', (route: any) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify({ name: 'Nothing' })
    })
  );
}
