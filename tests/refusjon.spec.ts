import { test, expect } from '@playwright/test';
import originalData from '../mockdata/trenger-originalen.json';
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

  test('can check radios for refusjon and submit', async ({ page }) => {
    // select full lønn in AGP
    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?' })
      .getByLabel('Ja')
      .check();

    // select refusjon under sykefravær
    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?' })
      .getByLabel('Ja')
      .check();

    // select "Nei" for changes in refusjon
    const refusjonGroup = page.getByRole('group', {
      name: /Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?/
    });
    await refusjonGroup.getByRole('radio', { name: 'Nei' }).check();

    // confirm checkbox
    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    // submit

    // assert request payload
    const reqPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await page.getByRole('button', { name: 'Send' }).click();
    const req = await reqPromise;
    const body = JSON.parse(req.postData()!);
    expect(body).toEqual({
      forespoerselId: uuid,
      agp: {
        perioder: [{ fom: '2023-02-17', tom: '2023-03-04' }],
        egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
        redusertLoennIAgp: null
      },
      inntekt: {
        beloep: 77000,
        inntektsdato: '2023-03-15',
        naturalytelser: [],
        endringAarsaker: []
      },
      refusjon: { beloepPerMaaned: 77000, sluttdato: null, endringer: [] },
      avsenderTlf: '12345678'
    });

    // verify receipt page
    await expect(page).toHaveURL(`/im-dialog/kvittering/${uuid}`);
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
  });

  test('can check radios for refusjon, set refusjon higher than inntekt and submit, fail because of refusjon endring beløp, fix error and resubmit', async ({
    page
  }) => {
    // select full lønn in AGP
    const formPage = new FormPage(page);
    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?' })
      .getByLabel('Ja')
      .check();

    // select refusjon under sykefravær
    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?' })
      .getByLabel('Ja')
      .check();

    // select "Nei" for changes in refusjon
    const refusjonGroup = page.getByRole('group', {
      name: /Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?/
    });
    await refusjonGroup.getByRole('radio', { name: 'Ja' }).check();

    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Ja'
    );

    await formPage.fillInput('Endret beløp/måned', '80000');
    await formPage.fillInput('Dato for endring', '15.03.23');

    // confirm checkbox
    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    // submit
    await formPage.clickButton('Send');

    // 'Refusjon kan ikke være høyere enn inntekt.'
    await formPage.assertVisibleTextAtLeastOnce('Refusjon kan ikke være høyere enn inntekt.');

    await formPage.fillInput('Endret beløp/måned', '60000');

    // assert request payload
    const reqPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await page.getByRole('button', { name: 'Send' }).click();
    const req = await reqPromise;
    const body = JSON.parse(req.postData()!);
    expect(body).toEqual({
      forespoerselId: uuid,
      agp: {
        perioder: [{ fom: '2023-02-17', tom: '2023-03-04' }],
        egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
        redusertLoennIAgp: null
      },
      inntekt: {
        beloep: 77000,
        inntektsdato: '2023-03-15',
        naturalytelser: [],
        endringAarsaker: []
      },
      refusjon: { beloepPerMaaned: 77000, sluttdato: null, endringer: [{ beloep: 60000, startdato: '2023-03-15' }] },
      avsenderTlf: '12345678'
    });

    // verify receipt page
    await expect(page).toHaveURL(`/im-dialog/kvittering/${uuid}`);
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
  });

  test('can check radios for refusjon, set refusjon higher than inntekt and submit, fail because of refusjon endring date, fix error and resubmit', async ({
    page
  }) => {
    // select full lønn in AGP
    const formPage = new FormPage(page);
    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?' })
      .getByLabel('Ja')
      .check();

    // select refusjon under sykefravær
    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?' })
      .getByLabel('Ja')
      .check();

    // select "Nei" for changes in refusjon
    const refusjonGroup = page.getByRole('group', {
      name: /Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?/
    });
    await refusjonGroup.getByRole('radio', { name: 'Ja' }).check();

    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Ja'
    );

    await formPage.fillInput('Endret beløp/måned', '60000');
    await formPage.fillInput('Dato for endring', '15.02.23');

    // confirm checkbox
    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    // submit
    await formPage.clickButton('Send');

    // 'Refusjon kan ikke være høyere enn inntekt.'
    await formPage.assertVisibleTextAtLeastOnce('Vennligst fyll inn gyldig dato for endring i refusjon.');

    await formPage.fillInput('Dato for endring', '15.04.23');

    // assert request payload
    const reqPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await page.getByRole('button', { name: 'Send' }).click();
    const req = await reqPromise;
    const body = JSON.parse(req.postData()!);
    expect(body).toEqual({
      forespoerselId: uuid,
      agp: {
        perioder: [{ fom: '2023-02-17', tom: '2023-03-04' }],
        egenmeldinger: [{ fom: '2023-02-17', tom: '2023-02-19' }],
        redusertLoennIAgp: null
      },
      inntekt: {
        beloep: 77000,
        inntektsdato: '2023-03-15',
        naturalytelser: [],
        endringAarsaker: []
      },
      refusjon: { beloepPerMaaned: 77000, sluttdato: null, endringer: [{ beloep: 60000, startdato: '2023-04-15' }] },
      avsenderTlf: '12345678'
    });

    // verify receipt page
    await expect(page).toHaveURL(`/im-dialog/kvittering/${uuid}`);
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
  });
});
