import { test } from '@playwright/test';
import { FormPage } from './utils/formPage';

const uuid = '46B02DA3-ACA1-4133-9594-7C9B1B361357';
const baseUrl = `http://localhost:3000/im-dialog/${uuid}`;

test.describe('Utfylling og innsending av skjema', () => {
  test.beforeEach(async ({ page }) => {
    // intercept hentKvittering → 404
    await page.route('*/**/api/hentKvittering/**', (route) =>
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Nothing' })
      })
    );
  });

  test('should display error message when data cannot be loaded', async ({ page }) => {
    const formPage = new FormPage(page);
    // intercept inntektsdata → 404
    await page.route('*/**/api/inntektsdata', (route) =>
      route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ name: 'Nothing' }) })
    );
    // intercept innsending
    await page.route('*/**/api/innsendingInntektsmelding', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Nothing' })
      })
    );
    // intercept collect
    await page.route('**/collect', (route) => route.fulfill({ status: 202, contentType: 'text/plain', body: 'OK' }));

    await page.goto(baseUrl);

    // Person data
    await formPage.assertVisibleText('Noe gikk galt under henting av data.');
  });

  test('should display error message when kvittering data cannot be loaded', async ({ page }) => {
    const formPage = new FormPage(page);
    const baseUrl = `http://localhost:3000/im-dialog/kvittering/${uuid}`;

    // intercept inntektsdata → 404
    await page.route('*/**/api/inntektsdata', (route) =>
      route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ name: 'Nothing' }) })
    );
    // intercept innsending
    await page.route('*/**/api/innsendingInntektsmelding', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Nothing' })
      })
    );
    // intercept collect
    await page.route('**/collect', (route) => route.fulfill({ status: 202, contentType: 'text/plain', body: 'OK' }));

    await page.goto(baseUrl);

    // Person data
    await formPage.assertVisibleText('Noe gikk galt under henting av data.');
  });

  test('should display error message when selvbestemt kvittering data cannot be loaded', async ({ page }) => {
    const formPage = new FormPage(page);
    const baseUrl = `http://localhost:3000/im-dialog/kvittering/agi/${uuid}`;

    // intercept inntektsdata → 404
    await page.route('*/**/api/inntektsdata', (route) =>
      route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ name: 'Nothing' }) })
    );
    // intercept innsending
    await page.route('*/**/api/innsendingInntektsmelding', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Nothing' })
      })
    );
    // intercept collect
    await page.route('**/collect', (route) => route.fulfill({ status: 202, contentType: 'text/plain', body: 'OK' }));

    await page.goto(baseUrl);

    // Person data
    await formPage.assertVisibleText('Noe gikk galt under henting av data.');
  });
});
