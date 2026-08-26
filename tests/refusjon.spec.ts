import { test, expect } from '@playwright/test';
import { FormPage } from './utils/formPage';

const uuid = '588e055c-5d72-449b-b88f-56aa43457668';
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

  test('can check radios for refusjon and submit', async ({ page }) => {
    const formPage = new FormPage(page);
    // select full lønn in AGP
    await formPage.checkRadioButton('Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?', 'Ja');

    // select refusjon under sykefravær
    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Ja');

    // select "Nei" for changes in refusjon
    await formPage.checkRadioButton(
      /Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?/,
      'Nei'
    );

    // confirm checkbox
    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');

    // submit

    // assert request payload
    const req = await formPage.submitAndWaitForRequest('*/**/api/innsendingInntektsmelding');
    const body = JSON.parse(req.postData()!);
    expect(body).toEqual({
      forespoerselId: uuid,
      agp: {
        perioder: [{ fom: '2023-02-17', tom: '2023-03-04' }],
        redusertLoennIAgp: null
      },
      inntekt: {
        beloep: 77000,
        inntektsdato: '2023-03-15',
        endringAarsaker: []
      },
      refusjon: { beloepPerMaaned: 77000, sluttdato: null, endringer: [] },
      avsenderTlf: '12345678',
      naturalytelser: [],
      flereArbeidsforhold: null
    });

    // verify receipt page
    await page.waitForURL(`/im-dialog/kvittering/${uuid}?fromSubmit=true`, { timeout: 15000 });
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
  });

  test('can check radios for refusjon, set refusjon higher than inntekt and submit, fail because of refusjon endring beløp, fix error and resubmit', async ({
    page
  }) => {
    // select full lønn in AGP
    const formPage = new FormPage(page);
    await formPage.checkRadioButton('Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?', 'Ja');

    // select refusjon under sykefravær
    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Ja');

    // select "Nei" for changes in refusjon
    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Ja'
    );

    await formPage.fillInput('Endret beløp/måned', '80000');
    await formPage.fillInput('Dato for endring', '15.03.23');

    // confirm checkbox
    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');

    // submit
    await formPage.clickButton('Send');

    // 'Refusjon kan ikke være høyere enn beregnet månedslønn.'
    await formPage.assertVisibleTextAtLeastOnce('Refusjon kan ikke være høyere enn beregnet månedslønn.');

    await formPage.fillInput('Endret beløp/måned', '60000');

    // assert request payload
    const req = await formPage.submitAndWaitForRequest('*/**/api/innsendingInntektsmelding');
    const body = JSON.parse(req.postData()!);
    expect(body).toEqual({
      forespoerselId: uuid,
      agp: {
        perioder: [{ fom: '2023-02-17', tom: '2023-03-04' }],
        redusertLoennIAgp: null
      },
      inntekt: {
        beloep: 77000,
        inntektsdato: '2023-03-15',
        endringAarsaker: []
      },
      refusjon: { beloepPerMaaned: 77000, sluttdato: null, endringer: [{ beloep: 60000, startdato: '2023-03-15' }] },
      avsenderTlf: '12345678',
      naturalytelser: [],
      flereArbeidsforhold: null
    });

    // verify receipt page
    await page.waitForURL(`/im-dialog/kvittering/${uuid}?fromSubmit=true`, { timeout: 15000 });
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
  });

  test('can check radios for refusjon, set refusjon higher than inntekt and submit, fail because of refusjon endring date, fix error and resubmit', async ({
    page
  }) => {
    // select full lønn in AGP
    const formPage = new FormPage(page);
    await formPage.checkRadioButton('Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?', 'Ja');

    // select refusjon under sykefravær
    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Ja');

    // select "Nei" for changes in refusjon
    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Ja'
    );

    await formPage.fillInput('Endret beløp/måned', '60000');
    await formPage.fillInput('Dato for endring', '15.02.23');

    // confirm checkbox
    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');

    // submit
    await formPage.clickButton('Send');

    // 'Refusjon kan ikke være høyere enn beregnet månedslønn.'
    await formPage.assertVisibleTextAtLeastOnce('Vennligst fyll inn gyldig dato for endring av refusjon.');

    await formPage.fillInput('Dato for endring', '15.04.23');

    // assert request payload
    const req = await formPage.submitAndWaitForRequest('*/**/api/innsendingInntektsmelding');
    const body = JSON.parse(req.postData()!);
    expect(body).toEqual({
      forespoerselId: uuid,
      agp: {
        perioder: [{ fom: '2023-02-17', tom: '2023-03-04' }],
        redusertLoennIAgp: null
      },
      inntekt: {
        beloep: 77000,
        inntektsdato: '2023-03-15',
        endringAarsaker: []
      },
      refusjon: { beloepPerMaaned: 77000, sluttdato: null, endringer: [{ beloep: 60000, startdato: '2023-04-15' }] },
      avsenderTlf: '12345678',
      naturalytelser: [],
      flereArbeidsforhold: null
    });

    // verify receipt page
    await expect(page).toHaveURL(`/im-dialog/kvittering/${uuid}?fromSubmit=true`);
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
  });
});
