import { test, expect, Page } from '@playwright/test';
import apiData from '../mockdata/trenger-forhaandsutfyll.json';

test.describe('Utfylling og innsending av skjema', () => {
  test.beforeEach(async ({ page }) => {
    // intercept hentKvittering → 404
    await page.route('**/im-dialog/api/hentKvittering/**', (route) =>
      route.fulfill({
        status: 404,
        body: JSON.stringify({ name: 'Nothing' }),
        headers: { 'Content-Type': 'application/json' }
      })
    );
    // intercept hent-forespoersel → fixture
    await page.route('**/im-dialog/api/hent-forespoersel', (route) =>
      route.fulfill({ status: 200, body: JSON.stringify(apiData), headers: { 'Content-Type': 'application/json' } })
    );
    // intercept inntektsdata → 404
    await page.route('**/im-dialog/api/inntektsdata', (route) =>
      route.fulfill({
        status: 404,
        body: JSON.stringify({ name: 'Nothing' }),
        headers: { 'Content-Type': 'application/json' }
      })
    );
    // intercept innsendingInntektsmelding → 201
    await page.route('**/im-dialog/api/innsendingInntektsmelding', (route) =>
      route.fulfill({
        status: 201,
        body: JSON.stringify({ name: 'Nothing' }),
        headers: { 'Content-Type': 'application/json' }
      })
    );
    // visit page
    await page.goto('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');
  });

  test('should display information on the person and the submitter', async ({ page }) => {
    // wait for ready state
    await page.waitForResponse('**/hent-forespoersel');

    // Person data
    await expect(page.locator('[data-cy="navn"]')).toHaveText('Test Navn Testesen-Navnesen Jr.');
    await expect(page.locator('[data-cy="identitetsnummer"]')).toHaveText('10486535275');
    await expect(page.locator('[data-cy="virksomhetsnavn"]')).toHaveText('Veldig ampert piggsvin barnehage');
    await expect(page.locator('[data-cy="orgnummer"]')).toHaveText('911206722');
    await expect(page.locator('[data-cy="innsendernavn"]')).toHaveText('Test Testesen');
    await expect(page.locator('text=Telefon innsender').locator('input')).toHaveValue('12345678');

    // Egenmelding perioder
    await expect(page.locator('[data-cy="egenmelding"] .navds-label').first()).toHaveText('Fra');
    await expect(page.locator('[data-cy="egenmelding"] .navds-label').last()).toHaveText('Til');
    await expect(page.locator('[data-cy="egenmelding-fra"]')).toHaveText('01.02.2023');
    await expect(page.locator('[data-cy="egenmelding-til"]')).toHaveText('03.02.2023');

    // Sykmelding perioder
    await expect(page.locator('[data-cy="sykmelding-0-fra"]')).toHaveText('Fra');
    await expect(page.locator('[data-cy="sykmelding-0-til"]')).toHaveText('Til');
    await expect(page.locator('[data-cy="sykmelding-0-fra-dato"]')).toHaveText('04.02.2023');
    await expect(page.locator('[data-cy="sykmelding-0-til-dato"]')).toHaveText('15.02.2023');

    // Arbeidsgiverperiode
    await expect(page.locator('[data-cy="arbeidsgiverperiode-0-fra"]')).toHaveText('Fra');
    await expect(page.locator('[data-cy="arbeidsgiverperiode-0-til"]')).toHaveText('Til');
    await expect(page.locator('[data-cy="arbeidsgiverperiode-0-fra-dato"]')).toHaveText('01.02.2023');
    await expect(page.locator('[data-cy="arbeidsgiverperiode-0-til-dato"]')).toHaveText('15.02.2023');

    // Tidligere inntekter table
    const rows = page.locator('[data-cy="tidligereinntekt"] tbody tr');
    await expect(rows).toHaveCount(3);
    await expect(rows.first().locator('td').first()).toHaveText('November:');
    await expect(rows.first().locator('td').last()).toHaveText(/88\s000,00\skr/);
    await expect(rows.last().locator('td').first()).toHaveText('Januar:');
    await expect(rows.last().locator('td').last()).toHaveText(/66\s000,00\skr/);

    // Radio groups and checkboxes
    await page.locator('fieldset:has-text("Betaler arbeidsgiver ut full lønn") >> text=Ja').check();
    await page.locator('fieldset:has-text("Betaler arbeidsgiver lønn og krever refusjon") >> text=Nei').check();
    await page.locator('text=Jeg bekrefter at opplysningene').check();

    // accessibility
    await page.injectAxe(); // requires setup in playwright.config
    await page.checkA11y();

    // Submit
    await page.locator('button:has-text("Send")').click();
    await page.waitForResponse('**/innsendingInntektsmelding');

    // Confirmation
    await expect(page.locator('text=Kvittering - innsendt inntektsmelding')).toBeVisible();
    await page.checkA11y();
  });
});
