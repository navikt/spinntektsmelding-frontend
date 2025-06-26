import { test, expect } from '@playwright/test';
import trengerDelvis from '../mockdata/trenger-delvis-uten-bfd.json';
import { FormPage } from './utils/formPage';

test.describe('Delvis skjema – Utfylling og innsending av skjema (refusjon skjæringstidspunkt)', () => {
  test.beforeEach(async ({ page }) => {
    // stub beacon
    await page.route('**/collect', (route) => route.fulfill({ status: 202, body: 'OK' }));
    // stub hentKvittering → 404
    await page.route('*/**/api/hentKvittering/**', (route) =>
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Nothing' })
      })
    );
    // stub hent-forespoersel
    await page.route('*/**/api/hent-forespoersel/*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(trengerDelvis)
      })
    );
    // stub innsending
    await page.route('*/**/api/innsendingInntektsmelding', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Nothing' })
      })
    );
    await page.goto('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');
    await page.waitForResponse('*/**/api/hent-forespoersel/*');
  });

  test('No changes and submit', async ({ page }) => {
    const formPage = new FormPage(page);
    // select "Nei" for refusjon
    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?' })
      .getByLabel('Nei')
      .check();
    // fill phone + confirm
    await page.getByLabel('Telefon innsender').fill('12345678');
    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    // submit
    // assert payload
    const reqPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await formPage.clickButton('Send');
    const req = await reqPromise;

    expect(JSON.parse(req.postData()!)).toEqual({
      forespoerselId: '12345678-3456-5678-2457-123456789012',
      agp: null,
      inntekt: {
        beloep: 55000,
        inntektsdato: '2023-09-18',
        naturalytelser: [],
        endringAarsaker: []
      },
      refusjon: null,
      avsenderTlf: '12345678'
    });
    // confirmation page
    await page.waitForURL('/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
    // the old bfd date should not appear
    await expect(await formPage.getByText('24.01.2023')).toHaveCount(0);
    // new bfd

    await expect(page.locator('[data-cy="bestemmendefravaersdag"]')).toHaveText(/18\.09\.2023/);
  });

  test('Changes and submit', async ({ page }) => {
    const formPage = new FormPage(page);
    // click second "Endre"
    await page.getByRole('button', { name: 'Endre' }).nth(1).click();
    await page.waitForURL('**/im-dialog/12345678-3456-5678-2457-123456789012');
    // update salary
    const salary = page.getByLabel('Månedslønn 18.09.2023');
    await expect(salary).toHaveValue('55000');
    await salary.fill('60000');
    // fill phone + confirm
    await formPage.fillInput('Telefon innsender', '12345678');
    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');
    // initial submit → validation error
    await formPage.clickButton('Send');
    await expect((await formPage.getByText('Vennligst angi årsak til endringen.')).first()).toBeVisible();
    // select årsak + refusjon = Ja
    await formPage.selectOption('Velg endringsårsak', 'Bonus');
    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?' })
      .getByLabel('Ja')
      .check();
    // click second "Endre" again to set refusjonsbeløp
    await page.getByRole('button', { name: 'Endre' }).nth(1).click();
    await page.getByLabel('Oppgi refusjonsbeløpet per måned').fill('55000');
    // choose "Nei" for endringer opphør
    await page
      .getByRole('group', {
        name: 'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?'
      })
      .getByLabel('Nei')
      .check();
    // final submit
    const reqPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await formPage.clickButton('Send');
    const req2 = await reqPromise;
    // assert payload
    expect(JSON.parse(req2.postData()!)).toEqual({
      forespoerselId: '12345678-3456-5678-2457-123456789012',
      agp: null,
      inntekt: {
        beloep: 60000,
        inntektsdato: '2023-09-18',
        naturalytelser: [],
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: { beloepPerMaaned: 55000, sluttdato: null, endringer: [] },
      avsenderTlf: '12345678'
    });
    // final confirmation

    await page.waitForURL('/im-dialog/kvittering/12345678-3456-5678-2457-123456789012');
    await expect(page.locator('[data-cy="bestemmendefravaersdag"]')).toHaveText(/18\.09\.2023/);
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
    await expect(page.locator('text="Bonus"')).toBeVisible();
    await expect(page.locator('text="60 000,00 kr/måned"').first()).toBeVisible();
  });
});
