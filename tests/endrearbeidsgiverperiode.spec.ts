import { test, expect } from '@playwright/test';
import originalData from '../mockdata/trenger-originalen.json';
import { FormPage } from './utils/formPage';

const uuid = '12345678-3456-5678-2457-123456789012';
const baseUrl = `http://localhost:3000/im-dialog/${uuid}`;

test.describe('Utfylling og innsending av skjema', () => {
  test.beforeEach(async ({ page }) => {
    // stub hentKvittering → 404
    await page.route('*/**/api/hentKvittering/**', (route) =>
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Nothing' })
      })
    );
    // stub hent-forespoersel → fixture
    await page.route('**/im-dialog/api/hent-forespoersel/*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(originalData)
      })
    );
    // navigate to form
    await page.goto(baseUrl);
  });

  test('can click the Endre arbeidsgiverperiode button so that egenmelding gets disabled', async ({ page }) => {
    const formPage = new FormPage(page);
    // wait for data
    await page.waitForResponse('*/**/api/hent-forespoersel/*');
    // click override button
    await page.locator('[data-cy="endre-arbeidsgiverperiode"]').click();
    // assert info alert text
    await expect(page.locator('.navds-alert--info .navds-alert__wrapper').first()).toHaveText(
      'Hvis du overstyrer arbeidsgiverperioden er det ikke mulig å også endre eller legge til egenmeldingsperioder.'
    );
  });
});
