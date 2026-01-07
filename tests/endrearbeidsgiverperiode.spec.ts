import { test, expect } from '@playwright/test';

const uuid = '588e055c-5d72-449b-b88f-56aa43457668';
const baseUrl = `http://localhost:3000/im-dialog/${uuid}`;

test.describe('Utfylling og innsending av skjema', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
  });

  test('can click the Endre arbeidsgiverperiode button so that egenmelding gets disabled', async ({ page }) => {
    // click override button
    await page.locator('[data-cy="endre-arbeidsgiverperiode"]').click();
    // assert info alert text
    await expect(page.locator('.navds-alert--info .navds-alert__wrapper').first()).toHaveText(
      'Hvis du overstyrer arbeidsgiverperioden er det ikke mulig å også endre eller legge til egenmeldingsperioder.'
    );
  });
});
