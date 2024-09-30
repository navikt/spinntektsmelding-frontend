import { test, expect, selectors } from '@playwright/test';

test.describe('Utfylling av skjema - ingen arbeidsgiverperiode', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('*/**/api/hentKvittering/8d50ef20-37b5-4829-ad83-56219e70b375', (route) =>
      route.fulfill({
        status: 404,
        body: JSON.stringify({ name: 'Nothing' })
      })
    );

    selectors.setTestIdAttribute('data-cy');
  });

  test('can check the "Det er ikke arbeidsgiverperiode" and verify that everything is OK', async ({ page }) => {
    await page.route('*/**/api/hent-forespoersel', (route) =>
      route.fulfill({
        // status: 200,
        // path: '../mockdata/trenger-originalen.json'
        // route.fulfill({
        body: JSON.stringify(require('../mockdata/trenger-originalen.json'))
        // })
      })
    );

    await page.goto('http://localhost:3000/im-dialog/8d50ef20-37b5-4829-ad83-56219e70b375');

    await expect(
      page.getByRole('group', { name: /Betaler arbeidsgiver lønn og krever refusjon i sykefraværet/ })
    ).not.toBeVisible();
    await expect(
      page.getByRole('group', { name: /Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden/ })
    ).toBeVisible();

    await page
      .getByRole('group', { name: /Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden?/ })
      .getByRole('radio', { name: 'Ja' })
      .click();

    await expect(page.getByText(/Refusjon til arbeidsgiver i sykefraværet/)).not.toBeVisible();
    await expect(page.getByText(/Refusjon til arbeidsgiver etter arbeidsgiverperiode/)).toBeVisible();

    // await page.getByTestId('endre-arbeidsgiverperiode').click();
    await page.getByRole('button', { name: /Endre/ }).nth(1).click();
    await page.getByRole('checkbox', { name: /Det er ikke arbeidsgiverperiode/ }).check();

    await expect(page.getByLabel('Velg begrunnelse')).toBeVisible();
    // await expect(page.getByRole('option', { name: /Velg begrunnelse/ })).toBeVisible();

    await page
      .getByRole('group', { name: /Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden/ })
      .getByRole('radio', { name: 'Ja' })
      .isDisabled();

    await expect(
      page.getByRole('group', { name: /Betaler arbeidsgiver lønn og krever refusjon i sykefraværet/ })
    ).toBeVisible();
    await expect(
      page.getByRole('group', { name: /Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden/ })
    ).not.toBeVisible();

    await page
      .getByRole('group', { name: /Betaler arbeidsgiver lønn og krever refusjon i sykefraværet?/ })
      .getByRole('radio', { name: 'Ja' })
      .click();

    await expect(page.getByText(/Refusjon til arbeidsgiver i sykefraværet/)).toBeVisible();
    await expect(page.getByText(/Refusjon til arbeidsgiver etter arbeidsgiverperioden/)).not.toBeVisible();

    await expect(
      page.getByText(
        /Hvis du overstyrer arbeidsgiverperioden er det ikke mulig å også endre eller legge til egenmeldingsperioder./
      )
    ).toBeVisible();

    await expect(page.getByRole('button', { name: /Endre/ }).first()).toBeDisabled();

    await page.getByRole('checkbox', { name: /Det er ikke arbeidsgiverperiode/ }).click();

    await page
      .getByRole('group', { name: /Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden/ })
      .getByRole('radio', { name: 'Ja' })
      .isEnabled();

    await expect(
      page.getByRole('group', { name: /Betaler arbeidsgiver lønn og krever refusjon i sykefraværet/ })
    ).not.toBeVisible();
    await expect(
      page.getByRole('group', { name: /Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden/ })
    ).toBeVisible();

    await expect(
      page
        .getByRole('group', { name: /Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden/ })
        .getByRole('radio', { name: 'Ja' })
    ).not.toBeChecked();
    await expect(
      page
        .getByRole('group', { name: /Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden/ })
        .getByRole('radio', { name: 'Nei' })
    ).not.toBeChecked();

    await expect(page.getByTestId('arbeidsgiverperiode-0-fra-dato')).toHaveText('17.02.2023');
    await expect(page.getByTestId('arbeidsgiverperiode-0-til-dato')).toHaveText('04.03.2023');
  });
});
