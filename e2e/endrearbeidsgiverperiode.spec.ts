import { test, expect } from '@playwright/test';

test.describe('Utfylling og innsending av skjema', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('/im-dialog/api/hentKvittering/12345678-3456-5678-2457-123456789012', (route) =>
      route.fulfill({
        status: 404,
        body: JSON.stringify({
          name: 'Nothing'
        })
      })
    );
  });

  test('can click the Endre arbeidsgiverperiode button so that egenmelding gets disabled', async ({ page }) => {
    await page.route('/im-dialog/api/hent-forespoersel', (route) =>
      route.fulfill({
        body: JSON.stringify(require('../mockdata/trenger-originalen.json'))
      })
    );

    await page.goto('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');

    await page.click('[data-cy="endre-arbeidsgiverperiode"]');
    const alertText = await page.locator('.navds-alert--info .navds-alert__wrapper').first().innerText();
    expect(alertText).toBe(
      'Hvis du overstyrer arbeidsgiverperioden er det ikke mulig å også endre eller legge til egenmeldingsperioder.'
    );
  });
});
