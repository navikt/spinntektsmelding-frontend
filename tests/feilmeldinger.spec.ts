import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { FormPage } from './utils/formPage';

const uuid = '8d1b4043-5a9e-4225-9ba8-5dc22f515796';
const baseUrl = `http://localhost:3000/im-dialog/${uuid}`;

test.describe('Trigge så mange feilmeldinger som mulig', () => {
  test.beforeEach(async ({ page }) => {
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
    await page.goto(baseUrl);

    await test.step('Sjekk valideringsfeil for bekreftelse', async () => {
      await formPage.clickButton('Send');
      // Validation errors
      // await expect(page.getByText('Du må bekrefte at opplysningene er riktige før du kan sende inn.')).toBeVisible();
      await formPage.assertVisibleTextAtLeastOnce('Du må bekrefte at opplysningene er riktige før du kan sende inn.');

      await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');
      await formPage.clickButton('Send');
    });
    await test.step('Sjekk valideringsfeil for lønn i arbeidsgiverperioden', async () => {
      await formPage.assertVisibleTextAtLeastOnce('Velg om full lønn betales i arbeidsgiverperioden.');
      await formPage.assertVisibleTextAtLeastOnce(
        'Vennligst angi om det betales lønn og kreves refusjon etter arbeidsgiverperioden.'
      );

      await formPage.checkRadioButton('Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?', 'Nei');
      // Vent på at feltet for beløp blir synlig før vi klikker Send
      await formPage.assertVisibleTextAtLeastOnce('Utbetalt under arbeidsgiverperiode');
      await formPage.clickButton('Send');
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
    });

    await test.step('Sjekk valideringsfeil for refusjon', async () => {
      await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Ja');
      await formPage.clickButton('Send');

      await formPage.assertVisibleTextAtLeastOnce('Vennligst angi om det er endringer i refusjonsbeløpet i perioden.');

      await formPage.clickButton('Endre', 2);
      await formPage.fillInput('Oppgi refusjonsbeløpet per måned', '500000');
      await formPage.clickButton('Send');

      await formPage.assertVisibleTextAtLeastOnce('Refusjonsbeløpet kan ikke være høyere enn inntekten.');

      await formPage.fillInput('Oppgi refusjonsbeløpet per måned', '77000');

      await formPage.checkRadioButton(
        'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
        'Ja'
      );
      await formPage.clickButton('Send');

      await formPage.assertVisibleTextAtLeastOnce('Vennligst fyll inn beløpet for endret refusjon.');
      await formPage.assertVisibleTextAtLeastOnce('Vennligst fyll inn gyldig dato for endring av refusjon.');

      await formPage.fillInput('Endret beløp/måned', '45000');
      await formPage.fillInput('Dato for endring', '04.04.2023');

      await formPage.uncheckCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');
      await formPage.clickButton('Send');
      await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');
    });
    await test.step('Sjekk valideringsfeil for naturalytelser', async () => {
      await formPage.checkCheckbox('Har den ansatte naturalytelser som faller bort under sykefraværet?');
      await formPage.clickButton('Send');
      await formPage.assertVisibleTextAtLeastOnce('Vennligst velg ytelse.');
      await formPage.assertVisibleTextAtLeastOnce('Vennligst fyll inn dato.');
      await formPage.assertVisibleTextAtLeastOnce('Vennligst fyll inn beløpet.');

      await formPage.selectOption('Naturalytelse', 'Opsjoner');
      await formPage.fillInput('Dato naturalytelse faller bort', '01.05.23');
      await formPage.fillInput('Verdi naturalytelse - kr/måned	', '45000');
    });

    await test.step('Accessibility scan før innsending', async () => {
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      expect(accessibilityScanResults.violations).toEqual([]);
    });

    await test.step('Send inn og verifiser payload', async () => {
      const pageLoad = page.waitForResponse('*/**/api/innsendingInntektsmelding');
      await formPage.clickButton('Send');
      const req = await pageLoad;

      const body = JSON.parse(req.request().postData()!);
      expect(body).toEqual({
        agp: {
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
        forespoerselId: uuid,
        inntekt: {
          beloep: 77000,
          endringAarsaker: [],

          inntektsdato: '2023-02-18'
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
        },
        naturalytelser: [
          {
            naturalytelse: 'OPSJONER',
            sluttdato: '2023-05-01',
            verdiBeloep: 45000
          }
        ]
      });
    });

    await test.step('Verifiser kvittering', async () => {
      await expect(page.locator("h2:has-text('Kvittering - innsendt inntektsmelding')")).toBeVisible();
      await formPage.assertVisibleTextAtLeastOnce(
        'Husk å kontroller at du har rapportert inn korrekt kontonummer til Altinn'
      );

      await formPage.assertVisibleTextAtLeastOnce('Ansatt har ikke hatt fravær fra jobb');
      await formPage.assertVisibleTextAtLeastOnce('04.04.2023');
      await formPage.assertVisibleTextAtLeastOnce('45 000,00');
      // Accessibility scan
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });
});
