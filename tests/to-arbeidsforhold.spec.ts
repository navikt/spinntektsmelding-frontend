import { test, expect } from '@playwright/test';

const uuid = '342dfa81-c05e-4477-9214-d007c403b60a';
const baseUrl = `http://localhost:3000/im-dialog/${uuid}`;

test.describe('Utfylling og innsending av skjema – to arbeidsforhold', () => {
  test.beforeEach(async ({ page }) => {
    // stub innsendingInntektsmelding
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

  test('can check the radioboxes for refusjon and submit', async ({ page }) => {
    // fill phone
    await page.getByLabel('Telefon innsender').fill('12345678');

    // select full lønn under AGP
    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?' })
      .getByLabel('Ja')
      .check();
    // select refusjon under sykefravær = Nei
    await page
      .getByRole('group', { name: 'Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?' })
      .getByLabel('Nei')
      .check();

    // confirm
    await page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();

    // submit

    // assert request payload
    const reqPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await page.getByRole('button', { name: 'Send' }).click();
    const req = await reqPromise;
    const body = JSON.parse(req.postData()!);
    expect(body).toEqual({
      forespoerselId: uuid,
      agp: {
        perioder: [{ fom: '2023-09-04', tom: '2023-09-19' }],
        redusertLoennIAgp: null
      },
      inntekt: {
        beloep: 45000,
        inntektsdato: '2023-08-23',
        endringAarsaker: []
      },
      refusjon: null,
      avsenderTlf: '12345678',
      naturalytelser: []
    });

    // verify receipt page
    await expect(page).toHaveURL(`/im-dialog/kvittering/${uuid}?fromSubmit=true`);
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
    await expect(page.locator('text="Sykmelding"')).toBeVisible();

    // check bfd date
    await expect(page.locator('[data-cy="bestemmendefravaersdag"]')).toHaveText(/23\.08\.2023/);
  });
});
