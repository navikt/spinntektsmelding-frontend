import { test, expect } from '@playwright/test';
import apiData from '../mockdata/trenger-originalen-begrenset.json';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Begrenset forespørsel', () => {
  test.beforeEach(async ({ page }) => {
    // intercept hentKvittering → 404
    await page.route('*/**/api/hentKvittering/**', (route) =>
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Nothing' })
      })
    );
    // inject a11y checks
    // await page.addInitScript(() => {
    //   // require('@axe-core/playwright').injectAxe();
    // });
  });

  test('should display information on the person and the submitter', async ({ page }) => {
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

    await page.goto('http://localhost:3000/im-dialog/8d50ef20-37b5-4829-ad83-56219e70b375');
    // await page.waitForResponse('*/**/api/hent-forespoersel/*');

    // Person data
    await expect(page.locator('[data-cy="navn"]')).toHaveText('Test Navn Testesen-Navnesen Jr.');
    await expect(page.locator('[data-cy="identitetsnummer"]')).toHaveText('25087327879');
    await expect(page.locator('[data-cy="virksomhetsnavn"]')).toHaveText('Veldig ampert piggsvin barnehage');
    await expect(page.locator('[data-cy="orgnummer"]')).toHaveText('911206722');
    await expect(page.locator('[data-cy="innsendernavn"]')).toHaveText('Test Testesen');
    await expect(page.getByLabel('Telefon innsender')).toHaveValue('12345678');

    // Egenmelding periods
    // await expect(page.locator('[data-cy="egenmelding"] .navds-label').first()).toHaveText('Fra');
    // await expect(page.locator('[data-cy="egenmelding"] .navds-label').last()).toHaveText('Til');
    // await expect(page.locator('[data-cy="egenmelding-fra"]')).toHaveText('01.02.2023');
    // await expect(page.locator('[data-cy="egenmelding-til"]')).toHaveText('03.02.2023');

    // Sykmelding periods
    await expect(page.locator('[data-cy="sykmelding-0-fra"]')).toHaveText('Fra');
    await expect(page.locator('[data-cy="sykmelding-0-til"]')).toHaveText('Til');
    await expect(page.locator('[data-cy="sykmelding-0-fra-dato"]')).toHaveText('20.02.2023');
    await expect(page.locator('[data-cy="sykmelding-0-til-dato"]')).toHaveText('04.03.2023');

    // Arbeidsgiverperiode
    await expect(page.locator('[data-cy="arbeidsgiverperiode-0-fra"]')).toHaveText('Fra');
    await expect(page.locator('[data-cy="arbeidsgiverperiode-0-til"]')).toHaveText('Til');
    await expect(page.locator('[data-cy="arbeidsgiverperiode-0-fra-dato"]')).toHaveText('20.02.2023');
    await expect(page.locator('[data-cy="arbeidsgiverperiode-0-til-dato"]')).toHaveText('04.03.2023');

    // Tidligere inntekter
    const rows = page.locator('[data-cy="tidligereinntekt"] tbody tr');
    await expect(rows).toHaveCount(3);
    await expect(rows.first().locator('td').first()).toHaveText('Desember:');
    await expect(rows.first().locator('td').last()).toHaveText(/88\s000,00\skr/);
    await expect(rows.last().locator('td').first()).toHaveText('Februar:');
    await expect(rows.last().locator('td').last()).toHaveText(/88\s000,00\skr/);

    // Radio selection
    await page.locator('fieldset:has-text("Betaler arbeidsgiver ut full lønn")').getByLabel('Ja').check();
    await page.locator('fieldset:has-text("Betaler arbeidsgiver lønn og krever refusjon")').getByLabel('Nei').check();
    await page
      .getByRole('checkbox', { name: 'Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.' })
      .check();

    // Accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

    // Submit and confirm
    const pageLoad = page.waitForResponse('*/**/api/innsendingInntektsmelding');
    await page.getByRole('button', { name: 'Send' }).click();
    const req = await pageLoad;

    const body = JSON.parse(req.request().postData()!);
    expect(body).toEqual({
      forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375',
      agp: {
        egenmeldinger: [],
        perioder: [
          {
            fom: '2023-02-20',
            tom: '2023-03-04'
          },
          {
            fom: '2023-03-15',
            tom: '2023-03-17'
          }
        ],
        redusertLoennIAgp: null
      },
      inntekt: {
        beloep: 77000,
        endringAarsaker: [],
        inntektsdato: '2023-03-25',
        naturalytelser: []
      },
      refusjon: null,
      avsenderTlf: '12345678'
    });

    // await expect(page.getByText('Kvittering - innsendt inntektsmelding')).toBeVisible();
    await expect(page.locator("h2:has-text('Kvittering - innsendt inntektsmelding')")).toBeVisible();

    await expect(page.locator('[data-cy="bestemmendefravaersdag"]')).toHaveText('25.03.2023');

    const accessibilityScanResultsKvittering = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResultsKvittering.violations).toEqual([]);
  });
});
