import { test, expect } from '@playwright/test';
// import hentForespoersel from '../mockdata/trenger-originalen-16dager-innsendt.json';
import inntektData from '../mockdata/inntektData.json';

test.describe('Delvis skjema – Innlogging fra ekstern kvittering', () => {
  const uuid = '66f1188a-5cb7-4741-bd60-c9070835633c';
  const baseUrl = `http://localhost:3000/im-dialog/kvittering/${uuid}`;

  test.beforeEach(async ({ page }) => {
    // stub collect beacon
    await page.route('**/collect', (r) => r.fulfill({ status: 202, body: 'OK' }));

    // stub inntektsdata
    await page.route('**/inntektsdata', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(inntektData) })
    );
    // stub innsending
    await page.route('**/innsendingInntektsmelding', (r) =>
      r.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ name: 'Nothing' }) })
    );
    // Note: kvittering SSR data is mocked by MSW in __mocks__/handlers.js

    await page.goto(baseUrl);
  });

  test('Changes and submit', async ({ page }) => {
    // should redirect to receipt page
    await expect(page).toHaveURL(`/im-dialog/kvittering/${uuid}`);

    // click "sende den inn på nytt."
    await page.getByRole('link', { name: 'sende den inn på nytt.' }).click();
    await page.waitForURL(`**/im-dialog/${uuid}/overskriv`);

    // select full lønn = Ja
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
        perioder: [
          { fom: '2023-02-20', tom: '2023-03-04' },
          { fom: '2023-03-15', tom: '2023-03-17' }
        ],
        egenmeldinger: [],
        redusertLoennIAgp: null
      },
      inntekt: {
        beloep: 77000,
        inntektsdato: '2023-03-15',
        endringAarsaker: []
      },
      refusjon: null,
      avsenderTlf: '12345678',
      naturalytelser: []
    });

    // final confirmation
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
    await expect(page.locator('text="12345678"')).toBeVisible();
  });
});
