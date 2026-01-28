import { test, expect } from '@playwright/test';
import { FormPage } from './utils/formPage';

const uuid = 'f46623ac-fe65-403c-9b91-41db41d3a232';
const baseUrl = `http://localhost:3000/im-dialog/${uuid}`;

test.describe('Utfylling og innsending av skjema – refusjon', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('*/**/api/innsendingInntektsmelding', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Nothing' })
      })
    );

    // navigate to form
    await page.goto(baseUrl);
  });

  test('submit inntektsmelding that only requires refusjon', async ({ page }) => {
    const formPage = new FormPage(page);

    await formPage.fillInput('Telefon innsender', '12345678');

    // select refusjon under sykefravær
    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Nei');

    // confirm checkbox
    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');

    // submit

    // assert request payload
    const reqPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await formPage.clickButton('Send');
    const req = await reqPromise;
    const body = JSON.parse(req.postData()!);
    expect(body).toEqual({
      forespoerselId: uuid,
      agp: null,
      inntekt: null,
      refusjon: null,
      avsenderTlf: '12345678',
      naturalytelser: []
    });

    // verify receipt page
    await page.waitForURL(`/im-dialog/kvittering/${uuid}?fromSubmit=true`);
    await expect(page).toHaveURL(`/im-dialog/kvittering/${uuid}?fromSubmit=true`);
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
  });

  test('submit inntektsmelding that only requires refusjon, change refusjonsdata - refusjon higher than inntekt', async ({
    page
  }) => {
    const formPage = new FormPage(page);

    await formPage.fillInput('Telefon innsender', '12345678');

    // select refusjon under sykefravær
    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Ja');

    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Ja'
    );

    await formPage.clickButton('Endre', 1); // click the second "Endre" button to open the change form

    await formPage.fillInput('Oppgi refusjonsbeløpet per måned', '77000');

    // confirm checkbox
    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');

    await formPage.fillInput('Endret beløp/måned', '75000');

    await formPage.fillInput('Dato for endring', '01.06.25');

    await formPage.clickButton('Send');
    await formPage.assertVisibleTextAtLeastOnce('Refusjonsbeløpet kan ikke være høyere enn inntekten.');
    // submit

    await formPage.fillInput('Oppgi refusjonsbeløpet per måned', '51333');
    // 51333;

    // assert request payload
    const reqPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await formPage.clickButton('Send');
    const req = await reqPromise;
    const body = JSON.parse(req.postData()!);
    expect(body).toEqual({
      forespoerselId: uuid,
      agp: null,
      inntekt: null,
      refusjon: {
        beloepPerMaaned: 51333,
        endringer: [
          {
            beloep: 75000,
            startdato: '2025-06-01'
          }
        ],
        sluttdato: null
      },
      avsenderTlf: '12345678',
      naturalytelser: []
    });

    // verify receipt page
    await page.waitForURL(`/im-dialog/kvittering/${uuid}?fromSubmit=true`);
    await expect(page).toHaveURL(`/im-dialog/kvittering/${uuid}?fromSubmit=true`);
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
  });

  test('submit inntektsmelding that only requires refusjon, change refusjonsdata - refusjon lower than inntekt', async ({
    page
  }) => {
    const formPage = new FormPage(page);

    await formPage.fillInput('Telefon innsender', '12345678');

    // select refusjon under sykefravær
    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Ja');

    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Ja'
    );

    await formPage.clickButton('Endre', 1); // click the second "Endre" button to open the change form

    await formPage.fillInput('Oppgi refusjonsbeløpet per måned', '50000');

    // confirm checkbox
    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');

    await formPage.fillInput('Endret beløp/måned', '45000');

    await formPage.fillInput('Dato for endring', '01.06.25');

    // submit

    // assert request payload
    const reqPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await formPage.clickButton('Send');
    const req = await reqPromise;
    const body = JSON.parse(req.postData()!);
    expect(body).toEqual({
      forespoerselId: uuid,
      agp: null,
      inntekt: null,
      refusjon: {
        beloepPerMaaned: 50000,
        endringer: [
          {
            beloep: 45000,
            startdato: '2025-06-01'
          }
        ],
        sluttdato: null
      },
      avsenderTlf: '12345678',
      naturalytelser: []
    });

    // verify receipt page
    await page.waitForURL(`/im-dialog/kvittering/${uuid}?fromSubmit=true`);
    await expect(page).toHaveURL(`/im-dialog/kvittering/${uuid}?fromSubmit=true`);
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
  });
});
