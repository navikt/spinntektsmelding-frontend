import { test, expect } from '@playwright/test';
import originalData from '../mockdata/trenger-refusjon.json';
import { FormPage } from './utils/formPage';

const uuid = '8d50ef20-37b5-4829-ad83-56219e70b375';
const baseUrl = `http://localhost:3000/im-dialog/${uuid}`;

test.describe('Utfylling og innsending av skjema – refusjon', () => {
  test.beforeEach(async ({ page }) => {
    // stub hentKvittering → 404
    await page.route('*/**/api/hentKvittering/**', (route) =>
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Nothing' })
      })
    );
    // stub hent-forespoersel
    await page.route('*/**/api/hent-forespoersel/*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(originalData)
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

    // navigate to form
    const response = page.waitForResponse('*/**/api/hent-forespoersel/*');
    await page.goto(baseUrl);
    await response;
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
      avsenderTlf: '12345678'
    });

    // verify receipt page
    await page.waitForURL(`/im-dialog/kvittering/${uuid}`);
    await expect(page).toHaveURL(`/im-dialog/kvittering/${uuid}`);
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
        beloepPerMaaned: 77000,
        endringer: [
          {
            beloep: 75000,
            startdato: '2025-06-01'
          }
        ],
        sluttdato: null
      },
      avsenderTlf: '12345678'
    });

    // verify receipt page
    await page.waitForURL(`/im-dialog/kvittering/${uuid}`);
    await expect(page).toHaveURL(`/im-dialog/kvittering/${uuid}`);
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
      avsenderTlf: '12345678'
    });

    // verify receipt page
    await page.waitForURL(`/im-dialog/kvittering/${uuid}`);
    await expect(page).toHaveURL(`/im-dialog/kvittering/${uuid}`);
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
  });
});
