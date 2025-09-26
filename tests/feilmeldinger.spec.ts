import { test, expect } from '@playwright/test';
import apiData from '../mockdata/trenger-forhaandsutfyll.json';
import { AxeBuilder } from '@axe-core/playwright';
import { FormPage } from './utils/formPage';

test.describe('Trigge så mange feilmeldinger som mulig', () => {
  test.beforeEach(async ({ page }) => {
    // intercept hentKvittering → 404
    await page.route('*/**/api/hentKvittering/**', (route) =>
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Nothing' })
      })
    );
    // intercept forespoersel
    await page.route('*/**/api/hent-forespoersel/*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(apiData)
      })
    );
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
  });

  test('should display information on the person and the submitter', async ({ page }) => {
    const formPage = new FormPage(page);
    // intercept forespoersel

    const response = page.waitForResponse('*/**/api/hent-forespoersel/*');
    await page.goto('http://localhost:3000/im-dialog/8d50ef20-37b5-4829-ad83-56219e70b375');
    await response;

    // // Person data
    // await expect(page.locator('[data-cy="navn"]')).toHaveText('Test Navn Testesen-Navnesen Jr.');
    // await expect(page.locator('[data-cy="identitetsnummer"]')).toHaveText('10486535275');
    // await expect(page.locator('[data-cy="virksomhetsnavn"]')).toHaveText('Veldig ampert piggsvin barnehage');
    // await expect(page.locator('[data-cy="orgnummer"]')).toHaveText('911206722');
    // await expect(page.locator('[data-cy="innsendernavn"]')).toHaveText('Test Testesen');
    // await expect(page.getByLabel('Telefon innsender')).toHaveValue('12345678');

    // // Egenmelding periods
    // await expect(page.locator('[data-cy="egenmelding"] .navds-label').first()).toHaveText('Fra');
    // await expect(page.locator('[data-cy="egenmelding"] .navds-label').last()).toHaveText('Til');
    // await expect(page.locator('[data-cy="egenmelding-fra"]')).toHaveText('01.02.2023');
    // await expect(page.locator('[data-cy="egenmelding-til"]')).toHaveText('03.02.2023');

    // // Sykmelding periods
    // await expect(page.locator('[data-cy="sykmelding-0-fra"]')).toHaveText('Fra');
    // await expect(page.locator('[data-cy="sykmelding-0-til"]')).toHaveText('Til');
    // await expect(page.locator('[data-cy="sykmelding-0-fra-dato"]')).toHaveText('04.02.2023');
    // await expect(page.locator('[data-cy="sykmelding-0-til-dato"]')).toHaveText('15.02.2023');

    // // Arbeidsgiverperiode
    // await expect(page.locator('[data-cy="arbeidsgiverperiode-0-fra"]')).toHaveText('Fra');
    // await expect(page.locator('[data-cy="arbeidsgiverperiode-0-til"]')).toHaveText('Til');
    // await expect(page.locator('[data-cy="arbeidsgiverperiode-0-fra-dato"]')).toHaveText('01.02.2023');
    // await expect(page.locator('[data-cy="arbeidsgiverperiode-0-til-dato"]')).toHaveText('15.02.2023');

    // // Tidligere inntekter
    // const rows = page.locator('[data-cy="tidligereinntekt"] tbody tr');
    // await expect(rows).toHaveCount(3);
    // await expect(rows.first().locator('td').first()).toHaveText('November:');
    // await expect(rows.first().locator('td').last()).toHaveText(/88\s000,00\skr/);
    // await expect(rows.last().locator('td').first()).toHaveText('Januar:');
    // await expect(rows.last().locator('td').last()).toHaveText(/66\s000,00\skr/);

    await formPage.clickButton('Send');
    // Validation errors
    await expect(page.getByText('Du må bekrefte at opplysningene er riktige før du kan sende inn.')).toBeVisible();

    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');
    await formPage.clickButton('Send');

    await formPage.assertVisibleTextAtLeastOnce('Velg om full lønn betales i arbeidsgiverperioden.');
    await formPage.assertVisibleTextAtLeastOnce(
      'Vennligst angi om det betales lønn og kreves refusjon etter arbeidsgiverperioden.'
    );

    await formPage.checkRadioButton('Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?', 'Nei');
    await formPage.clickButton('Send');
    await formPage.assertVisibleTextAtLeastOnce('Beløp utbetalt i arbeidsgiverperioden må fylles ut');
    await formPage.assertVisibleTextAtLeastOnce(
      'Begrunnelse for redusert utbetaling i arbeidsgiverperioden må fylles ut'
    );

    await formPage.fillInput('Utbetalt under arbeidsgiverperiode', '5000000');
    await formPage.clickButton('Send');
    await formPage.assertVisibleTextAtLeastOnce(
      'Begrunnelse for redusert utbetaling i arbeidsgiverperioden må fylles ut'
    );

    await formPage.selectOption(
      'Velg begrunnelse for ingen eller redusert utbetaling',
      'Ansatt har ikke hatt fravær fra jobb'
    );
    await formPage.clickButton('Send');
    await formPage.assertVisibleTextAtLeastOnce(
      'Utbetalingen under arbeidsgiverperioden kan ikke være høyere enn beregnet månedslønn.'
    );

    await formPage.fillInput('Utbetalt under arbeidsgiverperiode', '50000');

    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Ja');
    await formPage.clickButton('Send');

    await formPage.assertVisibleTextAtLeastOnce('Vennligst angi om det er endringer i refusjonsbeløpet i perioden.');

    await formPage.clickButton('Endre', 3);
    await formPage.fillInput('Oppgi refusjonsbeløpet per måned', '500000');
    await formPage.clickButton('Send');

    await formPage.assertVisibleTextAtLeastOnce('Refusjonsbeløpet per måned må være lavere eller lik månedsinntekt.');

    await formPage.fillInput('Oppgi refusjonsbeløpet per måned', '77000');

    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Ja'
    );
    await formPage.clickButton('Send');

    await formPage.assertVisibleTextAtLeastOnce('Vennligst fyll inn beløpet for endret refusjon.');
    await formPage.assertVisibleTextAtLeastOnce('Vennligst fyll inn gyldig dato for endring i refusjon.');

    await formPage.fillInput('Endret beløp/måned', '45000');
    await formPage.fillInput('Dato for endring', '04.04.2023');
    await formPage.uncheckCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');
    await formPage.clickButton('Send');
    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');

    await formPage.checkCheckbox('Har den ansatte naturalytelser som faller bort under sykefraværet?');
    await formPage.clickButton('Send');
    await formPage.assertVisibleTextAtLeastOnce('Vennligst velg ytelse.');
    await formPage.assertVisibleTextAtLeastOnce('Vennligst fyll inn dato.');
    await formPage.assertVisibleTextAtLeastOnce('Vennligst fyll inn beløpet.');

    await formPage.selectOption('Naturalytelse', 'Opsjoner');
    await formPage.fillInput('Dato naturalytelse faller bort', '01.05.23');
    await formPage.fillInput('Verdi naturalytelse - kr/måned	', '45000');

    const pageLoad = page.waitForResponse('*/**/api/innsendingInntektsmelding');
    await page.getByRole('button', { name: 'Send' }).click();
    const req = await pageLoad;

    const body = JSON.parse(req.request().postData()!);
    expect(body).toEqual({
      agp: {
        egenmeldinger: [
          {
            fom: '2023-02-01',
            tom: '2023-02-03'
          }
        ],
        perioder: [
          {
            fom: '2023-02-01',
            tom: '2023-02-15'
          },
          {
            fom: '2023-02-18',
            tom: '2023-02-18'
          }
        ],

        redusertLoennIAgp: {
          begrunnelse: 'IkkeFravaer',
          beloep: 50000
        }
      },
      avsenderTlf: '12345678',
      forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      inntekt: {
        beloep: 77000,
        endringAarsaker: [],

        inntektsdato: '2023-02-18',
        naturalytelser: [
          {
            naturalytelse: 'OPSJONER',
            sluttdato: '2023-05-01',
            verdiBeloep: 45000
          }
        ]
      },
      refusjon: {
        beloepPerMaaned: 77000,
        endringer: [
          {
            beloep: 45000,
            startdato: '2023-04-04'
          }
        ],
        sluttdato: null
      }
    });

    await expect(page.locator("h2:has-text('Kvittering - innsendt inntektsmelding')")).toBeVisible();
    // Radio selection
    // // await page.locator('fieldset:has-text("Betaler arbeidsgiver ut full lønn")').getByLabel('Ja').check();
    // // await page.locator('fieldset:has-text("Betaler arbeidsgiver lønn og krever refusjon")').getByLabel('Nei').check();
    // // await page
    // //   .getByRole('checkbox', { name: 'Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.' })
    // //   .check();

    // Accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

    // // Submit and confirm
    // const pageLoad = page.waitForResponse('*/**/api/innsendingInntektsmelding');
    // await page.getByRole('button', { name: 'Send' }).click();
    // await pageLoad;
    // // await expect(page.getByText('Kvittering - innsendt inntektsmelding')).toBeVisible();
    // await expect(page.locator("h2:has-text('Kvittering - innsendt inntektsmelding')")).toBeVisible();

    // const accessibilityScanResultsKvittering = await new AxeBuilder({ page }).analyze();
    // expect(accessibilityScanResultsKvittering.violations).toEqual([]);
  });
});
