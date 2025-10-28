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

    await formPage.clickButton('Send');
    // Validation errors
    await formPage.assertVisibleTextAtLeastOnce('Du må bekrefte at opplysningene er riktige før du kan sende inn.');

    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');
    await formPage.clickButton('Send');

    await Promise.all([
      formPage.assertVisibleTextAtLeastOnce('Velg om full lønn betales i arbeidsgiverperioden.'),
      formPage.assertVisibleTextAtLeastOnce(
        'Vennligst angi om det betales lønn og kreves refusjon etter arbeidsgiverperioden.'
      )
    ]);

    await formPage.checkRadioButton('Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?', 'Nei');
    await formPage.clickButton('Send');
    await Promise.all([
      formPage.assertVisibleTextAtLeastOnce('Beløp utbetalt i arbeidsgiverperioden må fylles ut.'),
      formPage.assertVisibleTextAtLeastOnce('Begrunnelse for redusert utbetaling i arbeidsgiverperioden må fylles ut')
    ]);
    await formPage.assertVisibleTextAtLeastOnce('Beløp utbetalt i arbeidsgiverperioden må fylles ut.');
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

    await Promise.all([
      formPage.assertVisibleTextAtLeastOnce('Vennligst fyll inn beløpet for endret refusjon.'),
      formPage.assertVisibleTextAtLeastOnce('Vennligst fyll inn gyldig dato for endring av refusjon.')
    ]);

    await formPage.fillInput('Endret beløp/måned', '45000');
    await formPage.fillInput('Dato for endring', '04.04.2023');

    // Vent på at validering kjører (feilmeldinger forsvinner)
    await Promise.all([
      formPage.assertNotVisibleText('Vennligst fyll inn beløpet for endret refusjon.'),
      formPage.assertNotVisibleText('Vennligst fyll inn gyldig dato for endring av refusjon.')
    ]);

    await formPage.uncheckCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');
    await formPage.clickButton('Send');
    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');

    await formPage.checkCheckbox('Har den ansatte naturalytelser som faller bort under sykefraværet?');

    await formPage.clickButton('Send');

    await Promise.all([
      formPage.assertVisibleTextAtLeastOnce('Vennligst velg ytelse.'),
      formPage.assertVisibleTextAtLeastOnce('Vennligst fyll inn dato.'),
      formPage.assertVisibleTextAtLeastOnce('Vennligst fyll inn beløpet.')
    ]);

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

    // Accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
