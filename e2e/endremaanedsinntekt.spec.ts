import { test, expect } from '@playwright/test';
import clickSubmit from './helpers/clickSubmit';
import checkRadiobox from './helpers/checkRadiobox';

test.describe('Utfylling og innsending av skjema', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('*/**/api/hentKvittering/12345678-3456-5678-2457-123456789012', (route) =>
      route.fulfill({
        status: 404,
        body: JSON.stringify({ name: 'Nothing' })
      })
    );
  });

  test('can check the radioboxes for refusjon and submit', async ({ page }) => {
    await page.route('*/**/api/hent-forespoersel', (route) =>
      route.fulfill({
        body: JSON.stringify(require('../mockdata/trenger-originalen.json'))
      })
    );

    await page.goto('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');

    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?' })
      .getByLabel('Ja')
      .check();

    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?' })
      .getByLabel('Ja')
      .check();

    await checkRadiobox(page, 'Opphører refusjonkravet i perioden?', 'Nei');

    await page.click('[data-cy="endre-beloep"]');

    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    await page.locator('[data-cy="inntekt-beloep-input"]').clear();
    await page.locator('[data-cy="inntekt-beloep-input"]').fill('70000kroner');

    await clickSubmit(page);

    // await expect(page.getByText('Vennligst angi bruttoinntekt på formatet 1234,50')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Vennligst angi bruttoinntekt på formatet 1234,50' })).toBeVisible();

    // await expect(page.getByText('Vennligst angi årsak for endringen.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Vennligst angi årsak for endringen.' })).toBeVisible();

    await page.locator('[data-cy="inntekt-beloep-input"]').clear();
    await page.locator('[data-cy="inntekt-beloep-input"]').fill('70000');

    // await expect(page.getByText('Vennligst angi bruttoinntekt på formatet 1234,50')).toHaveCount(0);
    await expect(
      page.getByRole('link', { name: 'Vennligst angi bruttoinntekt på formatet 1234,50' })
    ).not.toBeVisible();

    await expect(page.locator('[data-cy="refusjon-arbeidsgiver-beloep"]')).toHaveText(/70\s000,00\skr/);

    await page.locator('[data-cy="endre-refusjon-arbeidsgiver-beloep"]').click();

    await page.locator('[data-cy="inntekt-beloep-input"]').clear();
    await page.locator('[data-cy="inntekt-beloep-input"]').fill('75000');

    await expect(page.locator('[data-cy="refusjon-arbeidsgiver-beloep-input"]')).toHaveValue('75000');

    // await expect(page.locator('h2').first()).toHaveText('Kvittering - innsendt inntektsmelding');
  });
});
