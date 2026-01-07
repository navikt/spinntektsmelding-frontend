import { test, expect } from '@playwright/test';
import { FormPage } from './utils/formPage';

const uuid = '588e055c-5d72-449b-b88f-56aa43457668';
const baseUrl = `http://localhost:3000/im-dialog/${uuid}`;

test.describe('Utfylling av skjema – ingen arbeidsgiverperiode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
  });

  test('Det er ikke arbeidsgiverperiode toggle works', async ({ page }) => {
    const formPage = new FormPage(page);
    // select “Ja” under sykefravær
    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?' })
      .getByLabel('Ja')
      .check();
    // initial refund texts
    await expect(page.getByText('Refusjon til arbeidsgiver i sykefraværet')).toHaveCount(0);
    await expect(page.getByText('Refusjon til arbeidsgiver etter arbeidsgiverperiode')).toBeVisible();

    // override arbeidsgiverperiode
    await page.locator('[data-cy="endre-arbeidsgiverperiode"]').click();
    await formPage.checkCheckbox('Det er ikke arbeidsgiverperiode');
    // await page.getByRole('checkbox', { name: /Det er ikke arbeidsgiverperiode/ }).check();

    // reason dropdown
    await expect(page.getByText('Velg begrunnelse').first()).toBeVisible();
    // await expect(page.getByRole('option', { name: /Velg begrunnelse/ })).toBeVisible();

    // full lønn radio disabled
    await expect(
      page
        .getByRole('group', { name: /Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden/ })
        .getByRole('radio', { name: 'Ja' })
    ).toBeDisabled();

    // refund groups
    await expect(
      page.getByRole('group', { name: /Betaler arbeidsgiver lønn og krever refusjon under sykefraværet/ })
    ).toBeVisible();
    await expect(
      page.getByRole('group', { name: /Betaler arbeidsgiver lønn og krever refusjon etter arbeidsgiverperioden/ })
    ).toHaveCount(0);

    // re-enable sykefraværsrefund
    await page
      .getByRole('group', { name: /Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?/ })
      .getByLabel('Ja')
      .click();
    await expect(page.getByText('Refusjon til arbeidsgiver i sykefraværet')).toBeVisible();
    await expect(page.getByText('Refusjon til arbeidsgiver etter arbeidsgiverperiode')).toHaveCount(0);

    // alert and button disabled
    await expect(
      page.getByText(
        'Hvis du overstyrer arbeidsgiverperioden er det ikke mulig å også endre eller legge til egenmeldingsperioder.'
      )
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /Endre/ }).first()).toBeDisabled();

    await formPage.selectOption('Velg begrunnelse', 'Det er ikke fire ukers opptjeningstid');

    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Nei'
    );

    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');

    const pageLoad = page.waitForResponse('*/**/api/innsendingInntektsmelding');
    await page.getByRole('button', { name: 'Send' }).click();
    await pageLoad;
    // await expect(page.getByText('Kvittering - innsendt inntektsmelding')).toBeVisible();
    await expect(page.locator("h2:has-text('Kvittering - innsendt inntektsmelding')")).toBeVisible();
  });
});
