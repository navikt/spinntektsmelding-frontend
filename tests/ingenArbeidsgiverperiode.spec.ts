import { test, expect } from '@playwright/test';
import originalData from '../mockdata/trenger-originalen.json';
import { FormPage } from './utils/formPage';

const uuid = '8d50ef20-37b5-4829-ad83-56219e70b375';
const baseUrl = `http://localhost:3000/im-dialog/${uuid}`;

test.describe('Utfylling av skjema – ingen arbeidsgiverperiode', () => {
  test.beforeEach(async ({ page }) => {
    // stub hentKvittering → 404
    await page.route('*/**/api/hentKvittering/**', (r) =>
      r.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ name: 'Nothing' }) })
    );
    // stub forespørsel
    await page.route('*/**/api/hent-forespoersel/*', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(originalData) })
    );
    // navigate
    const response = page.waitForResponse('*/**/api/hent-forespoersel/*');
    await page.goto(baseUrl);
    await response;
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

    // await formPage.uncheckCheckbox('Det er ikke arbeidsgiverperiode i dette sykefraværet');
    // // uncheck override
    // // full lønn radios now enabled and none selected
    // const fullLonn = page.getByRole('group', { name: /Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden/ });
    // await expect(fullLonn.getByRole('radio', { name: 'Ja' })).toBeEnabled();
    // await expect(fullLonn.getByRole('radio', { name: 'Ja' })).not.toBeChecked();
    // await expect(fullLonn.getByRole('radio', { name: 'Nei' })).not.toBeChecked();

    // // original arbeidsgiverperiode dates
    // await expect(page.locator('[data-cy="arbeidsgiverperiode-0-fra-dato"]')).toHaveText('17.02.2023');
    // await expect(page.locator('[data-cy="arbeidsgiverperiode-0-til-dato"]')).toHaveText('04.03.2023');
    // Submit and confirm

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
