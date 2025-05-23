import { test, expect } from '@playwright/test';
import apiData from '../mockdata/trenger-delvis-enkel-variant.json';

test.describe('Delvis skjema - Utfylling og innsending av skjema', () => {
  test.beforeEach(async ({ page }) => {
    // intercept hentKvittering → 404
    await page.route('**/im-dialog/api/hentKvittering/**', (route) =>
      route.fulfill({
        status: 404,
        body: JSON.stringify({ name: 'Nothing' }),
        headers: { 'Content-Type': 'application/json' }
      })
    );
    // intercept collect
    await page.route('**/collect', (route) => route.fulfill({ status: 202, body: 'OK' }));
  });

  test('No changes and submit', async ({ page }) => {
    // intercept forespoersel → fixture
    await page.route('**/im-dialog/api/hent-forespoersel', (route) =>
      route.fulfill({ status: 200, body: JSON.stringify(apiData), headers: { 'Content-Type': 'application/json' } })
    );
    // intercept innsendingInntektsmelding → success
    await page.route('**/im-dialog/api/innsendingInntektsmelding', (route) =>
      route.fulfill({
        status: 201,
        body: JSON.stringify({ name: 'Nothing' }),
        headers: { 'Content-Type': 'application/json' }
      })
    );

    await page.goto('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');
    await page.waitForResponse('**/hent-forespoersel');

    // select "Nei" in refusjon group
    await page
      .locator('fieldset:has-text("Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?")')
      .getByLabel('Nei')
      .check();

    // fill phone
    await page.getByLabel('Telefon innsender').fill('12345678');
    // confirm
    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();
    // submit
    await page.getByRole('button', { name: 'Send' }).click();

    // assert request body
    const req = await page.waitForRequest('**/innsendingInntektsmelding');
    expect(JSON.parse(req.postData()!)).toEqual({
      forespoerselId: '12345678-3456-5678-2457-123456789012',
      agp: null,
      inntekt: {
        beloep: 36000,
        inntektsdato: '2024-12-05',
        naturalytelser: [],
        endringAarsaker: []
      },
      refusjon: null,
      avsenderTlf: '12345678'
    });

    // verify navigation and UI
    await expect(page).toHaveURL(/\/im-dialog\/kvittering\/12345678/);
    await expect(page.getByText('Kvittering - innsendt inntektsmelding')).toBeVisible();
    await expect(page.getByText('05.12.2024')).toBeVisible();
  });

  test('Changes and submit', async ({ page }) => {
    await page.route('**/im-dialog/api/hent-forespoersel', (route) =>
      route.fulfill({ status: 200, body: JSON.stringify(apiData), headers: { 'Content-Type': 'application/json' } })
    );
    await page.route('**/im-dialog/api/innsendingInntektsmelding', (route) =>
      route.fulfill({
        status: 201,
        body: JSON.stringify({ name: 'Nothing' }),
        headers: { 'Content-Type': 'application/json' }
      })
    );

    await page.goto('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');
    await page.waitForResponse('**/hent-forespoersel');

    // click second "Endre"
    await page.getByRole('button', { name: 'Endre' }).nth(1).click();

    // update income
    const label = page.getByLabel('Månedslønn 05.12.2024');
    await expect(label).toHaveValue('36000');
    await label.fill('50000');

    // change refusjon to "Ja"
    await page
      .locator('fieldset:has-text("Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?")')
      .getByLabel('Ja')
      .check();

    await page.getByLabel('Telefon innsender').fill('12345678');
    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();
    await page.getByRole('button', { name: 'Send' }).click();

    // validation error for missing årsak
    await expect(page.getByText('Vennligst angi årsak til endringen.')).toBeVisible();
    await page.getByLabel('Velg endringsårsak').selectOption('Bonus');

    // set refusjon
    await page
      .locator('fieldset:has-text("Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?")')
      .getByLabel('Ja')
      .check();
    await page.getByLabel('Endret beløp/måned').fill('45000');
    await page.getByLabel('Dato for endring').fill('30.09.2025');
    await page.getByRole('button', { name: 'Send' }).click();

    const req2 = await page.waitForRequest('**/innsendingInntektsmelding');
    expect(JSON.parse(req2.postData()!)).toEqual({
      forespoerselId: '12345678-3456-5678-2457-123456789012',
      agp: null,
      inntekt: {
        beloep: 50000,
        inntektsdato: '2024-12-05',
        naturalytelser: [],
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: {
        beloepPerMaaned: 50000,
        sluttdato: null,
        endringer: [{ beloep: 45000, startdato: '2025-09-30' }]
      },
      avsenderTlf: '12345678'
    });

    await expect(page).toHaveURL(/\/im-dialog\/kvittering\/12345678/);
    await expect(page.getByText('Bonus')).toBeVisible();
    await expect(page.getByText('45 000,00')).toBeVisible();
  });
});
