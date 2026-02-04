import { test, expect } from '@playwright/test';
import inntektData from '../mockdata/inntektData.json';
import { FormPage } from './utils/formPage';

const uuid = 'b24baf59-55c9-48df-b8c1-7d93e098a95d';

test.describe('Delvis skjema - Utfylling og innsending av skjema (endret inntekt)', () => {
  test.beforeEach(async ({ page }) => {
    // stub collect beacon
    await page.route('**/collect', (r) => r.fulfill({ status: 202, body: 'OK' }));

    // stub inntektsdata
    await page.route('*/**/api/inntektsdata', (r) =>
      r.fulfill({ status: 200, body: JSON.stringify(inntektData), contentType: 'application/json' })
    );

    // stub innsending
    await page.route('*/**/api/innsendingInntektsmelding', (r) =>
      r.fulfill({ status: 201, body: JSON.stringify({ name: 'Nothing' }), contentType: 'application/json' })
    );
    // navigate to receipt page
    await page.goto(`http://localhost:3000/im-dialog/kvittering/${uuid}`);
  });

  test('Changes income and submits', async ({ page }) => {
    const formPage = new FormPage(page);
    // verify on receipt URL
    await expect(page).toHaveURL(new RegExp(`/im-dialog/kvittering/${uuid}`));

    // click first "Endre"
    await page.getByRole('button', { name: 'Endre' }).first().click();
    await page.waitForURL(`**/im-dialog/${uuid}?endre=true`);

    // adjust income
    const input = page.getByLabel('Månedslønn 02.01.2023');
    await expect(input).toHaveValue('65000');
    await input.fill('50000');

    // select refusjon=yes
    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?' })
      .getByLabel('Ja')
      .check();

    await formPage.checkRadioButton(
      'Er det endringer i refusjonsbeløpet eller skal refusjonen opphøre i perioden?',
      'Nei'
    );

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
      forespoerselId: uuid,
      agp: null,
      inntekt: {
        beloep: 50000,
        inntektsdato: '2023-01-02',
        endringAarsaker: [{ aarsak: 'Bonus' }]
      },
      refusjon: { beloepPerMaaned: 50000, sluttdato: null, endringer: [] },
      avsenderTlf: '12345678',
      naturalytelser: []
    });

    // confirm receipt page
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
    await expect(page.locator('text="12345678"')).toBeVisible();
    await expect(page.locator('text="Bonus"')).toBeVisible();
    await expect(page.locator('text="50 000,00 kr/måned"').first()).toBeVisible();
    await expect(page.locator('text="02.01.2023"')).toBeVisible();
  });
});
