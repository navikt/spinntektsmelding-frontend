import { test, expect } from '@playwright/test';
import inntektData from '../mockdata/inntektData.json';
import { FormPage } from './utils/formPage';

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
    const formPage = new FormPage(page);
    // should redirect to receipt page
    await expect(page).toHaveURL(`/im-dialog/kvittering/${uuid}`);

    // click "sende den inn på nytt."
    await page.getByRole('link', { name: 'sende den inn på nytt.' }).click();
    await page.waitForURL(`**/im-dialog/${uuid}/overskriv`);

    // select full lønn = Ja
    await formPage.checkRadioButton('Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?', 'Ja');

    // select refusjon under sykefravær = Nei
    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Nei');

    // confirm
    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');

    // submit

    // assert request payload
    const req = await formPage.submitAndWaitForRequest('*/**/api/innsendingInntektsmelding');
    const body = JSON.parse(req.postData()!);
    expect(body).toEqual({
      forespoerselId: uuid,
      agp: {
        perioder: [
          { fom: '2023-02-20', tom: '2023-03-04' },
          { fom: '2023-03-15', tom: '2023-03-17' }
        ],
        redusertLoennIAgp: null
      },
      inntekt: {
        beloep: 77000,
        inntektsdato: '2023-03-15',
        endringAarsaker: []
      },
      refusjon: null,
      avsenderTlf: '12345678',
      naturalytelser: [],
      flereArbeidsforhold: null
    });

    // final confirmation
    await page.waitForURL(`/im-dialog/kvittering/${uuid}?fromSubmit=true`, { timeout: 15000 });
    await expect(page.locator('text="Kvittering - innsendt inntektsmelding"')).toBeVisible();
    await expect(page.locator('text="12345678"')).toBeVisible();
  });
});
