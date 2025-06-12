import { test, expect } from '@playwright/test';
import trengerDelvis from '../mockdata/trenger-delvis.json';
import inntektData from '../mockdata/inntektData.json';
import kvitteringData from '../mockdata/kvittering-delvis.json';
import { FormPage } from './utils/formPage';

test.describe('Delvis skjema - Utfylling og innsending av skjema', () => {
  test.beforeEach(async ({ page }) => {
    // stub collect beacon
    await page.route('**/collect', (r) => r.fulfill({ status: 202, body: 'OK' }));
    // stub initial API calls
    trengerDelvis.erBesvart = true;
    await page.route('*/**/api/hent-forespoersel/*', (r) =>
      r.fulfill({ status: 200, body: JSON.stringify(trengerDelvis), contentType: 'application/json' })
    );
    await page.route('*/**/api/inntektsdata', (r) =>
      r.fulfill({ status: 200, body: JSON.stringify(inntektData), contentType: 'application/json' })
    );
    await page.route('*/**/api/hentKvittering/**', (r) =>
      r.fulfill({ status: 200, body: JSON.stringify(kvitteringData), contentType: 'application/json' })
    );
    await page.route('*/**/api/innsendingInntektsmelding', (r) =>
      r.fulfill({ status: 201, body: JSON.stringify({ name: 'Nothing' }), contentType: 'application/json' })
    );
    // navigate to receipt page
    await page.goto('http://localhost:3000/im-dialog/12345678-3456-5678-2457-123456789012');
    await page.waitForResponse('*/**/api/hent-forespoersel/*');
  });

  test('Changes and submit', async ({ page }) => {
    const formPage = new FormPage(page);
    // verify on receipt page
    await page.waitForResponse('*/**/api/hentKvittering/12345678-3456-5678-2457-123456789012');
    await expect(page).toHaveURL(/\/im-dialog\/kvittering\/12345678/);
    // click first "Endre"
    await page.getByRole('button', { name: /Endre/ }).first().click();
    await page.waitForURL('**/im-dialog/12345678-3456-5678-2457-123456789012');

    // update income to 50000
    await page.getByRole('button', { name: /Endre/ }).nth(1).click();

    await expect(page.locator('label:text("Månedslønn 02.01.2023")')).toHaveValue('65000');
    await formPage.fillInput('Månedslønn 02.01.2023', '50000');

    // select change reason
    await formPage.selectOption('Velg endringsårsak', 'Bonus');

    // choose refusjon = Ja
    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Ja');

    // confirm phone and checkbox
    await expect(page.getByLabel('Telefon innsender')).toHaveValue('12345678');

    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');

    // click second "Endre"
    await page.getByRole('button', { name: /Endre/ }).nth(1).click();
    // set refusjonsbeløp
    await formPage.fillInput('Oppgi refusjonsbeløpet per måned', '50000');

    // submit
    const reqPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await formPage.clickButton('Send');
    const req = await reqPromise;
    const body = JSON.parse(req.postData()!);
    expect(body).toEqual({
      forespoerselId: '12345678-3456-5678-2457-123456789012',
      agp: null,
      inntekt: {
        beloep: 50000,
        inntektsdato: '2023-01-02',
        naturalytelser: [],
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: { beloepPerMaaned: 50000, sluttdato: null, endringer: [] },
      avsenderTlf: '12345678'
    });

    // confirmation page
    await expect(page.locator('[data-cy="bestemmendefravaersdag"]')).toHaveText(/02.01.2023/);
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
    await expect(page.locator('text="12345678"')).toBeVisible();
    await expect(page.locator('text="Bonus"')).toBeVisible();
    await expect(page.locator('text="50 000,00 kr/måned"').first()).toBeVisible();
    // await expect(page.locator('text="02.01.2023"')).toBeVisible();
  });
});
