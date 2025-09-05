import { test, expect } from '@playwright/test';
import trengerDelvis from '../mockdata/trenger-delvis.json';
import inntektData from '../mockdata/inntektData.json';
import kvitteringData from '../mockdata/kvittering-delvis-endret-inntekt.json';

test.describe('Delvis skjema - Utfylling og innsending av skjema (endret inntekt)', () => {
  test.beforeEach(async ({ page }) => {
    // stub collect beacon
    await page.route('**/collect', (r) => r.fulfill({ status: 202, body: 'OK' }));
    // stub hent-forespoersel
    trengerDelvis.erBesvart = true;
    await page.route('*/**/api/hent-forespoersel/*', (r) =>
      r.fulfill({ status: 200, body: JSON.stringify(trengerDelvis), contentType: 'application/json' })
    );
    // stub inntektsdata
    await page.route('*/**/api/inntektsdata', (r) =>
      r.fulfill({ status: 200, body: JSON.stringify(inntektData), contentType: 'application/json' })
    );
    // stub hentKvittering
    await page.route('*/**/api/hentKvittering/**', (r) =>
      r.fulfill({ status: 200, body: JSON.stringify(kvitteringData), contentType: 'application/json' })
    );
    // stub innsending
    await page.route('*/**/api/innsendingInntektsmelding', (r) =>
      r.fulfill({ status: 201, body: JSON.stringify({ name: 'Nothing' }), contentType: 'application/json' })
    );
    // navigate to receipt page
    const response = page.waitForResponse('**/hentKvittering/**');
    await page.goto('http://localhost:3000/im-dialog/kvittering/8d50ef20-37b5-4829-ad83-56219e70b375');
    await response;
  });

  test('Changes income and submits', async ({ page }) => {
    // verify on receipt URL
    await expect(page).toHaveURL(/\/im-dialog\/kvittering\/8d50ef20-37b5-4829-ad83-56219e70b375/);

    // click first "Endre"
    await page.getByRole('button', { name: 'Endre' }).first().click();
    await page.waitForURL('**/im-dialog/8d50ef20-37b5-4829-ad83-56219e70b375');

    // adjust income
    const input = page.getByLabel('Månedslønn 02.01.2023');
    await expect(input).toHaveValue('65000');
    await input.fill('50000');

    // select refusjon=yes
    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?' })
      .getByLabel('Ja')
      .check();

    // confirm phone and checkbox
    await expect(page.getByLabel('Telefon innsender')).toHaveValue('12345678');
    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    // click second "Endre"
    await page.getByRole('button', { name: 'Endre' }).nth(1).click();

    // set refusjonsbeløp
    await page.getByLabel('Oppgi refusjonsbeløpet per måned').fill('50000');

    // submit form
    const reqPromise = page.waitForResponse('*/**/api/innsendingInntektsmelding');
    await page.getByRole('button', { name: 'Send' }).click();
    const req = await reqPromise;

    const body = JSON.parse(req.request().postData()!);
    expect(body).toEqual({
      forespoerselId: '8d50ef20-37b5-4829-ad83-56219e70b375',
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

    // confirm receipt page
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
    await expect(page.locator('text="12345678"')).toBeVisible();
    await expect(page.locator('text="Bonus"')).toBeVisible();
    await expect(page.locator('text="50 000,00 kr/måned"').first()).toBeVisible();
    await expect(page.locator('text="02.01.2023"')).toBeVisible();
  });
});
