import { test, expect } from '@playwright/test';
import { FormPage } from './utils/formPage';

const uuid = '588e055c-5d72-449b-b88f-56aa43457668';
const baseUrl = `http://localhost:3000/im-dialog/${uuid}`;

test.describe('Refusjon endringer toggle Ja/Nei', () => {
  test.beforeEach(async ({ page }) => {
    // stub hentKvittering → 404
    await page.route('*/**/api/hentKvittering/**', (route) =>
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Nothing' })
      })
    );

    await page.route('*/**/api/innsendingInntektsmelding', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Nothing' })
      })
    );

    // navigate to form
    await page.goto(baseUrl);
  });

  test('selecting Nei removes rendered periods', async ({ page }) => {
    const formPage = new FormPage(page);

    // select full lønn in AGP
    await formPage.checkRadioButton('Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?', 'Ja');

    // select refusjon under sykefravær
    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Ja');

    // select "Ja" for changes in refusjon
    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Ja'
    );

    // verify that periode fields are visible
    await expect(page.getByRole('textbox', { name: /Endret beløp\/måned/i })).toBeVisible();

    // select "Nei" for changes in refusjon
    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Nei'
    );

    // verify that periode fields are no longer visible
    await expect(page.getByRole('textbox', { name: /Endret beløp\/måned/i })).not.toBeVisible();
  });

  test('switching back to Ja re-adds a single empty row', async ({ page }) => {
    const formPage = new FormPage(page);

    // select full lønn in AGP
    await formPage.checkRadioButton('Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?', 'Ja');

    // select refusjon under sykefravær
    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Ja');

    // select "Ja" for changes in refusjon
    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Ja'
    );

    // verify that one periode field is visible
    const beloepInputs = page.getByRole('textbox', { name: /Endret beløp\/måned/i });
    await expect(beloepInputs).toHaveCount(1);

    // select "Nei" for changes in refusjon
    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Nei'
    );

    // verify that periode fields are no longer visible
    await expect(page.getByRole('textbox', { name: /Endret beløp\/måned/i })).not.toBeVisible();

    // select "Ja" again for changes in refusjon
    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Ja'
    );

    // verify that one empty periode field is visible again
    await expect(page.getByRole('textbox', { name: /Endret beløp\/måned/i })).toHaveCount(1);
  });

  test('selecting Nei allows submission without periode fields', async ({ page }) => {
    // select full lønn in AGP
    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?' })
      .getByLabel('Ja')
      .check();

    // select refusjon under sykefravær
    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?' })
      .getByLabel('Ja')
      .check();

    // select "Nei" for changes in refusjon (no need to select Ja first)
    const refusjonGroup = page.getByRole('group', {
      name: /Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?/
    });
    await refusjonGroup.getByRole('radio', { name: 'Nei' }).check();

    // confirm checkbox
    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    // submit
    const reqPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await page.getByRole('button', { name: 'Send' }).click();
    const req = await reqPromise;

    // Verify that innsending was successful
    expect(req.postData()).toBeDefined();
  });
});
