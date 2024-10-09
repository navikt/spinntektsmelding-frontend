import { test, expect } from '@playwright/test';
import forhaandsutfyllt from '../mockdata/trenger-forhaandsutfyll.json';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Utfylling og innsending av skjema', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('*/**/api/hentKvittering/12345678-3456-5678-2457-123456789012', (route) => {
      route.fulfill({
        status: 404,
        body: JSON.stringify({ name: 'Nothing' })
      });
    });

    await page.route('/collect', async (route) => {
      await route.fulfill({
        status: 202,
        body: 'OK'
      });
    });
  });

  test('should display information on the person and the submitter', async ({ page }) => {
    await page.route('*/**/api/hent-forespoersel', async (route) => {
      route.fulfill({
        json: forhaandsutfyllt
      });
    });

    await page.route('*/**/api/inntektsdata', async (route) => {
      route.fulfill({
        status: 404,
        body: JSON.stringify({ name: 'Nothing' })
      });
    });

    await page.route('*/**/api/innsendingInntektsmelding', async (route) => {
      route.fulfill({
        status: 201,
        body: JSON.stringify({ name: 'Nothing' })
      });
    });

    await page.goto('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');
    // await page.waitForResponse('*/**/api/hent-forespoersel');

    await expect(page.locator('[data-cy="navn"]')).toHaveText('Test Navn Testesen-Navnesen Jr.');
    await expect(page.locator('[data-cy="identitetsnummer"]')).toHaveText('10486535275');
    await expect(page.locator('[data-cy="virksomhetsnavn"]')).toHaveText('Veldig ampert piggsvin barnehage');
    await expect(page.locator('[data-cy="orgnummer"]')).toHaveText('911206722');
    await expect(page.locator('[data-cy="innsendernavn"]')).toHaveText('Test Testesen');
    await expect(page.locator('[data-cy="innsendertlf"]')).toHaveValue('12345678');

    await expect(page.locator('[data-cy="egenmelding"] .navds-label').first()).toHaveText('Fra');
    await expect(page.locator('[data-cy="egenmelding"] .navds-label').last()).toHaveText('Til');
    await expect(page.locator('[data-cy="egenmelding-fra"]')).toHaveText('01.02.2023');
    await expect(page.locator('[data-cy="egenmelding-til"]')).toHaveText('03.02.2023');

    await expect(page.locator('[data-cy="sykmelding-0-fra"]')).toHaveText('Fra');
    await expect(page.locator('[data-cy="sykmelding-0-til"]')).toHaveText('Til');
    await expect(page.locator('[data-cy="sykmelding-0-fra-dato"]')).toHaveText('04.02.2023');
    await expect(page.locator('[data-cy="sykmelding-0-til-dato"]')).toHaveText('15.02.2023');

    await expect(page.locator('[data-cy="arbeidsgiverperiode-0-fra"]')).toHaveText('Fra');
    await expect(page.locator('[data-cy="arbeidsgiverperiode-0-til"]')).toHaveText('Til');
    await expect(page.locator('[data-cy="arbeidsgiverperiode-0-fra-dato"]')).toHaveText('01.02.2023');
    await expect(page.locator('[data-cy="arbeidsgiverperiode-0-til-dato"]')).toHaveText('15.02.2023');

    await expect(page.locator('[data-cy="tidligereinntekt"] tbody tr')).toHaveCount(3);
    await expect(page.locator('[data-cy="tidligereinntekt"] tbody tr').first().locator('td').first()).toHaveText(
      'November:'
    );
    await expect(page.locator('[data-cy="tidligereinntekt"] tbody tr').first().locator('td').last()).toHaveText(
      /88\s000,00\skr/
    );
    await expect(page.locator('[data-cy="tidligereinntekt"] tbody tr').last().locator('td').first()).toHaveText(
      'Januar:'
    );
    await expect(page.locator('[data-cy="tidligereinntekt"] tbody tr').last().locator('td').last()).toHaveText(
      /66\s000,00\skr/
    );

    await page
      .locator('role=group[name="Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?"]')
      .locator('role=radio[name="Ja"]')
      .check();
    await page
      .locator('role=group[name="Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?"]')
      .locator('role=radio[name="Nei"]')
      .check();

    await expect(
      page.locator('text="Dere vil motta en separat forespørsel om inntektsmelding for denne perioden."')
    ).toBeVisible();

    await page
      .locator('role=checkbox[name="Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige."]')
      .check();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    await page.locator('role=button[name="Send"]').click();
    // await page.waitForResponse('*/**/api/innsendingInntektsmelding');
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();

    const accessibilityScanResultsKvittering = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResultsKvittering.violations).toEqual([]);
  });
});
