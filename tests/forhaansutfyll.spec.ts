import { test, expect } from '@playwright/test';
import apiData from '../mockdata/trenger-forhaandsutfyll.json';
import { AxeBuilder } from '@axe-core/playwright';

const uuid = '8d1b4043-5a9e-4225-9ba8-5dc22f515796';
const baseUrl = `http://localhost:3000/im-dialog/${uuid}`;

test.describe('Utfylling og innsending av skjema', () => {
  test.beforeEach(async ({ page }) => {
    // intercept hentKvittering → 404
    await page.route('*/**/api/hentKvittering/**', (route) =>
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Nothing' })
      })
    );
  });

  test('should display information on the person and the submitter', async ({ page }) => {
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

    await page.goto(baseUrl);

    // Person data
    await expect(page.locator('[data-cy="navn"]')).toHaveText('Test Navn Testesen-Navnesen Jr.');
    await expect(page.locator('[data-cy="identitetsnummer"]')).toHaveText('10486535275');
    await expect(page.locator('[data-cy="virksomhetsnavn"]')).toHaveText('Veldig ampert piggsvin barnehage');
    await expect(page.locator('[data-cy="orgnummer"]')).toHaveText('911206722');
    await expect(page.locator('[data-cy="innsendernavn"]')).toHaveText('Test Testesen');
    await expect(page.getByLabel('Telefon innsender')).toHaveValue('12345678');

    // Egenmelding periods
    await expect(page.locator('[data-cy="egenmelding-0-fra"]').first()).toHaveText('Fra');
    await expect(page.locator('[data-cy="egenmelding-0-til"]').last()).toHaveText('Til');
    await expect(page.locator('[data-cy="egenmelding-0-fra-dato"]')).toHaveText('01.02.2023');
    await expect(page.locator('[data-cy="egenmelding-0-til-dato"]')).toHaveText('03.02.2023');

    // Sykmelding periods
    await expect(page.locator('[data-cy="sykmelding-0-fra"]')).toHaveText('Fra');
    await expect(page.locator('[data-cy="sykmelding-0-til"]')).toHaveText('Til');
    await expect(page.locator('[data-cy="sykmelding-0-fra-dato"]')).toHaveText('04.02.2023');
    await expect(page.locator('[data-cy="sykmelding-0-til-dato"]')).toHaveText('15.02.2023');

    // Arbeidsgiverperiode
    await expect(page.locator('[data-cy="arbeidsgiverperiode-0-fra"]')).toHaveText('Fra');
    await expect(page.locator('[data-cy="arbeidsgiverperiode-0-til"]')).toHaveText('Til');
    await expect(page.locator('[data-cy="arbeidsgiverperiode-0-fra-dato"]')).toHaveText('01.02.2023');
    await expect(page.locator('[data-cy="arbeidsgiverperiode-0-til-dato"]')).toHaveText('15.02.2023');

    // Tidligere inntekter
    const rows = page.locator('[data-cy="tidligereinntekt"] tbody tr');
    await expect(rows).toHaveCount(3);
    await expect(rows.first().locator('td').first()).toHaveText('November:');
    await expect(rows.first().locator('td').last()).toHaveText(/88\s000,00\skr/);
    await expect(rows.last().locator('td').first()).toHaveText('Januar:');
    await expect(rows.last().locator('td').last()).toHaveText(/66\s000,00\skr/);

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
    await pageLoad;
    // await expect(page.getByText('Kvittering - innsendt inntektsmelding')).toBeVisible();
    await expect(page.locator("h2:has-text('Kvittering - innsendt inntektsmelding')")).toBeVisible();

    const accessibilityScanResultsKvittering = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResultsKvittering.violations).toEqual([]);
  });
});
