import { test, expect } from '@playwright/test';
import { FormPage } from './utils/formPage';

test.describe('Delvis skjema - Utfylling og innsending av skjema', () => {
  test.beforeEach(async ({ page }) => {
    // intercept hentKvittering → 404
    await page.route('*/**/api/hentKvittering/**', (route) =>
      route.fulfill({
        status: 404,
        body: JSON.stringify({ name: 'Nothing' }),
        headers: { 'Content-Type': 'application/json' }
      })
    );
    // intercept collect
    await page.route('**/collect', (route) => route.fulfill({ status: 202, body: 'OK' }));

    // intercept innsendingInntektsmelding → success
    await page.route('*/**/api/innsendingInntektsmelding', (route) =>
      route.fulfill({
        status: 201,
        body: JSON.stringify({ name: 'Nothing' }),
        headers: { 'Content-Type': 'application/json' }
      })
    );

    await page.goto('http://localhost:3000/im-dialog/ac33a4ae-e1bd-4cab-9170-b8a01a13471e');
  });

  test('No changes and submit', async ({ page }) => {
    const formPage = new FormPage(page);
    // select "Nei" in refusjon group
    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Nei');

    // fill phone
    await page.getByLabel('Telefon innsender').fill('12345678');
    // confirm
    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');
    // submit
    const pageLoad = page.waitForRequest('**/innsendingInntektsmelding');
    await formPage.clickButton('Send');
    const req = await pageLoad;
    // assert request body
    expect(JSON.parse(req.postData()!)).toEqual({
      forespoerselId: 'ac33a4ae-e1bd-4cab-9170-b8a01a13471e',
      agp: null,
      inntekt: {
        beloep: 36000,
        inntektsdato: '2024-12-05',
        endringAarsaker: []
      },
      refusjon: null,
      avsenderTlf: '12345678',
      naturalytelser: []
    });

    // verify navigation and UI
    // await expect(page).toHaveURL(/\/im-dialog\/kvittering\/12345678/);
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
    // await expect(page.getByText('05.12.2024')).toBeVisible();
    await expect(page.locator('text="05.12.2024"')).toBeVisible();
  });

  test('Changes and submit', async ({ page }) => {
    const formPage = new FormPage(page);

    // click second "Endre"
    await page.getByRole('button', { name: 'Endre' }).nth(1).click();

    // update income
    const label = page.getByLabel('Månedslønn 05.12.2024');
    await expect(label).toHaveValue('36000');
    await label.fill('50000');

    // change refusjon to "Ja"
    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Ja');

    await page.getByLabel('Telefon innsender').fill('12345678');
    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');
    await formPage.clickButton('Send');

    // validation error for missing årsak
    const elements = page.locator('text="Vennligst angi årsak til endringen."');
    await expect(elements).toHaveCount(2);

    await page.getByLabel('Velg endringsårsak').selectOption('Bonus');

    // set refusjon
    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Ja'
    );
    await formPage.fillInput('Endret beløp/måned', '45000');
    await page.getByLabel('Dato for endring').fill('30.09.2025');
    const req2 = page.waitForResponse('*/**/api/innsendingInntektsmelding');
    await formPage.clickButton('Send');
    const responsData = await req2;

    expect(JSON.parse(responsData.request().postData()!)).toEqual({
      forespoerselId: 'ac33a4ae-e1bd-4cab-9170-b8a01a13471e',
      agp: null,
      inntekt: {
        beloep: 50000,
        inntektsdato: '2024-12-05',
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: {
        beloepPerMaaned: 50000,
        sluttdato: null,
        endringer: [{ beloep: 45000, startdato: '2025-09-30' }]
      },
      avsenderTlf: '12345678',
      naturalytelser: []
    });

    // await expect(page).toHaveURL(/\/im-dialog\/kvittering\/12345678/);
    await formPage.assertVisibleTextAtLeastOnce('Kvittering - innsendt inntektsmelding');
    await formPage.assertVisibleText('Bonus');
    await formPage.assertVisibleText('45 000,00');
    // await expect(page.getByText('Bonus')).toBeVisible();
    // await expect(page.getByText('45 000,00')).toBeVisible();
  });
});
