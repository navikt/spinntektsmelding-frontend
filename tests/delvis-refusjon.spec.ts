import { test, expect } from '@playwright/test';
import apiData from '../mockdata/trenger-delvis-refusjon.json';
import { FormPage } from './utils/formPage';

test.describe('Delvis skjema – Utfylling og innsending av skjema (refusjon)', () => {
  const uuid = '12345678-3456-5678-2457-123456789012';
  const baseUrl = `http://localhost:3000/im-dialog/${uuid}`;

  test.beforeEach(async ({ page }) => {
    // stub beacon
    await page.route('**/collect', (route) => route.fulfill({ status: 202, contentType: 'text/plain', body: 'OK' }));
    // stub hentKvittering → 404
    await page.route('*/**/api/hentKvittering/**', (route) =>
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Nothing' })
      })
    );
  });

  test('No changes and submit', async ({ page }) => {
    const formPage = new FormPage(page);

    // stub hent-forespoersel
    await page.route('*/**/api/hent-forespoersel', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(apiData)
      })
    );
    // stub innsendingInntektsmelding
    await page.route('*/**/api/innsendingInntektsmelding', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Nothing' })
      })
    );

    // visit form
    await page.goto(baseUrl);
    await page.waitForResponse('**/api/hent-forespoersel');

    // choose "Nei" for refusjon
    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Nei');

    // fill phone and confirm
    await page.getByLabel('Telefon innsender').fill('12345678');
    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    // submit form
    // capture and assert payload
    const reqPromise = page.waitForRequest('**/api/innsendingInntektsmelding');
    await formPage.clickButton('Send');
    const req = await reqPromise;

    const payload = JSON.parse(req.postData()!);
    expect(payload).toMatchObject({
      forespoerselId: uuid,
      agp: null,
      refusjon: null,
      avsenderTlf: '12345678'
    });

    // verify receipt page
    await expect(page).toHaveURL(`/im-dialog/kvittering/${uuid}`);
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
  });

  test('Changes and submit', async ({ page }) => {
    const formPage = new FormPage(page);

    // stub hent-forespoersel
    await page.route('*/**/api/hent-forespoersel', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(apiData)
      })
    );
    // stub innsendingInntektsmelding
    await page.route('*/**/api/innsendingInntektsmelding', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Nothing' })
      })
    );

    // visit form
    await page.goto(baseUrl);
    await page.waitForResponse('**/api/hent-forespoersel');

    await page.getByRole('button', { name: 'Endre' }).nth(1).click();

    // await page.waitForURL('**/im-dialog/**');

    // update income to 50000
    // await page.getByRole('button', { name: /Endre/ }).nth(1).click();
    await expect(page.locator('label:text("Månedslønn 01.07.2023")')).toHaveValue('26000');

    await formPage.fillInput('Månedslønn 01.07.2023', '50000');

    await page.getByLabel('Telefon innsender').fill('12345678');
    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    formPage.clickButton('Send');
    // select change reason
    await page.getByLabel('Velg endringsårsak').selectOption('Varig lønnsendring');

    await formPage.fillInput('Lønnsendring gjelder fra', '30.06.23');

    // choose refusjon = Ja
    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Ja');
    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Nei'
    );

    // final submit
    const reqPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await formPage.clickButton('Send');
    const req2 = await reqPromise;
    // assert payload
    expect(JSON.parse(req2.postData()!)).toEqual({
      forespoerselId: '12345678-3456-5678-2457-123456789012',
      agp: null,
      inntekt: {
        beloep: 50000,
        inntektsdato: '2023-07-01',
        naturalytelser: [],

        endringAarsaker: [
          {
            aarsak: 'VarigLoennsendring',
            gjelderFra: '2023-06-30'
          }
        ]
      },
      refusjon: { beloepPerMaaned: 50000, sluttdato: null, endringer: [] },
      avsenderTlf: '12345678'
    });
    // final confirmation
    await expect(page).toHaveURL('/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');

    await expect(page.locator('[data-cy="bestemmendefravaersdag"]')).toHaveText(/01\.07\.2023/);
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
    await expect(page.locator('text="Varig lønnsendringsdato"')).toBeVisible();
    await expect(page.locator('text="30.06.2023"')).toBeVisible();
    await expect(page.locator('text="50 000,00 kr/måned"').first()).toBeVisible();
  });

  test.skip('Changes to ferie and submit', async ({ page }) => {
    const formPage = new FormPage(page);

    // stub hent-forespoersel
    await page.route('*/**/api/hent-forespoersel', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(apiData)
      })
    );
    // stub innsendingInntektsmelding
    await page.route('*/**/api/innsendingInntektsmelding', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Nothing' })
      })
    );

    // visit form
    await page.goto(baseUrl);
    await page.waitForResponse('**/api/hent-forespoersel');

    await page.getByRole('button', { name: 'Endre' }).nth(1).click();

    // await page.waitForURL('**/im-dialog/**');

    // update income to 50000
    // await page.getByRole('button', { name: /Endre/ }).nth(1).click();
    await expect(page.locator('label:text("Månedslønn 01.07.2023")')).toHaveValue('26000');

    await formPage.fillInput('Månedslønn 01.07.2023', '50000');

    await formPage.fillInput('Telefon innsender', '12345678');
    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');

    // await formPage.clickButton('Send');

    // select change reason
    await formPage.selectOption('Velg endringsårsak', 'Bonus');

    await formPage.selectOption('Velg endringsårsak', 'Ferie');

    await formPage.fillInput('Ferie fra', '30.06.23');
    await formPage.fillInput('Ferie til', '05.07.23');

    // choose refusjon = Ja
    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Ja');
    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Nei'
    );

    // final submit
    const reqPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await formPage.clickButton('Send');
    const req2 = await reqPromise;
    // assert payload
    expect(JSON.parse(req2.postData()!)).toEqual({
      forespoerselId: '12345678-3456-5678-2457-123456789012',
      agp: null,
      inntekt: {
        beloep: 50000,
        inntektsdato: '2023-07-01',
        naturalytelser: [],

        endringAarsaker: [
          {
            aarsak: 'Ferie',
            ferier: [
              {
                fom: '2023-06-30',
                tom: '2023-07-05'
              }
            ]
          }
        ]
      },
      refusjon: { beloepPerMaaned: 50000, sluttdato: null, endringer: [] },
      avsenderTlf: '12345678'
    });
    // final confirmation
    await expect(page).toHaveURL('/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');

    await expect(page.locator('[data-cy="bestemmendefravaersdag"]')).toHaveText(/01\.07\.2023/);
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
    await expect(page.locator('text="Ferie"')).toBeVisible();
    await expect(page.locator('text="30.06.2023"')).toBeVisible();
    await expect(page.locator('text="50 000,00 kr/måned"').first()).toBeVisible();
  });
});
